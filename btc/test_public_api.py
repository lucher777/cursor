#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试OKX公开API
"""

import requests
import json

def test_public_api():
    """测试公开API"""
    print("=" * 50)
    print("测试OKX公开API")
    print("=" * 50)
    
    # 测试1: 获取服务器时间
    print("\n1. 获取服务器时间:")
    print("-" * 30)
    try:
        response = requests.get("https://www.okx.com/api/v5/public/time", timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"服务器时间: {data}")
    except Exception as e:
        print(f"请求失败: {e}")
    
    # 测试2: 获取产品信息
    print("\n2. 获取产品信息:")
    print("-" * 30)
    try:
        response = requests.get("https://www.okx.com/api/v5/public/instruments?instType=SPOT", timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"产品数量: {len(data.get('data', []))}")
            # 显示前5个产品
            for i, product in enumerate(data.get('data', [])[:5]):
                print(f"  {i+1}. {product.get('instId', 'N/A')}")
        else:
            print(f"响应: {response.text}")
    except Exception as e:
        print(f"请求失败: {e}")

if __name__ == "__main__":
    test_public_api() 