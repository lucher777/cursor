#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试不同的Passphrase编码方式
"""

import hmac
import hashlib
import base64
import requests
import json
from datetime import datetime
from config import Config

def test_different_encodings():
    """测试不同的Passphrase编码方式"""
    print("=" * 60)
    print("测试不同的Passphrase编码方式")
    print("=" * 60)
    
    api_key = Config.OKEX_API_KEY
    secret_key = Config.OKEX_SECRET_KEY
    passphrase = Config.OKEX_PASSPHRASE
    
    print(f"原始Passphrase: {passphrase}")
    print()
    
    # 方法1: 直接Base64编码
    encoded1 = base64.b64encode(passphrase.encode('utf-8')).decode('utf-8')
    print(f"方法1 - 直接Base64: {encoded1}")
    
    # 方法2: SHA256哈希后Base64编码
    hash_object = hashlib.sha256(passphrase.encode('utf-8'))
    hash_hex = hash_object.hexdigest()
    encoded2 = base64.b64encode(hash_hex.encode('utf-8')).decode('utf-8')
    print(f"方法2 - SHA256+Base64: {encoded2}")
    
    # 方法3: 不编码，直接使用
    encoded3 = passphrase
    print(f"方法3 - 不编码: {encoded3}")
    
    # 方法4: 使用HMAC-SHA256
    mac = hmac.new(
        bytes(secret_key, encoding='utf8'),
        bytes(passphrase, encoding='utf-8'),
        digestmod='sha256'
    )
    encoded4 = base64.b64encode(mac.digest()).decode()
    print(f"方法4 - HMAC-SHA256: {encoded4}")
    
    print("\n" + "=" * 60)
    print("测试每种编码方式")
    print("=" * 60)
    
    encodings = [
        ("方法1 - 直接Base64", encoded1),
        ("方法2 - SHA256+Base64", encoded2),
        ("方法3 - 不编码", encoded3),
        ("方法4 - HMAC-SHA256", encoded4)
    ]
    
    for name, encoded_passphrase in encodings:
        print(f"\n测试 {name}:")
        print("-" * 40)
        
        # 构建请求
        request_path = "/api/v5/account/balance"
        timestamp = datetime.utcnow().isoformat()[:-3] + 'Z'
        message = timestamp + 'GET' + request_path
        
        # 生成签名
        mac = hmac.new(
            bytes(secret_key, encoding='utf8'),
            bytes(message, encoding='utf-8'),
            digestmod='sha256'
        )
        signature = base64.b64encode(mac.digest()).decode()
        
        # 构建请求头
        headers = {
            'OK-ACCESS-KEY': api_key,
            'OK-ACCESS-SIGN': signature,
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': encoded_passphrase,
            'Content-Type': 'application/json'
        }
        
        # 发送请求
        url = "https://www.okx.com" + request_path
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            print(f"状态码: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ 成功!")
                data = response.json()
                print(f"响应: {json.dumps(data, indent=2, ensure_ascii=False)}")
                break
            else:
                print(f"❌ 失败: {response.text}")
                
        except Exception as e:
            print(f"❌ 异常: {e}")

if __name__ == "__main__":
    test_different_encodings() 