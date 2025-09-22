#!/usr/bin/env python3
"""
API连接测试脚本
用于验证欧易API连接和价格获取功能
"""

import sys
import time
from exchange_client import OKExClient
from config import Config

def test_api_connection():
    """测试API连接"""
    print("🔍 测试欧易API连接...")
    print("=" * 50)
    
    # 显示配置信息
    print(f"API Key: {Config.OKEX_API_KEY[:10]}...")
    print(f"Secret Key: {Config.OKEX_SECRET_KEY[:10]}...")
    print(f"Passphrase: {Config.OKEX_PASSPHRASE}")
    print(f"沙盒模式: {Config.OKEX_SANDBOX}")
    print()
    
    # 初始化客户端
    client = OKExClient()
    
    # 测试连接状态
    if client.exchange:
        print("✅ API连接成功")
        print()
        
        # 测试获取价格
        test_symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT']
        
        print("📊 测试价格获取:")
        print("-" * 30)
        
        for symbol in test_symbols:
            try:
                ticker = client.get_ticker(symbol)
                print(f"{symbol}: ${ticker['price']:.2f} (涨跌: {ticker['percentage']:.2f}%)")
                time.sleep(0.5)  # 避免请求过快
            except Exception as e:
                print(f"{symbol}: 获取失败 - {e}")
        
        print()
        print("✅ 价格获取测试完成")
        
    else:
        print("❌ API连接失败，使用模拟数据")
        print()
        
        # 测试模拟数据
        test_symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'SOL/USDT']
        
        print("📊 模拟价格数据:")
        print("-" * 30)
        
        for symbol in test_symbols:
            try:
                ticker = client.get_ticker(symbol)
                print(f"{symbol}: ${ticker['price']:.2f} (涨跌: {ticker['percentage']:.2f}%)")
            except Exception as e:
                print(f"{symbol}: 获取失败 - {e}")
        
        print()
        print("⚠️  当前使用模拟数据，价格仅供参考")

def main():
    """主函数"""
    try:
        test_api_connection()
    except KeyboardInterrupt:
        print("\n\n❌ 测试已取消")
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {e}")

if __name__ == "__main__":
    main() 