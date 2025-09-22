#!/usr/bin/env python3
"""
演示脚本 - 无需API密钥即可体验系统功能
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time
import random
from technical_analysis import TechnicalAnalyzer
from config import Config

class MockData:
    """模拟数据生成器"""
    
    def __init__(self, initial_price=50000):
        self.current_price = initial_price
        self.trend = 0.001  # 趋势强度
        
    def generate_kline_data(self, periods=100):
        """生成模拟K线数据"""
        dates = pd.date_range(start=datetime.now() - timedelta(hours=periods), 
                             end=datetime.now(), freq='H')
        
        data = []
        price = self.current_price
        
        for date in dates:
            # 模拟价格波动
            change = random.gauss(0, 0.02)  # 2%标准差的正态分布
            trend_change = self.trend * random.gauss(1, 0.1)
            
            price *= (1 + change + trend_change)
            
            # 生成OHLCV数据
            high = price * (1 + abs(random.gauss(0, 0.01)))
            low = price * (1 - abs(random.gauss(0, 0.01)))
            open_price = price * (1 + random.gauss(0, 0.005))
            close_price = price
            volume = random.uniform(100, 1000)
            
            data.append({
                'datetime': date,
                'open': open_price,
                'high': high,
                'low': low,
                'close': close_price,
                'volume': volume
            })
        
        self.current_price = price
        df = pd.DataFrame(data)
        df.set_index('datetime', inplace=True)
        return df

def run_demo():
    """运行演示"""
    print("🚀 虚拟币交易系统演示")
    print("=" * 50)
    
    # 创建模拟数据和分析器
    mock_data = MockData(initial_price=45000)  # BTC起始价格
    analyzer = TechnicalAnalyzer()
    
    print("正在生成模拟市场数据...")
    df = mock_data.generate_kline_data(100)
    
    print(f"数据时间范围: {df.index[0]} 至 {df.index[-1]}")
    print(f"价格范围: ${df['close'].min():.2f} - ${df['close'].max():.2f}")
    print(f"当前价格: ${df['close'].iloc[-1]:.2f}")
    
    print("\n正在进行技术分析...")
    
    # 计算技术指标
    rsi = analyzer.calculate_rsi(df)
    macd_data = analyzer.calculate_macd(df)
    ma_data = analyzer.calculate_moving_averages(df)
    bb_data = analyzer.calculate_bollinger_bands(df)
    
    # 获取最新指标值
    latest_rsi = rsi.iloc[-1] if not pd.isna(rsi.iloc[-1]) else 50
    latest_macd = macd_data['macd'].iloc[-1] if not pd.isna(macd_data['macd'].iloc[-1]) else 0
    latest_signal = macd_data['signal'].iloc[-1] if not pd.isna(macd_data['signal'].iloc[-1]) else 0
    latest_ma_short = ma_data['ma_short'].iloc[-1] if not pd.isna(ma_data['ma_short'].iloc[-1]) else 0
    latest_ma_long = ma_data['ma_long'].iloc[-1] if not pd.isna(ma_data['ma_long'].iloc[-1]) else 0
    
    print("\n📊 技术指标分析结果:")
    print("-" * 30)
    print(f"RSI (14):        {latest_rsi:.1f}")
    print(f"MACD:           {latest_macd:.4f}")
    print(f"信号线:          {latest_signal:.4f}")
    print(f"短期均线(20):    ${latest_ma_short:.2f}")
    print(f"长期均线(50):    ${latest_ma_long:.2f}")
    
    # 趋势分析
    analysis = analyzer.analyze_trend(df)
    
    print(f"\n🎯 趋势分析:")
    print("-" * 30)
    print(f"趋势方向:        {analysis['trend']}")
    print(f"趋势强度:        {analysis['strength']:.2f}")
    print(f"看涨信号数:      {analysis['bullish_signals']}")
    print(f"看跌信号数:      {analysis['bearish_signals']}")
    
    # 交易信号
    buy_signal, sell_signal, _ = analyzer.get_buy_sell_signals(df)
    
    print(f"\n🚦 交易信号:")
    print("-" * 30)
    print(f"买入信号:        {'✅ 是' if buy_signal else '❌ 否'}")
    print(f"卖出信号:        {'✅ 是' if sell_signal else '❌ 否'}")
    
    # RSI状态判断
    if latest_rsi > Config.RSI_OVERBOUGHT:
        rsi_status = "🔴 超买区域"
    elif latest_rsi < Config.RSI_OVERSOLD:
        rsi_status = "🟢 超卖区域"
    else:
        rsi_status = "🟡 正常区域"
    
    print(f"RSI状态:         {rsi_status}")
    
    # MACD状态
    if latest_macd > latest_signal:
        macd_status = "🟢 金叉(看涨)"
    else:
        macd_status = "🔴 死叉(看跌)"
    
    print(f"MACD状态:        {macd_status}")
    
    # 均线状态
    if latest_ma_short > latest_ma_long:
        ma_status = "🟢 多头排列"
    else:
        ma_status = "🔴 空头排列"
    
    print(f"均线状态:        {ma_status}")
    
    print(f"\n💡 交易建议:")
    print("-" * 30)
    
    if buy_signal:
        print("🟢 建议买入 - 技术指标显示上涨趋势")
        print(f"   参考买入价: ${df['close'].iloc[-1] * 0.995:.2f}")
        print(f"   止损价位:   ${df['close'].iloc[-1] * (1 - Config.STOP_LOSS_PERCENT):.2f}")
        print(f"   止盈价位:   ${df['close'].iloc[-1] * (1 + Config.TAKE_PROFIT_PERCENT):.2f}")
    elif sell_signal:
        print("🔴 建议卖出 - 技术指标显示下跌趋势")
        print("   如有持仓建议减仓或止盈")
    else:
        print("🟡 观望等待 - 暂无明确交易信号")
        print("   建议等待更明确的技术信号")
    
    print(f"\n⚠️ 风险提示:")
    print("-" * 30)
    print("• 本演示使用模拟数据，实际市场可能有所不同")
    print("• 技术分析仅供参考，不构成投资建议")
    print("• 虚拟币交易存在极高风险，请谨慎投资")
    print("• 建议在沙盒环境中充分测试后再使用实盘")
    
    print(f"\n🎉 演示完成！")
    print("如需体验完整功能，请:")
    print("1. 配置API密钥到 .env 文件")
    print("2. 运行 python main.py --mode web")

if __name__ == '__main__':
    run_demo()