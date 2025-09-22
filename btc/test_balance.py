#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OKX余额查询测试脚本
"""

from exchange_client import OKExClient
import json

def test_balance_query():
    """测试余额查询功能"""
    print("=" * 50)
    print("OKX余额查询测试")
    print("=" * 50)
    
    # 创建客户端
    client = OKExClient()
    
    # 测试1: 获取所有币种余额
    print("\n1. 获取所有币种余额:")
    print("-" * 30)
    balance_all = client.get_balance_v5_api()
    
    if "error" in balance_all:
        print(f"❌ 查询失败: {balance_all['error']}")
        print("\n使用模拟数据:")
        balance_all = client.get_mock_balance()
    
    if "data" in balance_all:
        print("✅ 查询成功!")
        for item in balance_all["data"]:
            print(f"币种: {item['ccy']}")
            print(f"  现金余额: {item['cashBal']}")
            print(f"  可用余额: {item['availBal']}")
            print(f"  总权益: {item['totalEq']}")
            print(f"  未实现盈亏: {item['upl']}")
            print(f"  盈亏比例: {item['uplRatio']}")
            print()
    
    # 测试2: 获取特定币种余额
    print("\n2. 获取BTC余额:")
    print("-" * 30)
    balance_btc = client.get_balance_v5_api("BTC")
    
    if "error" in balance_btc:
        print(f"❌ 查询失败: {balance_btc['error']}")
    elif "data" in balance_btc and balance_btc["data"]:
        print("✅ 查询成功!")
        item = balance_btc["data"][0]
        print(f"币种: {item['ccy']}")
        print(f"  现金余额: {item['cashBal']}")
        print(f"  可用余额: {item['availBal']}")
        print(f"  总权益: {item['totalEq']}")
        print(f"  未实现盈亏: {item['upl']}")
        print(f"  盈亏比例: {item['uplRatio']}")
    else:
        print("❌ 未找到BTC余额数据")
    
    # 测试3: 获取USDT余额
    print("\n3. 获取USDT余额:")
    print("-" * 30)
    balance_usdt = client.get_balance_v5_api("USDT")
    
    if "error" in balance_usdt:
        print(f"❌ 查询失败: {balance_usdt['error']}")
    elif "data" in balance_usdt and balance_usdt["data"]:
        print("✅ 查询成功!")
        item = balance_usdt["data"][0]
        print(f"币种: {item['ccy']}")
        print(f"  现金余额: {item['cashBal']}")
        print(f"  可用余额: {item['availBal']}")
        print(f"  总权益: {item['totalEq']}")
        print(f"  未实现盈亏: {item['upl']}")
        print(f"  盈亏比例: {item['uplRatio']}")
    else:
        print("❌ 未找到USDT余额数据")
    
    # 测试4: 获取不存在的币种
    print("\n4. 获取不存在的币种(测试错误处理):")
    print("-" * 30)
    balance_invalid = client.get_balance_v5_api("INVALID")
    
    if "error" in balance_invalid:
        print(f"❌ 查询失败: {balance_invalid['error']}")
    elif "data" in balance_invalid:
        if balance_invalid["data"]:
            print("✅ 查询成功!")
            for item in balance_invalid["data"]:
                print(f"币种: {item['ccy']}")
        else:
            print("✅ 查询成功，但无数据返回")
    else:
        print("❌ 未知错误")
    
    print("\n" + "=" * 50)
    print("测试完成")
    print("=" * 50)

def test_balance_format():
    """测试余额数据格式"""
    print("\n余额数据格式说明:")
    print("-" * 30)
    print("cashBal: 现金余额")
    print("availBal: 可用余额")
    print("totalEq: 总权益")
    print("upl: 未实现盈亏")
    print("uplRatio: 盈亏比例")
    print("ordFroz: 订单冻结金额")
    print("availEq: 可用权益")
    print("disEq: 可分配权益")
    print("eq: 权益")
    print("mgnRatio: 保证金率")
    print("mmr: 维持保证金率")
    print("marginRatio: 保证金率")
    print("crossLiab: 全仓负债")
    print("isoLiab: 逐仓负债")

if __name__ == "__main__":
    test_balance_query()
    test_balance_format() 