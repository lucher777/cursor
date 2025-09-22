import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # 欧易API配置
    OKEX_API_KEY = '9e01cd6a-f0fe-44a0-ab05-f670a34e30de'
    OKEX_SECRET_KEY = 'CE24A787AA3157F9F12CA17E692F38E0'
    OKEX_PASSPHRASE = '17665157235'
    OKEX_SANDBOX = False  # 设置为False表示使用真实环境
    
    # 交易配置
    DEFAULT_SYMBOL = 'BTC/USDT'
    TRADE_AMOUNT = float(os.getenv('TRADE_AMOUNT', '100'))  # USDT
    MAX_POSITIONS = int(os.getenv('MAX_POSITIONS', '3'))
    
    # 技术指标参数
    RSI_PERIOD = 14
    RSI_OVERSOLD = 30
    RSI_OVERBOUGHT = 70
    
    MACD_FAST = 12
    MACD_SLOW = 26
    MACD_SIGNAL = 9
    
    MA_SHORT = 20
    MA_LONG = 50
    
    # 风险控制
    STOP_LOSS_PERCENT = 0.02  # 2%止损
    TAKE_PROFIT_PERCENT = 0.03  # 3%止盈
    
    # 不同币种的参数配置
    SYMBOL_PARAMS = {
        # 低波动币种 (保守策略)
        'BTC/USDT': {
            'rsi_oversold': 30,
            'rsi_overbought': 70,
            'stop_loss': 0.02,
            'take_profit': 0.03,
            'volatility': 'low'
        },
        'ETH/USDT': {
            'rsi_oversold': 30,
            'rsi_overbought': 70,
            'stop_loss': 0.025,
            'take_profit': 0.035,
            'volatility': 'low'
        },
        'BNB/USDT': {
            'rsi_oversold': 30,
            'rsi_overbought': 70,
            'stop_loss': 0.025,
            'take_profit': 0.035,
            'volatility': 'low'
        },
        
        # 中等波动币种 (平衡策略)
        'ADA/USDT': {
            'rsi_oversold': 28,
            'rsi_overbought': 72,
            'stop_loss': 0.03,
            'take_profit': 0.045,
            'volatility': 'medium'
        },
        'DOT/USDT': {
            'rsi_oversold': 28,
            'rsi_overbought': 72,
            'stop_loss': 0.03,
            'take_profit': 0.045,
            'volatility': 'medium'
        },
        'ATOM/USDT': {
            'rsi_oversold': 28,
            'rsi_overbought': 72,
            'stop_loss': 0.03,
            'take_profit': 0.045,
            'volatility': 'medium'
        },
        'ALGO/USDT': {
            'rsi_oversold': 28,
            'rsi_overbought': 72,
            'stop_loss': 0.03,
            'take_profit': 0.045,
            'volatility': 'medium'
        },
        'VET/USDT': {
            'rsi_oversold': 28,
            'rsi_overbought': 72,
            'stop_loss': 0.03,
            'take_profit': 0.045,
            'volatility': 'medium'
        },
        'LTC/USDT': {
            'rsi_oversold': 28,
            'rsi_overbought': 72,
            'stop_loss': 0.03,
            'take_profit': 0.045,
            'volatility': 'medium'
        },
        
        # 高波动币种 (激进策略)
        'SOL/USDT': {
            'rsi_oversold': 25,
            'rsi_overbought': 75,
            'stop_loss': 0.04,
            'take_profit': 0.06,
            'volatility': 'high'
        },
        'AVAX/USDT': {
            'rsi_oversold': 25,
            'rsi_overbought': 75,
            'stop_loss': 0.04,
            'take_profit': 0.06,
            'volatility': 'high'
        },
        'NEAR/USDT': {
            'rsi_oversold': 25,
            'rsi_overbought': 75,
            'stop_loss': 0.04,
            'take_profit': 0.06,
            'volatility': 'high'
        },
        'LINK/USDT': {
            'rsi_oversold': 25,
            'rsi_overbought': 75,
            'stop_loss': 0.04,
            'take_profit': 0.06,
            'volatility': 'high'
        },
        'UNI/USDT': {
            'rsi_oversold': 25,
            'rsi_overbought': 75,
            'stop_loss': 0.04,
            'take_profit': 0.06,
            'volatility': 'high'
        },
        'MATIC/USDT': {
            'rsi_oversold': 25,
            'rsi_overbought': 75,
            'stop_loss': 0.04,
            'take_profit': 0.06,
            'volatility': 'high'
        },
        'FIL/USDT': {
            'rsi_oversold': 25,
            'rsi_overbought': 75,
            'stop_loss': 0.04,
            'take_profit': 0.06,
            'volatility': 'high'
        },
        'BCH/USDT': {
            'rsi_oversold': 25,
            'rsi_overbought': 75,
            'stop_loss': 0.04,
            'take_profit': 0.06,
            'volatility': 'high'
        },
        'XRP/USDT': {
            'rsi_oversold': 25,
            'rsi_overbought': 75,
            'stop_loss': 0.04,
            'take_profit': 0.06,
            'volatility': 'high'
        },
        
        # 极高波动币种 (超激进策略)
        'FTM/USDT': {
            'rsi_oversold': 20,
            'rsi_overbought': 80,
            'stop_loss': 0.05,
            'take_profit': 0.08,
            'volatility': 'extreme'
        },
        'ICP/USDT': {
            'rsi_oversold': 20,
            'rsi_overbought': 80,
            'stop_loss': 0.06,
            'take_profit': 0.1,
            'volatility': 'extreme'
        }
    }
    
    # Web界面配置
    WEB_HOST = '127.0.0.1'
    WEB_PORT = 8050
    
    # 数据更新间隔(秒)
    UPDATE_INTERVAL = 1