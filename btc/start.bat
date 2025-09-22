@echo off
chcp 65001 > nul
echo ========================================
echo      虚拟币自动交易系统
echo ========================================
echo.
echo 选择运行模式:
echo 1. Web界面模式 (推荐)
echo 2. 命令行分析模式
echo 3. 自动交易模式
echo 4. 退出
echo.
set /p choice=请输入选择 (1-4): 

if "%choice%"=="1" (
    echo 启动Web界面模式...
    python main.py --mode web
) else if "%choice%"=="2" (
    echo 运行命令行分析...
    python main.py --mode cli
    pause
) else if "%choice%"=="3" (
    echo 启动自动交易模式...
    echo 警告: 这将执行实际交易操作!
    set /p confirm=确认启动自动交易? (y/N): 
    if /i "%confirm%"=="y" (
        python main.py --mode auto
    ) else (
        echo 已取消
    )
) else if "%choice%"=="4" (
    exit
) else (
    echo 无效选择
    pause
    goto start
)

pause