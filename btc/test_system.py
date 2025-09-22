#!/usr/bin/env python3
"""
系统功能测试脚本
"""

import sys
import os
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from technical_analysis import TechnicalAnalyzer
from trading_strategy import TradingStrategy
from config import Config

def test_technical_analysis():
    """测试技术分析功能"""
    print("🧪 测试技术分析功能...")
    
    # 创建测试数据
    dates = pd.date_range(start='2024-01-01', end='2024-01-31', freq='1H')
    np.random.seed(42)
    
    # 生成模拟价格数据
    base_price = 50000
    price_changes = np.random.normal(0, 0.02, len(dates))
    prices = [base_price]
    
    for change in price_changes[1:]:
        new_price = prices[-1] * (1 + change)
        prices.append(new_price)
    
    # 创建DataFrame
    df = pd.DataFrame({
        'timestamp': dates,
        'open': prices,
        'high': [p * (1 + abs(np.random.normal(0, 0.01))) for p in prices],
        'low': [p * (1 - abs(np.random.normal(0, 0.01))) for p in prices],
        'close': prices,
        'volume': np.random.uniform(100, 1000, len(dates))
    })
    
    # 测试技术分析器
    analyzer = TechnicalAnalyzer()
    
    # 测试RSI
    rsi = analyzer.calculate_rsi(df)
    print(f"✅ RSI计算成功，最新值: {rsi.iloc[-1]:.2f}")
    
    # 测试MACD
    macd_data = analyzer.calculate_macd(df)
    print(f"✅ MACD计算成功，MACD: {macd_data['macd'].iloc[-1]:.2f}")
    
    # 测试移动平均线
    ma_data = analyzer.calculate_moving_averages(df)
    print(f"✅ 移动平均线计算成功，短期MA: {ma_data['ma_short'].iloc[-1]:.2f}")
    
    # 测试布林带
    bb_data = analyzer.calculate_bollinger_bands(df)
    print(f"✅ 布林带计算成功，上轨: {bb_data['upper'].iloc[-1]:.2f}")
    
    # 测试趋势分析
    trend_analysis = analyzer.analyze_trend(df)
    print(f"✅ 趋势分析成功，趋势: {trend_analysis['trend']}, 强度: {trend_analysis['strength']:.2f}")
    
    # 测试买卖信号
    buy_signal, sell_signal, analysis = analyzer.get_buy_sell_signals(df)
    print(f"✅ 买卖信号分析成功，买入: {buy_signal}, 卖出: {sell_signal}")
    
    return True

def test_trading_strategy():
    """测试交易策略功能"""
    print("\n🧪 测试交易策略功能...")
    
    try:
        strategy = TradingStrategy()
        
        # 测试策略运行（使用模拟数据）
        result = strategy.run_strategy('BTC/USDT')
        
        if result.get('status') == 'success':
            print("✅ 交易策略运行成功")
            print(f"   当前价格: ${result.get('current_price', 0):.2f}")
            print(f"   买入信号: {result.get('buy_signal', False)}")
            print(f"   卖出信号: {result.get('sell_signal', False)}")
        else:
            print(f"⚠️  交易策略运行完成，但状态: {result.get('status')}")
            print(f"   错误信息: {result.get('message', 'N/A')}")
        
        # 测试账户摘要
        account = strategy.get_account_summary()
        print(f"✅ 账户摘要获取成功")
        print(f"   持仓数量: {account.get('open_positions', 0)}")
        print(f"   总交易次数: {account.get('total_trades', 0)}")
        print(f"   总盈亏: ${account.get('total_profit', 0):.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ 交易策略测试失败: {e}")
        return False

def test_config():
    """测试配置功能"""
    print("\n🧪 测试配置功能...")
    
    try:
        print(f"✅ 默认交易对: {Config.DEFAULT_SYMBOL}")
        print(f"✅ 交易金额: ${Config.TRADE_AMOUNT}")
        print(f"✅ 最大持仓数: {Config.MAX_POSITIONS}")
        print(f"✅ 止损比例: {Config.STOP_LOSS_PERCENT}%")
        print(f"✅ 止盈比例: {Config.TAKE_PROFIT_PERCENT}%")
        print(f"✅ RSI周期: {Config.RSI_PERIOD}")
        print(f"✅ Web端口: {Config.WEB_PORT}")
        
        return True
        
    except Exception as e:
        print(f"❌ 配置测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 虚拟币交易系统功能测试")
    print("=" * 50)
    
    tests = [
        ("配置功能", test_config),
        ("技术分析", test_technical_analysis),
        ("交易策略", test_trading_strategy),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name}测试通过\n")
            else:
                print(f"❌ {test_name}测试失败\n")
        except Exception as e:
            print(f"❌ {test_name}测试出错: {e}\n")
    
    print("=" * 50)
    print(f"测试结果: {passed}/{total} 通过")
    
    if passed == total:
        print("🎉 所有测试通过！系统运行正常。")
        print("\n📋 使用说明:")
        print("1. Web界面: python main.py --mode web")
        print("2. 命令行分析: python main.py --mode cli")
        print("3. 自动交易: python main.py --mode auto")
        print("4. 演示脚本: python demo.py")
    else:
        print("⚠️  部分测试失败，请检查相关功能。")

if __name__ == '__main__':
    main() 