#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
交易产品信息API演示脚本
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from exchange_client import OKExClient
import json

def demo_instruments_api():
    """演示交易产品信息API的使用"""
    print("=" * 60)
    print("交易产品信息API演示")
    print("=" * 60)
    
    client = OKExClient()
    
    # 1. 获取现货产品
    print("\n1. 获取现货产品信息:")
    result = client.get_instruments("SPOT")
    if result.get('data'):
        print(f"  现货产品数量: {len(result['data'])}")
        for instrument in result['data'][:3]:  # 显示前3个
            print(f"    - {instrument['instId']}: 最小数量={instrument['minSz']}, 价格精度={instrument['tickSz']}")
    
    # 2. 获取永续合约
    print("\n2. 获取永续合约产品信息:")
    result = client.get_instruments("SWAP")
    if result.get('data'):
        print(f"  永续合约数量: {len(result['data'])}")
        for instrument in result['data']:
            print(f"    - {instrument['instId']}: 杠杆={instrument['lever']}, 标的={instrument['uly']}")
    
    # 3. 获取特定产品详情
    print("\n3. 获取BTC-USDT现货详情:")
    result = client.get_instruments("SPOT", inst_id="BTC-USDT")
    if result.get('data'):
        instrument = result['data'][0]
        print(f"  产品ID: {instrument['instId']}")
        print(f"  交易货币: {instrument['baseCcy']}")
        print(f"  计价货币: {instrument['quoteCcy']}")
        print(f"  最小下单数量: {instrument['minSz']}")
        print(f"  下单数量精度: {instrument['lotSz']}")
        print(f"  下单价格精度: {instrument['tickSz']}")
        print(f"  产品状态: {instrument['state']}")
        print(f"  限价单最大数量: {instrument['maxLmtSz']}")
        print(f"  市价单最大数量: {instrument['maxMktSz']}")
    
    # 4. 按标的指数筛选
    print("\n4. 按标的指数筛选 (BTC-USDT):")
    result = client.get_instruments("SWAP", uly="BTC-USDT")
    if result.get('data'):
        print(f"  BTC-USDT相关合约数量: {len(result['data'])}")
        for instrument in result['data']:
            print(f"    - {instrument['instId']}: 合约类型={instrument['ctType']}, 结算货币={instrument['settleCcy']}")
    
    # 5. 获取期权产品
    print("\n5. 获取期权产品信息:")
    result = client.get_instruments("OPTION")
    if result.get('data'):
        print(f"  期权产品数量: {len(result['data'])}")
        for instrument in result['data']:
            print(f"    - {instrument['instId']}: 期权类型={instrument['optType']}, 行权价={instrument['stk']}")
    
    # 6. 获取币币杠杆产品
    print("\n6. 获取币币杠杆产品信息:")
    result = client.get_instruments("MARGIN")
    if result.get('data'):
        print(f"  币币杠杆产品数量: {len(result['data'])}")
        for instrument in result['data']:
            print(f"    - {instrument['instId']}: 最大杠杆={instrument['lever']}")
    
    print("\n" + "=" * 60)
    print("演示完成！")
    print("=" * 60)

def demo_api_usage():
    """演示API使用场景"""
    print("\n" + "=" * 60)
    print("API使用场景演示")
    print("=" * 60)
    
    client = OKExClient()
    
    # 场景1: 获取所有可交易的现货产品
    print("\n场景1: 获取所有可交易的现货产品")
    result = client.get_instruments("SPOT")
    if result.get('data'):
        live_products = [item for item in result['data'] if item['state'] == 'live']
        print(f"  可交易现货产品数量: {len(live_products)}")
        print("  产品列表:")
        for product in live_products[:5]:  # 显示前5个
            print(f"    {product['instId']} ({product['baseCcy']}/{product['quoteCcy']})")
    
    # 场景2: 查找支持高杠杆的合约产品
    print("\n场景2: 查找支持高杠杆的合约产品")
    result = client.get_instruments("SWAP")
    if result.get('data'):
        high_leverage = [item for item in result['data'] if item['lever'] and int(item['lever']) >= 100]
        print(f"  支持100倍以上杠杆的合约数量: {len(high_leverage)}")
        for product in high_leverage:
            print(f"    {product['instId']}: {product['lever']}倍杠杆")
    
    # 场景3: 查找特定币种的期权产品
    print("\n场景3: 查找BTC相关期权产品")
    result = client.get_instruments("OPTION", uly="BTC-USDT")
    if result.get('data'):
        print(f"  BTC-USDT期权产品数量: {len(result['data'])}")
        for product in result['data']:
            print(f"    {product['instId']}: {product['optType']}期权, 行权价{product['stk']}")
    
    # 场景4: 获取产品规格信息用于下单
    print("\n场景4: 获取产品规格信息用于下单")
    result = client.get_instruments("SPOT", inst_id="ETH-USDT")
    if result.get('data'):
        instrument = result['data'][0]
        print(f"  ETH-USDT下单规格:")
        print(f"    最小下单数量: {instrument['minSz']} ETH")
        print(f"    数量精度: {instrument['lotSz']}")
        print(f"    价格精度: {instrument['tickSz']}")
        print(f"    限价单最大数量: {instrument['maxLmtSz']} ETH")
        print(f"    市价单最大数量: {instrument['maxMktSz']} ETH")
        print(f"    限价单最大金额: {instrument['maxLmtAmt']} USDT")
        print(f"    市价单最大金额: {instrument['maxMktAmt']} USDT")

if __name__ == "__main__":
    demo_instruments_api()
    demo_api_usage() 