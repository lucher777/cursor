@echo off
chcp 65001 >nul
echo.
echo 🗜️  代码压缩工具
echo ============================================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到Python，请先安装Python 3.x
    echo 📥 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查压缩脚本是否存在
if not exist "compress.py" (
    echo ❌ 错误：未找到compress.py文件
    pause
    exit /b 1
)

echo ✅ Python环境检查通过
echo.

REM 运行压缩脚本
python compress.py

echo.
echo 按任意键退出...
pause >nul