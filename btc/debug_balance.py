#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OKX余额查询调试脚本
"""

import hmac
import hashlib
import base64
import requests
import json
from datetime import datetime
from config import Config

def debug_balance_request():
    """调试余额请求"""
    print("=" * 60)
    print("OKX余额查询调试")
    print("=" * 60)
    
    # API配置
    api_key = Config.OKEX_API_KEY
    secret_key = Config.OKEX_SECRET_KEY
    passphrase = Config.OKEX_PASSPHRASE
    
    print(f"API Key: {api_key}")
    print(f"Secret Key: {secret_key}")
    print(f"Passphrase: {passphrase}")
    print()
    
    # 构建请求路径
    request_path = "/api/v5/account/balance"
    
    # 获取时间戳
    timestamp = datetime.utcnow().isoformat()[:-3] + 'Z'
    print(f"Timestamp: {timestamp}")
    
    # 生成签名
    message = timestamp + 'GET' + request_path
    print(f"Message to sign: {message}")
    
    mac = hmac.new(
        bytes(secret_key, encoding='utf8'),
        bytes(message, encoding='utf-8'),
        digestmod='sha256'
    )
    signature = base64.b64encode(mac.digest()).decode()
    print(f"Signature: {signature}")
    
    # 编码Passphrase
    encoded_passphrase = base64.b64encode(passphrase.encode('utf-8')).decode('utf-8')
    print(f"Encoded Passphrase: {encoded_passphrase}")
    
    # 构建请求头
    headers = {
        'OK-ACCESS-KEY': api_key,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': encoded_passphrase,
        'Content-Type': 'application/json'
    }
    
    print("\n请求头:")
    for key, value in headers.items():
        print(f"  {key}: {value}")
    
    # 发送请求
    url = "https://www.okx.com" + request_path
    print(f"\n请求URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"\n响应状态码: {response.status_code}")
        print(f"响应头:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        print(f"\n响应内容:")
        print(response.text)
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n解析后的JSON数据:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(f"\n请求失败，状态码: {response.status_code}")
            
    except Exception as e:
        print(f"请求异常: {e}")

if __name__ == "__main__":
    debug_balance_request() 