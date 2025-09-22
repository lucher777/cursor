#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试获取交易产品基础信息功能
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from exchange_client import OKExClient
import json

def test_get_instruments():
    """测试获取交易产品基础信息"""
    client = OKExClient()
    
    print("=" * 60)
    print("测试获取交易产品基础信息")
    print("=" * 60)
    
    # 测试获取现货产品
    print("\n1. 获取现货产品信息:")
    result = client.get_instruments("SPOT")
    print(f"现货产品数量: {len(result.get('data', []))}")
    if result.get('data'):
        print(f"示例产品: {result['data'][0]['instId']}")
    
    # 测试获取永续合约产品
    print("\n2. 获取永续合约产品信息:")
    result = client.get_instruments("SWAP")
    print(f"永续合约产品数量: {len(result.get('data', []))}")
    if result.get('data'):
        print(f"示例产品: {result['data'][0]['instId']}")
    
    # 测试获取交割合约产品
    print("\n3. 获取交割合约产品信息:")
    result = client.get_instruments("FUTURES")
    print(f"交割合约产品数量: {len(result.get('data', []))}")
    if result.get('data'):
        print(f"示例产品: {result['data'][0]['instId']}")
    
    # 测试获取期权产品
    print("\n4. 获取期权产品信息:")
    result = client.get_instruments("OPTION")
    print(f"期权产品数量: {len(result.get('data', []))}")
    if result.get('data'):
        print(f"示例产品: {result['data'][0]['instId']}")
    
    # 测试获取币币杠杆产品
    print("\n5. 获取币币杠杆产品信息:")
    result = client.get_instruments("MARGIN")
    print(f"币币杠杆产品数量: {len(result.get('data', []))}")
    if result.get('data'):
        print(f"示例产品: {result['data'][0]['instId']}")
    
    # 测试按产品ID过滤
    print("\n6. 按产品ID过滤 (BTC-USDT):")
    result = client.get_instruments("SPOT", inst_id="BTC-USDT")
    print(f"过滤后产品数量: {len(result.get('data', []))}")
    if result.get('data'):
        print(f"产品详情: {json.dumps(result['data'][0], indent=2, ensure_ascii=False)}")
    
    # 测试按标的指数过滤
    print("\n7. 按标的指数过滤 (BTC-USDT):")
    result = client.get_instruments("SWAP", uly="BTC-USDT")
    print(f"过滤后产品数量: {len(result.get('data', []))}")
    if result.get('data'):
        print(f"产品详情: {json.dumps(result['data'][0], indent=2, ensure_ascii=False)}")
    
    # 测试按交易品种过滤
    print("\n8. 按交易品种过滤 (BTC-USDT):")
    result = client.get_instruments("SWAP", inst_family="BTC-USDT")
    print(f"过滤后产品数量: {len(result.get('data', []))}")
    if result.get('data'):
        print(f"产品详情: {json.dumps(result['data'][0], indent=2, ensure_ascii=False)}")

def test_instrument_details():
    """测试产品详细信息"""
    client = OKExClient()
    
    print("\n" + "=" * 60)
    print("测试产品详细信息")
    print("=" * 60)
    
    # 获取现货产品详细信息
    result = client.get_instruments("SPOT")
    if result.get('data'):
        instrument = result['data'][0]
        print(f"\n现货产品详细信息:")
        print(f"产品ID: {instrument['instId']}")
        print(f"产品类型: {instrument['instType']}")
        print(f"交易货币: {instrument['baseCcy']}")
        print(f"计价货币: {instrument['quoteCcy']}")
        print(f"最小下单数量: {instrument['minSz']}")
        print(f"下单数量精度: {instrument['lotSz']}")
        print(f"下单价格精度: {instrument['tickSz']}")
        print(f"产品状态: {instrument['state']}")
        print(f"上线时间: {instrument['listTime']}")
        print(f"最大杠杆: {instrument['lever']}")
        print(f"限价单最大数量: {instrument['maxLmtSz']}")
        print(f"市价单最大数量: {instrument['maxMktSz']}")

if __name__ == "__main__":
    test_get_instruments()
    test_instrument_details()
    print("\n测试完成！") 