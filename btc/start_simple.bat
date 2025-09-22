@echo off
chcp 65001 >nul
echo ============================================================
echo 虚拟币自动交易系统 - 快速启动
echo ============================================================
echo.

echo 请选择运行模式:
echo 1. Web界面模式 (推荐新手)
echo 2. 命令行分析模式
echo 3. 自动交易模式 (需要API配置)
echo 4. 退出
echo.

set /p choice=请输入选择 (1-4): 

if "%choice%"=="1" goto web_mode
if "%choice%"=="2" goto cli_mode
if "%choice%"=="3" goto auto_mode
if "%choice%"=="4" goto exit_program
goto invalid_choice

:web_mode
echo 启动Web界面模式...
python main.py --mode web
goto end

:cli_mode
echo 启动命令行分析模式...
python main.py --mode cli
goto end

:auto_mode
echo 启动自动交易模式...
echo 警告: 此模式将执行实际交易，请确保已正确配置API密钥
set /p confirm=确认继续? (y/N): 
if /i "%confirm%"=="y" (
    python main.py --mode auto
) else (
    echo 已取消
)
goto end

:exit_program
echo 退出程序
exit /b 0

:invalid_choice
echo 无效选择，请重新运行脚本
pause
exit /b 1

:end
echo.
echo 程序已退出
pause 