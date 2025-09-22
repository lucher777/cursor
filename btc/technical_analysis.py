import pandas as pd
import numpy as np
from typing import Dict, Tuple
from config import Config

class TechnicalAnalyzer:
    """技术分析器"""
    
    def __init__(self):
        pass
    
    def calculate_rsi(self, df: pd.DataFrame, period: int = None) -> pd.Series:
        """计算RSI指标"""
        if period is None:
            period = Config.RSI_PERIOD
        
        if len(df) < period + 1:
            return pd.Series(index=df.index, dtype=float)
        
        # 计算价格变化
        delta = df['close'].diff()
        
        # 分离上涨和下跌
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        # 计算平均上涨和下跌
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()
        
        # 计算RSI
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def calculate_macd(self, df: pd.DataFrame, fast: int = None, slow: int = None, signal: int = None) -> Dict[str, pd.Series]:
        """计算MACD指标"""
        if fast is None:
            fast = Config.MACD_FAST
        if slow is None:
            slow = Config.MACD_SLOW
        if signal is None:
            signal = Config.MACD_SIGNAL
        
        if len(df) < slow:
            empty_series = pd.Series(index=df.index, dtype=float)
            return {'macd': empty_series, 'signal': empty_series, 'histogram': empty_series}
        
        # 计算EMA
        ema_fast = df['close'].ewm(span=fast).mean()
        ema_slow = df['close'].ewm(span=slow).mean()
        
        # 计算MACD线
        macd_line = ema_fast - ema_slow
        
        # 计算信号线
        signal_line = macd_line.ewm(span=signal).mean()
        
        # 计算柱状图
        histogram = macd_line - signal_line
        
        return {
            'macd': macd_line,
            'signal': signal_line,
            'histogram': histogram
        }
    
    def calculate_moving_averages(self, df: pd.DataFrame, short: int = None, long: int = None) -> Dict[str, pd.Series]:
        """计算移动平均线"""
        if short is None:
            short = Config.MA_SHORT
        if long is None:
            long = Config.MA_LONG
        
        ma_short = df['close'].rolling(window=short).mean()
        ma_long = df['close'].rolling(window=long).mean()
        
        return {
            'ma_short': ma_short,
            'ma_long': ma_long
        }
    
    def calculate_bollinger_bands(self, df: pd.DataFrame, period: int = 20, std_dev: int = 2) -> Dict[str, pd.Series]:
        """计算布林带"""
        if len(df) < period:
            empty_series = pd.Series(index=df.index, dtype=float)
            return {'upper': empty_series, 'middle': empty_series, 'lower': empty_series}
        
        # 计算移动平均线
        middle = df['close'].rolling(window=period).mean()
        
        # 计算标准差
        std = df['close'].rolling(window=period).std()
        
        # 计算上下轨
        upper = middle + (std * std_dev)
        lower = middle - (std * std_dev)
        
        return {
            'upper': upper,
            'middle': middle,
            'lower': lower
        }
    
    def calculate_volume_indicators(self, df: pd.DataFrame) -> Dict[str, pd.Series]:
        """计算成交量指标"""
        # 成交量移动平均
        volume_ma = df['volume'].rolling(window=20).mean()
        
        # 相对成交量
        volume_ratio = df['volume'] / volume_ma
        
        return {
            'volume_ma': volume_ma,
            'volume_ratio': volume_ratio
        }
    
    def analyze_trend(self, df: pd.DataFrame, symbol: str = None) -> Dict:
        """综合趋势分析"""
        if len(df) < 50:
            return {'trend': 'insufficient_data', 'strength': 0}
        
        # 获取币种特定参数
        if symbol and symbol in Config.SYMBOL_PARAMS:
            symbol_params = Config.SYMBOL_PARAMS[symbol]
            rsi_oversold = symbol_params['rsi_oversold']
            rsi_overbought = symbol_params['rsi_overbought']
        else:
            # 使用默认参数
            rsi_oversold = Config.RSI_OVERSOLD
            rsi_overbought = Config.RSI_OVERBOUGHT
        
        # 计算各项指标
        rsi = self.calculate_rsi(df)
        macd_data = self.calculate_macd(df)
        ma_data = self.calculate_moving_averages(df)
        bb_data = self.calculate_bollinger_bands(df)
        
        # 获取最新值
        latest_price = df['close'].iloc[-1]
        latest_rsi = rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else 50
        latest_macd = macd_data['macd'].iloc[-1] if not pd.isna(macd_data['macd'].iloc[-1]) else 0
        latest_signal = macd_data['signal'].iloc[-1] if not pd.isna(macd_data['signal'].iloc[-1]) else 0
        latest_ma_short = ma_data['ma_short'].iloc[-1] if not pd.isna(ma_data['ma_short'].iloc[-1]) else latest_price
        latest_ma_long = ma_data['ma_long'].iloc[-1] if not pd.isna(ma_data['ma_long'].iloc[-1]) else latest_price
        
        # 趋势判断逻辑
        bullish_signals = 0
        bearish_signals = 0
        
        # RSI信号
        if latest_rsi < rsi_oversold:
            bullish_signals += 2  # 超卖，看涨信号
        elif latest_rsi > rsi_overbought:
            bearish_signals += 2  # 超买，看跌信号
        elif latest_rsi > 50:
            bullish_signals += 1
        else:
            bearish_signals += 1
        
        # MACD信号
        if latest_macd > latest_signal:
            bullish_signals += 1
        else:
            bearish_signals += 1
        
        # 移动平均线信号
        if latest_ma_short > latest_ma_long:
            bullish_signals += 1
        else:
            bearish_signals += 1
        
        # 价格与移动平均线关系
        if latest_price > latest_ma_short:
            bullish_signals += 1
        else:
            bearish_signals += 1
        
        # 判断趋势
        total_signals = bullish_signals + bearish_signals
        if total_signals == 0:
            trend = 'neutral'
            strength = 0
        else:
            strength = abs(bullish_signals - bearish_signals) / total_signals
            if bullish_signals > bearish_signals:
                trend = 'bullish'
            elif bearish_signals > bullish_signals:
                trend = 'bearish'
            else:
                trend = 'neutral'
        
        return {
            'trend': trend,
            'strength': strength,
            'rsi': latest_rsi,
            'macd': latest_macd,
            'signal': latest_signal,
            'ma_short': latest_ma_short,
            'ma_long': latest_ma_long,
            'price': latest_price,
            'bullish_signals': bullish_signals,
            'bearish_signals': bearish_signals
        }
    
    def get_buy_sell_signals(self, df: pd.DataFrame, symbol: str = None) -> Tuple[bool, bool, Dict]:
        """获取买卖信号"""
        # 获取币种特定参数
        if symbol and symbol in Config.SYMBOL_PARAMS:
            symbol_params = Config.SYMBOL_PARAMS[symbol]
            rsi_oversold = symbol_params['rsi_oversold']
            rsi_overbought = symbol_params['rsi_overbought']
            volatility = symbol_params['volatility']
        else:
            # 使用默认参数
            rsi_oversold = Config.RSI_OVERSOLD
            rsi_overbought = Config.RSI_OVERBOUGHT
            volatility = 'medium'
        
        analysis = self.analyze_trend(df, symbol)
        
        buy_signal = False
        sell_signal = False
        
        # 根据波动性调整信号强度要求
        strength_threshold = 0.6
        if volatility == 'high':
            strength_threshold = 0.5  # 高波动币种降低强度要求
        elif volatility == 'extreme':
            strength_threshold = 0.4  # 极高波动币种进一步降低要求
        elif volatility == 'low':
            strength_threshold = 0.7  # 低波动币种提高强度要求
        
        # 买入信号条件
        if (analysis['trend'] == 'bullish' and 
            analysis['strength'] > strength_threshold and 
            analysis['rsi'] < rsi_overbought and 
            analysis['price'] < analysis['ma_short'] * 1.02):  # 价格接近短期均线
            buy_signal = True
        
        # 卖出信号条件
        if (analysis['trend'] == 'bearish' and 
            analysis['strength'] > strength_threshold and 
            analysis['rsi'] > rsi_oversold and 
            analysis['price'] > analysis['ma_short'] * 0.98):  # 价格接近短期均线
            sell_signal = True
        
        # 特殊情况：RSI极值信号
        if analysis['rsi'] < rsi_oversold:
            buy_signal = True
        elif analysis['rsi'] > rsi_overbought:
            sell_signal = True
        
        # 添加波动性信息到分析结果
        analysis['volatility'] = volatility
        analysis['rsi_oversold'] = rsi_oversold
        analysis['rsi_overbought'] = rsi_overbought
        analysis['strength_threshold'] = strength_threshold
        
        return buy_signal, sell_signal, analysis