#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OKX余额查询工具
"""

from exchange_client import OKExClient
import json
from datetime import datetime

def format_balance_display(balance_data: dict) -> str:
    """格式化余额显示"""
    if "error" in balance_data:
        return f"❌ 查询失败: {balance_data['error']}"
    
    if "data" not in balance_data or not balance_data["data"]:
        return "❌ 无余额数据"
    
    result = []
    result.append("💰 账户余额信息")
    result.append("=" * 50)
    
    total_usdt_value = 0.0
    
    for item in balance_data["data"]:
        ccy = item.get('ccy', 'N/A')
        cash_bal = float(item.get('cashBal', 0))
        avail_bal = float(item.get('availBal', 0))
        total_eq = float(item.get('totalEq', 0))
        upl = float(item.get('upl', 0))
        upl_ratio = float(item.get('uplRatio', 0))
        
        # 只显示有余额的币种
        if cash_bal > 0 or total_eq > 0:
            result.append(f"\n📊 {ccy}:")
            result.append(f"   现金余额: {cash_bal:,.8f}")
            result.append(f"   可用余额: {avail_bal:,.8f}")
            result.append(f"   总权益: {total_eq:,.8f}")
            
            if upl != 0:
                upl_sign = "📈" if upl > 0 else "📉"
                result.append(f"   未实现盈亏: {upl_sign} {upl:,.8f}")
                result.append(f"   盈亏比例: {upl_ratio:.4f}%")
            
            # 估算USDT价值（简化计算）
            if ccy == "USDT":
                total_usdt_value += total_eq
            elif ccy in ["BTC", "ETH"]:
                # 使用大致价格估算
                price_map = {"BTC": 43000, "ETH": 2300}
                usdt_value = total_eq * price_map.get(ccy, 0)
                total_usdt_value += usdt_value
                result.append(f"   估算USDT价值: {usdt_value:,.2f} USDT")
    
    if total_usdt_value > 0:
        result.append(f"\n💵 总估算价值: {total_usdt_value:,.2f} USDT")
    
    result.append(f"\n⏰ 查询时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return "\n".join(result)

def query_balance(ccy: str = None):
    """查询余额"""
    print("=" * 60)
    print("OKX余额查询工具")
    print("=" * 60)
    
    client = OKExClient()
    
    if ccy:
        print(f"\n🔍 查询 {ccy} 余额...")
        balance_data = client.get_balance_v5_api(ccy)
    else:
        print(f"\n🔍 查询所有币种余额...")
        balance_data = client.get_balance_v5_api()
    
    # 显示格式化结果
    formatted_result = format_balance_display(balance_data)
    print(formatted_result)
    
    return balance_data

def interactive_balance_query():
    """交互式余额查询"""
    print("=" * 60)
    print("OKX余额查询工具 - 交互模式")
    print("=" * 60)
    
    while True:
        print("\n请选择操作:")
        print("1. 查询所有币种余额")
        print("2. 查询特定币种余额")
        print("3. 退出")
        
        choice = input("\n请输入选择 (1-3): ").strip()
        
        if choice == "1":
            query_balance()
        elif choice == "2":
            ccy = input("请输入币种代码 (如 BTC, ETH, USDT): ").strip().upper()
            if ccy:
                query_balance(ccy)
            else:
                print("❌ 币种代码不能为空")
        elif choice == "3":
            print("👋 再见!")
            break
        else:
            print("❌ 无效选择，请重新输入")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # 命令行模式
        ccy = sys.argv[1].upper()
        query_balance(ccy)
    else:
        # 交互模式
        interactive_balance_query() 