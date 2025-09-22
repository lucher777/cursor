"""
风险管理模块
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from config import Config

logger = logging.getLogger(__name__)

class RiskManager:
    """风险管理器"""
    
    def __init__(self):
        self.daily_loss_limit = Config.TRADE_AMOUNT * 5  # 日亏损限制
        self.daily_trades_limit = 20  # 日交易次数限制
        self.max_drawdown = 0.10  # 最大回撤10%
        
        self.daily_stats = {
            'date': datetime.now().date(),
            'trades_count': 0,
            'total_loss': 0.0,
            'total_profit': 0.0
        }
        
        self.account_peak = 0.0  # 账户资金峰值
        
    def reset_daily_stats(self):
        """重置日统计"""
        current_date = datetime.now().date()
        if self.daily_stats['date'] != current_date:
            logger.info("重置日统计数据")
            self.daily_stats = {
                'date': current_date,
                'trades_count': 0,
                'total_loss': 0.0,
                'total_profit': 0.0
            }
    
    def can_trade(self, trade_amount: float, current_balance: float) -> Dict:
        """检查是否可以交易"""
        self.reset_daily_stats()
        
        # 检查项目列表
        checks = {
            'daily_loss_limit': True,
            'daily_trades_limit': True,
            'max_drawdown': True,
            'sufficient_balance': True,
            'position_limit': True
        }
        
        reasons = []
        
        # 1. 检查日亏损限制
        if abs(self.daily_stats['total_loss']) >= self.daily_loss_limit:
            checks['daily_loss_limit'] = False
            reasons.append(f"达到日亏损限制: ${abs(self.daily_stats['total_loss']):.2f}")
        
        # 2. 检查日交易次数限制
        if self.daily_stats['trades_count'] >= self.daily_trades_limit:
            checks['daily_trades_limit'] = False
            reasons.append(f"达到日交易次数限制: {self.daily_stats['trades_count']}")
        
        # 3. 检查最大回撤
        if self.account_peak > 0:
            current_drawdown = (self.account_peak - current_balance) / self.account_peak
            if current_drawdown > self.max_drawdown:
                checks['max_drawdown'] = False
                reasons.append(f"超过最大回撤限制: {current_drawdown:.2%}")
        
        # 4. 检查余额是否充足
        if current_balance < trade_amount * 1.1:  # 留10%缓冲
            checks['sufficient_balance'] = False
            reasons.append(f"余额不足: ${current_balance:.2f} < ${trade_amount * 1.1:.2f}")
        
        # 更新账户峰值
        if current_balance > self.account_peak:
            self.account_peak = current_balance
        
        can_trade = all(checks.values())
        
        return {
            'can_trade': can_trade,
            'checks': checks,
            'reasons': reasons,
            'daily_stats': self.daily_stats.copy()
        }
    
    def record_trade(self, profit: float):
        """记录交易结果"""
        self.reset_daily_stats()
        
        self.daily_stats['trades_count'] += 1
        
        if profit > 0:
            self.daily_stats['total_profit'] += profit
        else:
            self.daily_stats['total_loss'] += profit
        
        logger.info(f"记录交易: 盈亏=${profit:.2f}, 日交易次数={self.daily_stats['trades_count']}")
    
    def get_position_size(self, current_balance: float, risk_per_trade: float = 0.02) -> float:
        """计算仓位大小"""
        # 基于风险百分比计算仓位
        risk_amount = current_balance * risk_per_trade
        
        # 不超过配置的交易金额
        position_size = min(risk_amount, Config.TRADE_AMOUNT)
        
        # 最小交易金额
        min_trade_amount = 10.0
        position_size = max(position_size, min_trade_amount)
        
        return position_size
    
    def calculate_stop_loss(self, entry_price: float, side: str) -> float:
        """计算止损价格"""
        if side == 'buy':
            return entry_price * (1 - Config.STOP_LOSS_PERCENT)
        else:
            return entry_price * (1 + Config.STOP_LOSS_PERCENT)
    
    def calculate_take_profit(self, entry_price: float, side: str) -> float:
        """计算止盈价格"""
        if side == 'buy':
            return entry_price * (1 + Config.TAKE_PROFIT_PERCENT)
        else:
            return entry_price * (1 - Config.TAKE_PROFIT_PERCENT)
    
    def should_close_position(self, entry_price: float, current_price: float, side: str, 
                            entry_time: datetime) -> Dict:
        """判断是否应该平仓"""
        
        # 计算盈亏百分比
        if side == 'buy':
            pnl_percent = (current_price - entry_price) / entry_price
        else:
            pnl_percent = (entry_price - current_price) / entry_price
        
        # 止损检查
        if pnl_percent <= -Config.STOP_LOSS_PERCENT:
            return {
                'should_close': True,
                'reason': 'stop_loss',
                'pnl_percent': pnl_percent
            }
        
        # 止盈检查
        if pnl_percent >= Config.TAKE_PROFIT_PERCENT:
            return {
                'should_close': True,
                'reason': 'take_profit',
                'pnl_percent': pnl_percent
            }
        
        # 时间止损（持仓超过24小时）
        if datetime.now() - entry_time > timedelta(hours=24):
            return {
                'should_close': True,
                'reason': 'time_limit',
                'pnl_percent': pnl_percent
            }
        
        return {
            'should_close': False,
            'reason': None,
            'pnl_percent': pnl_percent
        }
    
    def get_risk_metrics(self, positions: List, balance_history: List) -> Dict:
        """计算风险指标"""
        if not positions and not balance_history:
            return {}
        
        closed_positions = [p for p in positions if hasattr(p, 'status') and p.status == 'closed']
        
        if not closed_positions:
            return {
                'total_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'max_drawdown': 0,
                'sharpe_ratio': 0
            }
        
        # 计算基本指标
        profits = [p.profit for p in closed_positions]
        winning_trades = [p for p in profits if p > 0]
        losing_trades = [p for p in profits if p < 0]
        
        win_rate = len(winning_trades) / len(profits) * 100 if profits else 0
        
        # 盈亏比
        avg_win = sum(winning_trades) / len(winning_trades) if winning_trades else 0
        avg_loss = abs(sum(losing_trades) / len(losing_trades)) if losing_trades else 1
        profit_factor = avg_win / avg_loss if avg_loss > 0 else 0
        
        # 最大回撤
        if balance_history:
            peak = balance_history[0]
            max_dd = 0
            for balance in balance_history:
                if balance > peak:
                    peak = balance
                drawdown = (peak - balance) / peak
                if drawdown > max_dd:
                    max_dd = drawdown
        else:
            max_dd = 0
        
        return {
            'total_trades': len(closed_positions),
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'max_drawdown': max_dd * 100,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'total_profit': sum(profits)
        }