# 虚拟币自动交易系统 - PowerShell启动脚本
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "虚拟币自动交易系统 - 快速启动" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "请选择运行模式:" -ForegroundColor Yellow
Write-Host "1. Web界面模式 (推荐新手)" -ForegroundColor Green
Write-Host "2. 命令行分析模式" -ForegroundColor Green
Write-Host "3. 自动交易模式 (需要API配置)" -ForegroundColor Red
Write-Host "4. 退出" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "请输入选择 (1-4)"

switch ($choice) {
    "1" {
        Write-Host "启动Web界面模式..." -ForegroundColor Green
        python main.py --mode web
    }
    "2" {
        Write-Host "启动命令行分析模式..." -ForegroundColor Green
        python main.py --mode cli
    }
    "3" {
        Write-Host "启动自动交易模式..." -ForegroundColor Red
        Write-Host "警告: 此模式将执行实际交易，请确保已正确配置API密钥" -ForegroundColor Red
        $confirm = Read-Host "确认继续? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            python main.py --mode auto
        } else {
            Write-Host "已取消" -ForegroundColor Yellow
        }
    }
    "4" {
        Write-Host "退出程序" -ForegroundColor Gray
        exit 0
    }
    default {
        Write-Host "无效选择，请重新运行脚本" -ForegroundColor Red
        Read-Host "按任意键继续..."
        exit 1
    }
}

Write-Host ""
Write-Host "程序已退出" -ForegroundColor Gray
Read-Host "按任意键继续..."