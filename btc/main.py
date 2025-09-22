#!/usr/bin/env python3
"""
虚拟币自动交易系统主程序
"""

import sys
import os
import logging
import argparse
from datetime import datetime
import threading
import time
from config import Config
from trading_strategy import TradingStrategy
from web_dashboard import app

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('trading_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TradingBot:
    """交易机器人主类"""
    
    def __init__(self):
        self.strategy = TradingStrategy()
        self.running = False
        self.auto_trade_enabled = False
        
    def start_trading(self, symbol: str = None):
        """启动自动交易"""
        if symbol is None:
            symbol = Config.DEFAULT_SYMBOL
            
        self.running = True
        self.auto_trade_enabled = True
        
        logger.info(f"开始自动交易: {symbol}")
        
        while self.running:
            try:
                if self.auto_trade_enabled:
                    result = self.strategy.run_strategy(symbol)
                    
                    if result.get('status') == 'success':
                        logger.info(f"策略运行完成 - 价格: ${result.get('current_price', 0):.2f}")
                        
                        if result.get('trade_executed'):
                            logger.info("执行了交易操作")
                    else:
                        logger.error(f"策略运行失败: {result.get('message', 'Unknown error')}")
                
                # 等待下一次运行
                time.sleep(Config.UPDATE_INTERVAL)
                
            except KeyboardInterrupt:
                logger.info("接收到停止信号")
                break
            except Exception as e:
                logger.error(f"交易循环出错: {e}")
                time.sleep(10)  # 出错后等待10秒再继续
        
        logger.info("自动交易已停止")
    
    def stop_trading(self):
        """停止自动交易"""
        self.running = False
        self.auto_trade_enabled = False
        logger.info("正在停止交易...")
    
    def get_status(self):
        """获取机器人状态"""
        return {
            'running': self.running,
            'auto_trade_enabled': self.auto_trade_enabled,
            'last_update': datetime.now()
        }

def check_environment():
    """检查运行环境"""
    logger.info("检查运行环境...")
    
    # 检查API配置
    if not Config.OKEX_API_KEY:
        logger.warning("未配置欧易API密钥，将使用模拟模式")
    else:
        logger.info("API配置已加载")
    
    # 检查依赖
    try:
        import ccxt
        import pandas
        import numpy
        import dash
        logger.info("所有依赖包检查完成")
    except ImportError as e:
        logger.error(f"缺少依赖包: {e}")
        return False
    
    return True

def print_banner():
    """打印启动横幅"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                    虚拟币自动交易系统                          ║
    ║                   Crypto Auto Trading Bot                   ║
    ║                                                              ║
    ║  功能特点:                                                    ║
    ║  • 基于技术分析的自动交易                                      ║
    ║  • 支持欧易交易所现货交易                                      ║
    ║  • Web可视化监控界面                                          ║
    ║  • 完善的风险控制机制                                          ║
    ║                                                              ║
    ║  访问 http://127.0.0.1:8050 查看Web界面                      ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='虚拟币自动交易系统')
    parser.add_argument('--mode', choices=['web', 'cli', 'auto'], default='web',
                       help='运行模式: web(Web界面), cli(命令行), auto(自动交易)')
    parser.add_argument('--symbol', default=Config.DEFAULT_SYMBOL,
                       help='交易对 (默认: BTC/USDT)')
    parser.add_argument('--no-trade', action='store_true',
                       help='仅分析模式，不执行实际交易')
    
    args = parser.parse_args()
    
    print_banner()
    
    # 检查环境
    if not check_environment():
        logger.error("环境检查失败，程序退出")
        sys.exit(1)
    
    # 创建交易机器人
    bot = TradingBot()
    
    try:
        if args.mode == 'web':
            # Web界面模式
            logger.info("启动Web界面模式")
            logger.info(f"Web界面地址: http://{Config.WEB_HOST}:{Config.WEB_PORT}")
            app.run(host=Config.WEB_HOST, port=Config.WEB_PORT, debug=False)
            
        elif args.mode == 'cli':
            # 命令行模式 - 单次分析
            logger.info("运行单次分析")
            result = bot.strategy.run_strategy(args.symbol)
            
            print(f"\n=== 分析结果 ({args.symbol}) ===")
            print(f"当前价格: ${result.get('current_price', 0):.2f}")
            print(f"买入信号: {'是' if result.get('buy_signal') else '否'}")
            print(f"卖出信号: {'是' if result.get('sell_signal') else '否'}")
            
            if 'analysis' in result:
                analysis = result['analysis']
                print(f"趋势: {analysis.get('trend', 'N/A')}")
                print(f"强度: {analysis.get('strength', 0):.2f}")
                print(f"RSI: {analysis.get('rsi', 0):.1f}")
                print(f"MACD: {analysis.get('macd', 0):.4f}")
            
            # 显示账户信息
            account = bot.strategy.get_account_summary()
            print(f"\n=== 账户信息 ===")
            print(f"持仓数量: {account.get('open_positions', 0)}")
            print(f"总交易次数: {account.get('total_trades', 0)}")
            print(f"总盈亏: ${account.get('total_profit', 0):.2f}")
            
        elif args.mode == 'auto':
            # 自动交易模式
            if args.no_trade:
                logger.info("仅分析模式，不会执行实际交易")
                bot.auto_trade_enabled = False
            
            logger.info(f"启动自动交易模式 - 交易对: {args.symbol}")
            
            # 在后台线程启动Web界面
            web_thread = threading.Thread(
                target=lambda: app.run(
                    host=Config.WEB_HOST, 
                    port=Config.WEB_PORT, 
                    debug=False
                )
            )
            web_thread.daemon = True
            web_thread.start()
            
            logger.info(f"Web监控界面: http://{Config.WEB_HOST}:{Config.WEB_PORT}")
            
            # 启动交易循环
            bot.start_trading(args.symbol)
            
    except KeyboardInterrupt:
        logger.info("接收到停止信号")
        bot.stop_trading()
    except Exception as e:
        logger.error(f"程序运行出错: {e}")
        sys.exit(1)
    finally:
        logger.info("程序结束")

if __name__ == '__main__':
    main()