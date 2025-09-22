import pandas as pd
import time
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from exchange_client import OKExClient
from technical_analysis import TechnicalAnalyzer
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Position:
    """持仓记录"""
    def __init__(self, symbol: str, side: str, amount: float, entry_price: float, timestamp: datetime):
        self.symbol = symbol
        self.side = side  # 'buy' or 'sell'
        self.amount = amount
        self.entry_price = entry_price
        self.timestamp = timestamp
        self.exit_price = None
        self.exit_timestamp = None
        self.profit = 0.0
        self.status = 'open'  # 'open', 'closed'
    
    def close_position(self, exit_price: float, exit_timestamp: datetime):
        """平仓"""
        self.exit_price = exit_price
        self.exit_timestamp = exit_timestamp
        self.status = 'closed'
        
        if self.side == 'buy':
            self.profit = (exit_price - self.entry_price) * self.amount
        else:
            self.profit = (self.entry_price - exit_price) * self.amount

class TradingStrategy:
    """交易策略类"""
    
    def __init__(self):
        self.client = OKExClient()
        self.analyzer = TechnicalAnalyzer()
        self.positions: List[Position] = []
        self.balance_history = []
        self.trade_history = []
        self.last_update = None
        
    def get_account_summary(self) -> Dict:
        """获取账户摘要"""
        balance = self.client.get_balance()
        
        open_positions = [p for p in self.positions if p.status == 'open']
        closed_positions = [p for p in self.positions if p.status == 'closed']
        
        total_profit = sum(p.profit for p in closed_positions)
        
        return {
            'balance': balance,
            'open_positions': len(open_positions),
            'closed_positions': len(closed_positions),
            'total_profit': total_profit,
            'total_trades': len(self.positions)
        }
    
    def check_risk_management(self, symbol: str, current_price: float) -> List[Position]:
        """风险管理检查"""
        positions_to_close = []
        
        for position in self.positions:
            if position.status != 'open' or position.symbol != symbol:
                continue
            
            # 计算当前盈亏
            if position.side == 'buy':
                pnl_percent = (current_price - position.entry_price) / position.entry_price
            else:
                pnl_percent = (position.entry_price - current_price) / position.entry_price
            
            # 获取币种特定的止损止盈参数
            if position.symbol in Config.SYMBOL_PARAMS:
                stop_loss = Config.SYMBOL_PARAMS[position.symbol]['stop_loss']
                take_profit = Config.SYMBOL_PARAMS[position.symbol]['take_profit']
            else:
                stop_loss = Config.STOP_LOSS_PERCENT
                take_profit = Config.TAKE_PROFIT_PERCENT
            
            # 止损检查
            if pnl_percent <= -stop_loss:
                logger.info(f"触发止损: {position.symbol} {position.side} 亏损 {pnl_percent:.2%}")
                positions_to_close.append(position)
            
            # 止盈检查
            elif pnl_percent >= take_profit:
                logger.info(f"触发止盈: {position.symbol} {position.side} 盈利 {pnl_percent:.2%}")
                positions_to_close.append(position)
        
        return positions_to_close
    
    def execute_trade(self, symbol: str, side: str, amount: float, price: Optional[float] = None) -> bool:
        """执行交易"""
        try:
            if side == 'buy':
                order = self.client.place_buy_order(symbol, amount, price)
            else:
                order = self.client.place_sell_order(symbol, amount, price)
            
            if order and 'id' in order:
                # 记录交易
                position = Position(
                    symbol=symbol,
                    side=side,
                    amount=amount,
                    entry_price=order.get('price', price or 0),
                    timestamp=datetime.now()
                )
                self.positions.append(position)
                
                trade_record = {
                    'timestamp': datetime.now(),
                    'symbol': symbol,
                    'side': side,
                    'amount': amount,
                    'price': order.get('price', price or 0),
                    'order_id': order['id']
                }
                self.trade_history.append(trade_record)
                
                logger.info(f"交易执行成功: {side} {amount} {symbol} @ {order.get('price', price)}")
                return True
            
        except Exception as e:
            logger.error(f"执行交易失败: {e}")
        
        return False
    
    def close_position(self, position: Position, current_price: float) -> bool:
        """平仓"""
        try:
            # 执行反向交易
            opposite_side = 'sell' if position.side == 'buy' else 'buy'
            success = self.execute_trade(position.symbol, opposite_side, position.amount)
            
            if success:
                position.close_position(current_price, datetime.now())
                logger.info(f"平仓成功: {position.symbol} 盈亏: {position.profit:.2f}")
                return True
                
        except Exception as e:
            logger.error(f"平仓失败: {e}")
        
        return False
    
    def run_strategy(self, symbol: str = None) -> Dict:
        """运行交易策略"""
        if symbol is None:
            symbol = Config.DEFAULT_SYMBOL
        
        try:
            # 获取市场数据
            df = self.client.get_kline_data(symbol, '1h', 100)
            if df.empty:
                return {'status': 'error', 'message': '无法获取市场数据'}
            
            ticker = self.client.get_ticker(symbol)
            if not ticker:
                return {'status': 'error', 'message': '无法获取实时价格'}
            
            current_price = ticker['price']
            
            # 技术分析
            buy_signal, sell_signal, analysis = self.analyzer.get_buy_sell_signals(df, symbol)
            
            # 风险管理检查
            positions_to_close = self.check_risk_management(symbol, current_price)
            for position in positions_to_close:
                self.close_position(position, current_price)
            
            # 计算可用资金
            balance = self.client.get_balance()
            usdt_balance = balance.get('USDT', 0) if balance else 0
            
            # 计算当前持仓
            open_long_positions = [p for p in self.positions if p.status == 'open' and p.side == 'buy' and p.symbol == symbol]
            open_short_positions = [p for p in self.positions if p.status == 'open' and p.side == 'sell' and p.symbol == symbol]
            
            # 交易逻辑
            trade_executed = False
            
            # 买入信号
            if (buy_signal and 
                len(open_long_positions) < Config.MAX_POSITIONS and 
                usdt_balance >= Config.TRADE_AMOUNT):
                
                amount_to_buy = Config.TRADE_AMOUNT / current_price
                if self.execute_trade(symbol, 'buy', amount_to_buy):
                    trade_executed = True
                    logger.info(f"执行买入信号: {symbol} @ {current_price}")
            
            # 卖出信号（平多仓）
            if sell_signal and open_long_positions:
                for position in open_long_positions:
                    if self.close_position(position, current_price):
                        trade_executed = True
                        logger.info(f"执行卖出信号: {symbol} @ {current_price}")
            
            # 更新时间
            self.last_update = datetime.now()
            
            return {
                'status': 'success',
                'symbol': symbol,
                'current_price': current_price,
                'buy_signal': buy_signal,
                'sell_signal': sell_signal,
                'trade_executed': trade_executed,
                'analysis': analysis,
                'open_positions': len([p for p in self.positions if p.status == 'open']),
                'balance': usdt_balance,
                'last_update': self.last_update
            }
            
        except Exception as e:
            logger.error(f"策略运行失败: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def get_performance_stats(self) -> Dict:
        """获取策略表现统计"""
        closed_positions = [p for p in self.positions if p.status == 'closed']
        
        if not closed_positions:
            return {
                'total_trades': 0,
                'win_rate': 0,
                'total_profit': 0,
                'avg_profit': 0,
                'max_profit': 0,
                'max_loss': 0
            }
        
        profits = [p.profit for p in closed_positions]
        winning_trades = [p for p in closed_positions if p.profit > 0]
        
        return {
            'total_trades': len(closed_positions),
            'win_rate': len(winning_trades) / len(closed_positions) * 100,
            'total_profit': sum(profits),
            'avg_profit': sum(profits) / len(profits),
            'max_profit': max(profits),
            'max_loss': min(profits),
            'winning_trades': len(winning_trades),
            'losing_trades': len(closed_positions) - len(winning_trades)
        }