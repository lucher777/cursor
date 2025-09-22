#!/usr/bin/env python3
"""
API配置助手 - 帮助用户安全地配置欧易API密钥
"""

import os
import getpass
from pathlib import Path

def create_env_file():
    """创建.env文件"""
    print("🔑 欧易API配置助手")
    print("=" * 50)
    print()
    
    print("⚠️  重要提醒：")
    print("- 请确保您已经在欧易网站创建了API密钥")
    print("- 请妥善保管您的API信息，不要泄露给他人")
    print("- 建议先使用测试环境（沙盒模式）")
    print()
    
    # 获取API信息
    print("请输入您的API信息：")
    api_key = input("API Key: ").strip()
    secret_key = getpass.getpass("Secret Key: ").strip()
    passphrase = getpass.getpass("Passphrase: ").strip()
    
    # 询问是否使用沙盒环境
    print()
    print("环境选择：")
    print("1. 测试环境（沙盒模式）- 推荐新手")
    print("2. 真实环境 - 有资金风险")
    env_choice = input("请选择环境 (1/2): ").strip()
    
    sandbox = "true" if env_choice == "1" else "false"
    
    # 交易配置
    print()
    print("交易配置：")
    trade_amount = input("每次交易金额（USDT，默认100）: ").strip() or "100"
    max_positions = input("最大持仓数量（默认3）: ").strip() or "3"
    
    # 创建.env文件内容
    env_content = f"""# 欧易API配置
# 请妥善保管这些信息，不要泄露给他人

# API密钥信息
OKEX_API_KEY={api_key}
OKEX_SECRET_KEY={secret_key}
OKEX_PASSPHRASE={passphrase}

# 环境设置
OKEX_SANDBOX={sandbox}

# 交易配置
TRADE_AMOUNT={trade_amount}
MAX_POSITIONS={max_positions}
"""
    
    # 写入文件
    env_file = Path(".env")
    with open(env_file, "w", encoding="utf-8") as f:
        f.write(env_content)
    
    print()
    print("✅ 配置完成！")
    print(f"配置文件已保存到: {env_file.absolute()}")
    print()
    
    if sandbox == "true":
        print("🎯 当前使用测试环境，可以安全地进行模拟交易")
    else:
        print("⚠️  当前使用真实环境，请务必谨慎操作！")
    
    print()
    print("下一步操作：")
    print("1. 运行: python main.py --mode web")
    print("2. 访问: http://127.0.0.1:8050")
    print("3. 检查系统状态是否正常")
    print()
    
    return True

def check_env_file():
    """检查.env文件是否存在"""
    env_file = Path(".env")
    if env_file.exists():
        print("📁 发现现有的.env文件")
        choice = input("是否要重新配置？(y/N): ").strip().lower()
        if choice == 'y':
            return create_env_file()
        else:
            print("保持现有配置不变")
            return False
    else:
        return create_env_file()

def main():
    """主函数"""
    try:
        check_env_file()
    except KeyboardInterrupt:
        print("\n\n❌ 配置已取消")
    except Exception as e:
        print(f"\n❌ 配置过程中出现错误: {e}")

if __name__ == "__main__":
    main() 