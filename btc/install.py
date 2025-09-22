#!/usr/bin/env python3
"""
自动安装脚本
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, description):
    """运行命令并显示结果"""
    print(f"正在{description}...")
    try:
        # 在Windows上，使用列表形式避免路径空格问题
        if os.name == 'nt':
            result = subprocess.run(command, shell=True, check=True, 
                                  capture_output=True, text=True, encoding='utf-8')
        else:
            result = subprocess.run(command, shell=True, check=True, 
                                  capture_output=True, text=True)
        print(f"✅ {description}成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description}失败: {e}")
        if e.stderr:
            print(f"错误输出: {e.stderr}")
        return False

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 8):
        print("❌ 需要Python 3.8或更高版本")
        return False
    print(f"✅ Python版本: {sys.version}")
    return True

def install_dependencies():
    """安装依赖包"""
    print("开始安装依赖包...")
    
    # 升级pip - 使用更安全的方式处理路径
    pip_command = [sys.executable, "-m", "pip", "install", "--upgrade", "pip", "-i", "https://pypi.tuna.tsinghua.edu.cn/simple/"]
    print("正在升级pip...")
    try:
        result = subprocess.run(pip_command, check=True, capture_output=True, text=True, encoding='utf-8')
        print("✅ 升级pip成功")
    except subprocess.CalledProcessError as e:
        print(f"❌ 升级pip失败: {e}")
        if e.stderr:
            print(f"错误输出: {e.stderr}")
        return False
    
    # 安装TA-Lib (Windows) - 跳过编译版本，使用预编译版本
    if os.name == 'nt':
        print("检测到Windows系统，跳过TA-Lib安装...")
        print("⚠️ TA-Lib需要手动安装:")
        print("1. 访问 https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib")
        print("2. 下载对应Python版本的whl文件 (例如: TA_Lib‑0.4.28‑cp38‑cp38‑win_amd64.whl)")
        print("3. 使用 pip install 下载的文件名.whl 安装")
        print("4. 或者暂时跳过TA-Lib，程序仍可运行但技术分析功能受限")
        
        # 创建修改后的requirements文件（不包含TA-Lib）
        temp_requirements = "requirements_temp.txt"
        with open("requirements.txt", "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        with open(temp_requirements, "w", encoding="utf-8") as f:
            for line in lines:
                if not line.strip().startswith("ta-lib"):
                    f.write(line)
        
        print(f"✅ 已创建临时requirements文件: {temp_requirements}")
        requirements_file = temp_requirements
    else:
        requirements_file = "requirements.txt"
    
    # 安装其他依赖
    requirements_command = [sys.executable, "-m", "pip", "install", "-r", requirements_file, "-i", "https://pypi.tuna.tsinghua.edu.cn/simple/"]
    try:
        result = subprocess.run(requirements_command, check=True, capture_output=True, text=True, encoding='utf-8')
        print("✅ 安装依赖包成功")
        
        # 清理临时文件
        if os.name == 'nt' and os.path.exists("requirements_temp.txt"):
            os.remove("requirements_temp.txt")
            print("✅ 已清理临时文件")
            
    except subprocess.CalledProcessError as e:
        print(f"❌ 安装依赖包失败: {e}")
        if e.stderr:
            print(f"错误输出: {e.stderr}")
        return False
    
    return True

def create_env_file():
    """创建环境配置文件"""
    env_file = Path(".env")
    if env_file.exists():
        print("✅ .env文件已存在")
        return True
    
    env_example = Path(".env.example")
    if env_example.exists():
        shutil.copy(env_example, env_file)
        print("✅ 已创建.env配置文件")
        print("⚠️ 请编辑.env文件，填入您的API配置")
        return True
    else:
        # 创建基本的.env文件
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write("""# 欧易API配置
OKEX_API_KEY=your_api_key_here
OKEX_SECRET_KEY=your_secret_key_here
OKEX_PASSPHRASE=your_passphrase_here
OKEX_SANDBOX=True

# 交易配置
TRADE_AMOUNT=100
MAX_POSITIONS=3
""")
        print("✅ 已创建.env配置文件模板")
        print("⚠️ 请编辑.env文件，填入您的API配置")
        return True

def main():
    """主安装流程"""
    print("=" * 60)
    print("虚拟币自动交易系统 - 安装程序")
    print("=" * 60)
    
    # 检查Python版本
    if not check_python_version():
        sys.exit(1)
    
    # 安装依赖
    if not install_dependencies():
        print("❌ 依赖安装失败，请检查错误信息")
        sys.exit(1)
    
    # 创建配置文件
    if not create_env_file():
        print("❌ 配置文件创建失败")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 安装完成！")
    print("=" * 60)
    print("\n下一步操作:")
    print("1. 编辑.env文件，配置您的欧易API密钥")
    print("2. 运行程序:")
    print("   python main.py --mode web    # Web界面模式")
    print("   python main.py --mode cli    # 命令行分析")
    print("   python main.py --mode auto   # 自动交易模式")
    print("\n⚠️ 风险提示:")
    print("- 建议先在沙盒环境测试")
    print("- 虚拟币交易存在风险，请谨慎操作")
    print("- 本程序仅供学习交流使用")

if __name__ == '__main__':
    main()