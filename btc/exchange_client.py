import ccxt
import pandas as pd
import time
import hmac
import hashlib
import base64
import requests
import json
from datetime import datetime
from typing import Dict, List, Optional
from config import Config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OKExClient:
    """欧易交易所客户端"""
    
    def __init__(self):
        self.exchange = None
        self.api_url = "https://www.okx.com" if not Config.OKEX_SANDBOX else "https://www.okx.com"
        self.initialize_exchange()
    
    def initialize_exchange(self):
        """初始化交易所连接"""
        try:
            if not Config.OKEX_API_KEY:
                logger.warning("未配置API密钥，将使用模拟数据")
                self.exchange = None
                return
            
            self.exchange = ccxt.okx({
                'apiKey': Config.OKEX_API_KEY,
                'secret': Config.OKEX_SECRET_KEY,
                'password': Config.OKEX_PASSPHRASE,
                'sandbox': Config.OKEX_SANDBOX,
                'enableRateLimit': True,
                'options': {
                    'defaultType': 'spot',  # 现货交易
                }
            })
            
            # 测试连接
            try:
                # 尝试获取服务器时间而不是余额（不需要特殊权限）
                server_time = self.exchange.fetch_time()
                logger.info(f"欧易API连接成功，服务器时间: {server_time}")
            except Exception as e:
                logger.error(f"API连接测试失败: {e}")
                logger.info("将使用模拟数据进行演示")
                self.exchange = None
                
        except Exception as e:
            logger.error(f"初始化交易所连接失败: {e}")
            logger.info("将使用模拟数据进行演示")
            self.exchange = None
    
    def get_kline_data(self, symbol: str, timeframe: str = '1h', limit: int = 100) -> pd.DataFrame:
        """获取K线数据"""
        try:
            if not self.exchange:
                # 使用模拟数据
                return self._generate_mock_data(symbol, limit)
            
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
            df.set_index('datetime', inplace=True)
            
            return df
            
        except Exception as e:
            logger.error(f"获取K线数据失败: {e}")
            # 使用模拟数据作为备用
            return self._generate_mock_data(symbol, limit)
    
    def _generate_mock_data(self, symbol: str, limit: int = 100) -> pd.DataFrame:
        """生成模拟K线数据"""
        import numpy as np
        from datetime import datetime, timedelta
        
        # 更准确的基础价格（2024年12月的大致价格）
        price_map = {
            'BTC/USDT': 43000,
            'ETH/USDT': 2300,
            'BNB/USDT': 240,
            'ADA/USDT': 0.45,
            'DOT/USDT': 7.2,
            'ATOM/USDT': 9.8,
            'ALGO/USDT': 0.18,
            'VET/USDT': 0.025,
            'LTC/USDT': 68,
            'SOL/USDT': 95,
            'AVAX/USDT': 38,
            'NEAR/USDT': 4.2,
            'LINK/USDT': 15.5,
            'UNI/USDT': 7.8,
            'MATIC/USDT': 0.85,
            'FIL/USDT': 4.5,
            'BCH/USDT': 230,
            'XRP/USDT': 0.62,
            'FTM/USDT': 0.35,
            'ICP/USDT': 12.5
        }
        
        base_price = price_map.get(symbol, 1.0)
        
        # 生成时间序列
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=limit)
        timestamps = [start_time + timedelta(hours=i) for i in range(limit)]
        
        # 生成价格数据（带随机波动）
        np.random.seed(42)  # 固定种子，确保数据一致性
        price_changes = np.random.normal(0, 0.02, limit)  # 2%的标准差
        prices = [base_price]
        
        for change in price_changes[1:]:
            new_price = prices[-1] * (1 + change)
            prices.append(max(new_price, base_price * 0.5))  # 防止价格过低
        
        # 生成OHLCV数据
        data = []
        for i, (timestamp, price) in enumerate(zip(timestamps, prices)):
            # 生成开盘、最高、最低、收盘价
            volatility = price * 0.01  # 1%的波动
            open_price = price + np.random.normal(0, volatility)
            high_price = max(open_price, price) + np.random.uniform(0, volatility)
            low_price = min(open_price, price) - np.random.uniform(0, volatility)
            close_price = price
            
            # 生成成交量
            volume = np.random.uniform(100, 1000)
            
            data.append({
                'timestamp': int(timestamp.timestamp() * 1000),
                'open': open_price,
                'high': high_price,
                'low': low_price,
                'close': close_price,
                'volume': volume
            })
        
        df = pd.DataFrame(data)
        df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
        df.set_index('datetime', inplace=True)
        
        logger.info(f"生成模拟数据: {symbol}, 数据点: {len(df)}")
        return df
    
    def get_ticker(self, symbol: str) -> Dict:
        """获取实时价格"""
        try:
            if not self.exchange:
                # 使用模拟数据
                return self._generate_mock_ticker(symbol)
            
            ticker = self.exchange.fetch_ticker(symbol)
            
            # 验证数据有效性
            if not ticker or 'last' not in ticker or ticker['last'] is None:
                logger.warning(f"获取到的价格数据无效: {symbol}")
                return self._generate_mock_ticker(symbol)
            
            return {
                'symbol': symbol,
                'price': ticker['last'],
                'bid': ticker.get('bid', ticker['last']),
                'ask': ticker.get('ask', ticker['last']),
                'volume': ticker.get('baseVolume', 0),
                'change': ticker.get('change', 0),
                'percentage': ticker.get('percentage', 0)
            }
            
        except Exception as e:
            logger.error(f"获取价格数据失败 {symbol}: {e}")
            # 使用模拟数据作为备用
            return self._generate_mock_ticker(symbol)
    
    def _generate_mock_ticker(self, symbol: str) -> Dict:
        """生成模拟价格数据"""
        import numpy as np
        import time
        
        # 更准确的基础价格（2024年12月的大致价格）
        price_map = {
            'BTC/USDT': 43000,
            'ETH/USDT': 2300,
            'BNB/USDT': 240,
            'ADA/USDT': 0.45,
            'DOT/USDT': 7.2,
            'ATOM/USDT': 9.8,
            'ALGO/USDT': 0.18,
            'VET/USDT': 0.025,
            'LTC/USDT': 68,
            'SOL/USDT': 95,
            'AVAX/USDT': 38,
            'NEAR/USDT': 4.2,
            'LINK/USDT': 15.5,
            'UNI/USDT': 7.8,
            'MATIC/USDT': 0.85,
            'FIL/USDT': 4.5,
            'BCH/USDT': 230,
            'XRP/USDT': 0.62,
            'FTM/USDT': 0.35,
            'ICP/USDT': 12.5
        }
        
        base_price = price_map.get(symbol, 1.0)
        
        # 添加时间相关的波动
        current_time = time.time()
        time_factor = np.sin(current_time / 3600) * 0.1  # 每小时波动10%
        
        # 添加随机波动
        np.random.seed(int(current_time) % 1000)
        random_factor = np.random.normal(0, 0.02)  # 2%的随机波动
        
        # 计算当前价格
        current_price = base_price * (1 + time_factor + random_factor)
        
        # 计算买卖价差
        spread = current_price * 0.001  # 0.1%的价差
        bid_price = current_price - spread / 2
        ask_price = current_price + spread / 2
        
        # 计算变化
        change = current_price - base_price
        percentage = (change / base_price) * 100
        
        return {
            'symbol': symbol,
            'price': round(current_price, 2),
            'bid': round(bid_price, 2),
            'ask': round(ask_price, 2),
            'volume': round(np.random.uniform(1000, 10000), 2),
            'change': round(change, 2),
            'percentage': round(percentage, 2)
        }
    
    def get_balance(self) -> Dict:
        """获取账户余额"""
        try:
            if not self.exchange or not Config.OKEX_API_KEY:
                return {}
            
            balance = self.exchange.fetch_balance()
            return balance['total']
            
        except Exception as e:
            logger.error(f"获取余额失败: {e}")
            return {}
    
    def place_buy_order(self, symbol: str, amount: float, price: Optional[float] = None) -> Dict:
        """下买单"""
        try:
            if not self.exchange or not Config.OKEX_API_KEY:
                logger.warning("未配置API密钥，无法下单")
                return {}
            
            if price:
                # 限价买单
                order = self.exchange.create_limit_buy_order(symbol, amount, price)
            else:
                # 市价买单
                order = self.exchange.create_market_buy_order(symbol, amount)
            
            logger.info(f"买单已提交: {order['id']}")
            return order
            
        except Exception as e:
            logger.error(f"下买单失败: {e}")
            return {}
    
    def place_sell_order(self, symbol: str, amount: float, price: Optional[float] = None) -> Dict:
        """下卖单"""
        try:
            if not self.exchange or not Config.OKEX_API_KEY:
                logger.warning("未配置API密钥，无法下单")
                return {}
            
            if price:
                # 限价卖单
                order = self.exchange.create_limit_sell_order(symbol, amount, price)
            else:
                # 市价卖单
                order = self.exchange.create_market_sell_order(symbol, amount)
            
            logger.info(f"卖单已提交: {order['id']}")
            return order
            
        except Exception as e:
            logger.error(f"下卖单失败: {e}")
            return {}
    
    def get_order_status(self, order_id: str, symbol: str) -> Dict:
        """查询订单状态"""
        try:
            if not self.exchange or not Config.OKEX_API_KEY:
                return {}
            
            order = self.exchange.fetch_order(order_id, symbol)
            return order
            
        except Exception as e:
            logger.error(f"查询订单状态失败: {e}")
            return {}
    
    def cancel_order(self, order_id: str, symbol: str) -> bool:
        """取消订单"""
        try:
            if not self.exchange or not Config.OKEX_API_KEY:
                return False
            
            self.exchange.cancel_order(order_id, symbol)
            logger.info(f"订单已取消: {order_id}")
            return True
            
        except Exception as e:
            logger.error(f"取消订单失败: {e}")
            return False
    
    def get_open_orders(self, symbol: str) -> List[Dict]:
        """获取未成交订单"""
        try:
            if not self.exchange or not Config.OKEX_API_KEY:
                return []
            
            orders = self.exchange.fetch_open_orders(symbol)
            return orders
            
        except Exception as e:
            logger.error(f"获取未成交订单失败: {e}")
            return []
    
    def _generate_signature(self, timestamp: str, method: str, request_path: str, body: str = '') -> str:
        """生成OKX API签名"""
        try:
            # 构建签名字符串: timestamp + method + requestPath + body
            message = timestamp + method + request_path + body
            
            # 使用HMAC SHA256加密
            mac = hmac.new(
                bytes(Config.OKEX_SECRET_KEY, encoding='utf8'),
                bytes(message, encoding='utf-8'),
                digestmod='sha256'
            )
            
            # Base64编码
            signature = base64.b64encode(mac.digest()).decode()
            return signature
            
        except Exception as e:
            logger.error(f"生成签名失败: {e}")
            return ""
    
    def _encode_passphrase(self, passphrase: str) -> str:
        """对Passphrase进行Base64编码"""
        try:
            # 使用更标准的Base64编码方式
            return base64.b64encode(passphrase.encode('utf-8')).decode('utf-8')
        except Exception as e:
            logger.error(f"Passphrase编码失败: {e}")
            return passphrase
    
    def _encode_passphrase_alternative(self, passphrase: str) -> str:
        """对Passphrase进行替代编码方式"""
        try:
            # 尝试不同的编码方式
            import hashlib
            # 先进行SHA256哈希，然后Base64编码
            hash_object = hashlib.sha256(passphrase.encode('utf-8'))
            hash_hex = hash_object.hexdigest()
            return base64.b64encode(hash_hex.encode('utf-8')).decode('utf-8')
        except Exception as e:
            logger.error(f"Passphrase替代编码失败: {e}")
            return passphrase
    
    def get_balance_v5_api(self, ccy: str = None) -> Dict:
        """使用OKX V5 API获取账户余额
        
        Args:
            ccy: 币种，如BTC、ETH等，不传则获取所有币种余额
            
        Returns:
            Dict: 余额信息
        """
        try:
            if not Config.OKEX_API_KEY or not Config.OKEX_SECRET_KEY or not Config.OKEX_PASSPHRASE:
                logger.warning("API密钥配置不完整，无法获取余额")
                return {"error": "API密钥配置不完整"}
            
            # 构建请求路径
            request_path = "/api/v5/account/balance"
            if ccy:
                request_path += f"?ccy={ccy}"
            
            # 获取当前时间戳（ISO格式）
            timestamp = datetime.utcnow().isoformat()[:-3] + 'Z'
            
            # 生成签名
            signature = self._generate_signature(timestamp, 'GET', request_path)
            
            if not signature:
                return {"error": "签名生成失败"}
            
            # 构建请求头
            headers = {
                'OK-ACCESS-KEY': Config.OKEX_API_KEY,
                'OK-ACCESS-SIGN': signature,
                'OK-ACCESS-TIMESTAMP': timestamp,
                'OK-ACCESS-PASSPHRASE': self._encode_passphrase(Config.OKEX_PASSPHRASE),
                'Content-Type': 'application/json'
            }
            
            # 发送请求
            url = self.api_url + request_path
            logger.info(f"请求OKX余额API: {url}")
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"余额查询成功: {data}")
                return data
            else:
                logger.error(f"余额查询失败，状态码: {response.status_code}, 响应: {response.text}")
                # 如果API调用失败，返回模拟数据
                logger.info("API调用失败，使用模拟数据")
                return self.get_mock_balance()
                
        except requests.exceptions.RequestException as e:
            logger.error(f"网络请求异常: {e}")
            logger.info("网络异常，使用模拟数据")
            return self.get_mock_balance()
        except Exception as e:
            logger.error(f"获取余额异常: {e}")
            logger.info("发生异常，使用模拟数据")
            return self.get_mock_balance()
    
    def get_mock_balance(self) -> Dict:
        """获取模拟余额数据"""
        return {
            "code": "0",
            "msg": "",
            "data": [
                {
                    "acctId": "123456789",
                    "ccy": "BTC",
                    "cashBal": "0.12345678",
                    "upl": "0.00123456",
                    "uplLib": "0.00123456",
                    "crossLiab": "0",
                    "isoLiab": "0",
                    "mgnRatio": "0",
                    "mmr": "0",
                    "marginRatio": "0",
                    "totalEq": "0.12469134",
                    "uplRatio": "0.01",
                    "ordFroz": "0",
                    "availBal": "0.12345678",
                    "availEq": "0.12469134",
                    "disEq": "0.12469134",
                    "eq": "0.12469134"
                },
                {
                    "acctId": "123456789",
                    "ccy": "ETH",
                    "cashBal": "2.56789012",
                    "upl": "0.01234567",
                    "uplLib": "0.01234567",
                    "crossLiab": "0",
                    "isoLiab": "0",
                    "mgnRatio": "0",
                    "mmr": "0",
                    "marginRatio": "0",
                    "totalEq": "2.58023579",
                    "uplRatio": "0.0048",
                    "ordFroz": "0",
                    "availBal": "2.56789012",
                    "availEq": "2.58023579",
                    "disEq": "2.58023579",
                    "eq": "2.58023579"
                },
                {
                    "acctId": "123456789",
                    "ccy": "USDT",
                    "cashBal": "1000.00",
                    "upl": "0",
                    "uplLib": "0",
                    "crossLiab": "0",
                    "isoLiab": "0",
                    "mgnRatio": "0",
                    "mmr": "0",
                    "marginRatio": "0",
                    "totalEq": "1000.00",
                    "uplRatio": "0",
                    "ordFroz": "0",
                    "availBal": "1000.00",
                    "availEq": "1000.00",
                    "disEq": "1000.00",
                    "eq": "1000.00"
                }
            ]
        }
    
    def get_instruments(self, inst_type: str, uly: str = None, inst_family: str = None, inst_id: str = None) -> Dict:
        """获取交易产品基础信息
        
        Args:
            inst_type: 产品类型 (SPOT/MARGIN/SWAP/FUTURES/OPTION)
            uly: 标的指数，仅适用于交割/永续/期权，期权必填
            inst_family: 交易品种，仅适用于交割/永续/期权
            inst_id: 产品ID
            
        Returns:
            Dict: 产品信息列表
        """
        try:
            if not Config.OKEX_API_KEY or not Config.OKEX_SECRET_KEY or not Config.OKEX_PASSPHRASE:
                logger.warning("API密钥配置不完整，使用模拟数据")
                return self._get_mock_instruments(inst_type, uly, inst_family, inst_id)
            
            # 构建请求路径
            request_path = "/api/v5/account/instruments"
            params = []
            
            # 添加必需参数
            params.append(f"instType={inst_type}")
            
            # 添加可选参数
            if uly:
                params.append(f"uly={uly}")
            if inst_family:
                params.append(f"instFamily={inst_family}")
            if inst_id:
                params.append(f"instId={inst_id}")
            
            if params:
                request_path += "?" + "&".join(params)
            
            # 获取当前时间戳（ISO格式）
            timestamp = datetime.utcnow().isoformat()[:-3] + 'Z'
            
            # 生成签名
            signature = self._generate_signature(timestamp, 'GET', request_path)
            
            if not signature:
                return {"error": "签名生成失败"}
            
            # 构建请求头
            headers = {
                'OK-ACCESS-KEY': Config.OKEX_API_KEY,
                'OK-ACCESS-SIGN': signature,
                'OK-ACCESS-TIMESTAMP': timestamp,
                'OK-ACCESS-PASSPHRASE': self._encode_passphrase(Config.OKEX_PASSPHRASE),
                'Content-Type': 'application/json'
            }
            
            # 发送请求
            url = self.api_url + request_path
            logger.info(f"请求OKX产品信息API: {url}")
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"产品信息查询成功，返回 {len(data.get('data', []))} 个产品")
                return data
            else:
                logger.error(f"产品信息查询失败，状态码: {response.status_code}, 响应: {response.text}")
                # 如果API调用失败，返回模拟数据
                logger.info("API调用失败，使用模拟数据")
                return self._get_mock_instruments(inst_type, uly, inst_family, inst_id)
                
        except requests.exceptions.RequestException as e:
            logger.error(f"网络请求异常: {e}")
            logger.info("网络异常，使用模拟数据")
            return self._get_mock_instruments(inst_type, uly, inst_family, inst_id)
        except Exception as e:
            logger.error(f"获取产品信息异常: {e}")
            logger.info("发生异常，使用模拟数据")
            return self._get_mock_instruments(inst_type, uly, inst_family, inst_id)
    
    def _get_mock_instruments(self, inst_type: str, uly: str = None, inst_family: str = None, inst_id: str = None) -> Dict:
        """获取模拟产品信息数据"""
        
        # 根据产品类型生成不同的模拟数据
        if inst_type == "SPOT":
            mock_data = [
                {
                    "auctionEndTime": "",
                    "baseCcy": "BTC",
                    "ctMult": "",
                    "ctType": "",
                    "ctVal": "",
                    "ctValCcy": "",
                    "contTdSwTime": "1704876947000",
                    "expTime": "",
                    "futureSettlement": False,
                    "instFamily": "",
                    "instId": "BTC-USDT",
                    "instType": "SPOT",
                    "lever": "",
                    "listTime": "1704876947000",
                    "lotSz": "0.00000001",
                    "maxIcebergSz": "9999999999.0000000000000000",
                    "maxLmtAmt": "1000000",
                    "maxLmtSz": "9999999999",
                    "maxMktAmt": "1000000",
                    "maxMktSz": "1000000",
                    "maxStopSz": "1000000",
                    "maxTriggerSz": "9999999999.0000000000000000",
                    "maxTwapSz": "9999999999.0000000000000000",
                    "minSz": "0.00001",
                    "optType": "",
                    "openType": "call_auction",
                    "quoteCcy": "USDT",
                    "tradeQuoteCcyList": ["USDT"],
                    "settleCcy": "",
                    "state": "live",
                    "ruleType": "normal",
                    "stk": "",
                    "tickSz": "0.1",
                    "uly": ""
                },
                {
                    "auctionEndTime": "",
                    "baseCcy": "ETH",
                    "ctMult": "",
                    "ctType": "",
                    "ctVal": "",
                    "ctValCcy": "",
                    "contTdSwTime": "1704876947000",
                    "expTime": "",
                    "futureSettlement": False,
                    "instFamily": "",
                    "instId": "ETH-USDT",
                    "instType": "SPOT",
                    "lever": "",
                    "listTime": "1704876947000",
                    "lotSz": "0.00000001",
                    "maxIcebergSz": "9999999999.0000000000000000",
                    "maxLmtAmt": "1000000",
                    "maxLmtSz": "9999999999",
                    "maxMktAmt": "1000000",
                    "maxMktSz": "1000000",
                    "maxStopSz": "1000000",
                    "maxTriggerSz": "9999999999.0000000000000000",
                    "maxTwapSz": "9999999999.0000000000000000",
                    "minSz": "0.001",
                    "optType": "",
                    "openType": "call_auction",
                    "quoteCcy": "USDT",
                    "tradeQuoteCcyList": ["USDT"],
                    "settleCcy": "",
                    "state": "live",
                    "ruleType": "normal",
                    "stk": "",
                    "tickSz": "0.01",
                    "uly": ""
                },
                {
                    "auctionEndTime": "",
                    "baseCcy": "SOL",
                    "ctMult": "",
                    "ctType": "",
                    "ctVal": "",
                    "ctValCcy": "",
                    "contTdSwTime": "1704876947000",
                    "expTime": "",
                    "futureSettlement": False,
                    "instFamily": "",
                    "instId": "SOL-USDT",
                    "instType": "SPOT",
                    "lever": "",
                    "listTime": "1704876947000",
                    "lotSz": "0.00000001",
                    "maxIcebergSz": "9999999999.0000000000000000",
                    "maxLmtAmt": "1000000",
                    "maxLmtSz": "9999999999",
                    "maxMktAmt": "1000000",
                    "maxMktSz": "1000000",
                    "maxStopSz": "1000000",
                    "maxTriggerSz": "9999999999.0000000000000000",
                    "maxTwapSz": "9999999999.0000000000000000",
                    "minSz": "0.1",
                    "optType": "",
                    "openType": "call_auction",
                    "quoteCcy": "USDT",
                    "tradeQuoteCcyList": ["USDT"],
                    "settleCcy": "",
                    "state": "live",
                    "ruleType": "normal",
                    "stk": "",
                    "tickSz": "0.01",
                    "uly": ""
                }
            ]
        elif inst_type == "SWAP":
            mock_data = [
                {
                    "auctionEndTime": "",
                    "baseCcy": "",
                    "ctMult": "1",
                    "ctType": "linear",
                    "ctVal": "1",
                    "ctValCcy": "USDT",
                    "contTdSwTime": "",
                    "expTime": "",
                    "futureSettlement": False,
                    "instFamily": "BTC-USDT",
                    "instId": "BTC-USDT-SWAP",
                    "instType": "SWAP",
                    "lever": "125",
                    "listTime": "1704876947000",
                    "lotSz": "1",
                    "maxIcebergSz": "9999999999",
                    "maxLmtAmt": "",
                    "maxLmtSz": "9999999999",
                    "maxMktAmt": "",
                    "maxMktSz": "1000000",
                    "maxStopSz": "1000000",
                    "maxTriggerSz": "9999999999",
                    "maxTwapSz": "9999999999",
                    "minSz": "1",
                    "optType": "",
                    "openType": "",
                    "quoteCcy": "",
                    "tradeQuoteCcyList": [],
                    "settleCcy": "USDT",
                    "state": "live",
                    "ruleType": "normal",
                    "stk": "",
                    "tickSz": "0.1",
                    "uly": "BTC-USDT"
                },
                {
                    "auctionEndTime": "",
                    "baseCcy": "",
                    "ctMult": "1",
                    "ctType": "linear",
                    "ctVal": "1",
                    "ctValCcy": "USDT",
                    "contTdSwTime": "",
                    "expTime": "",
                    "futureSettlement": False,
                    "instFamily": "ETH-USDT",
                    "instId": "ETH-USDT-SWAP",
                    "instType": "SWAP",
                    "lever": "125",
                    "listTime": "1704876947000",
                    "lotSz": "1",
                    "maxIcebergSz": "9999999999",
                    "maxLmtAmt": "",
                    "maxLmtSz": "9999999999",
                    "maxMktAmt": "",
                    "maxMktSz": "1000000",
                    "maxStopSz": "1000000",
                    "maxTriggerSz": "9999999999",
                    "maxTwapSz": "9999999999",
                    "minSz": "1",
                    "optType": "",
                    "openType": "",
                    "quoteCcy": "",
                    "tradeQuoteCcyList": [],
                    "settleCcy": "USDT",
                    "state": "live",
                    "ruleType": "normal",
                    "stk": "",
                    "tickSz": "0.01",
                    "uly": "ETH-USDT"
                }
            ]
        elif inst_type == "FUTURES":
            mock_data = [
                {
                    "auctionEndTime": "",
                    "baseCcy": "",
                    "ctMult": "1",
                    "ctType": "linear",
                    "ctVal": "1",
                    "ctValCcy": "USDT",
                    "contTdSwTime": "",
                    "expTime": "1704067200000",
                    "futureSettlement": True,
                    "instFamily": "BTC-USDT",
                    "instId": "BTC-USDT-231229",
                    "instType": "FUTURES",
                    "lever": "125",
                    "listTime": "1704876947000",
                    "lotSz": "1",
                    "maxIcebergSz": "9999999999",
                    "maxLmtAmt": "",
                    "maxLmtSz": "9999999999",
                    "maxMktAmt": "",
                    "maxMktSz": "1000000",
                    "maxStopSz": "1000000",
                    "maxTriggerSz": "9999999999",
                    "maxTwapSz": "9999999999",
                    "minSz": "1",
                    "optType": "",
                    "openType": "",
                    "quoteCcy": "",
                    "tradeQuoteCcyList": [],
                    "settleCcy": "USDT",
                    "state": "live",
                    "ruleType": "normal",
                    "stk": "",
                    "tickSz": "0.1",
                    "uly": "BTC-USDT"
                }
            ]
        elif inst_type == "OPTION":
            mock_data = [
                {
                    "auctionEndTime": "",
                    "baseCcy": "",
                    "ctMult": "1",
                    "ctType": "",
                    "ctVal": "1",
                    "ctValCcy": "USDT",
                    "contTdSwTime": "",
                    "expTime": "1704067200000",
                    "futureSettlement": False,
                    "instFamily": "BTC-USDT",
                    "instId": "BTC-USDT-231229-45000-C",
                    "instType": "OPTION",
                    "lever": "",
                    "listTime": "1704876947000",
                    "lotSz": "1",
                    "maxIcebergSz": "9999999999",
                    "maxLmtAmt": "",
                    "maxLmtSz": "9999999999",
                    "maxMktAmt": "",
                    "maxMktSz": "1000000",
                    "maxStopSz": "1000000",
                    "maxTriggerSz": "9999999999",
                    "maxTwapSz": "9999999999",
                    "minSz": "1",
                    "optType": "C",
                    "openType": "",
                    "quoteCcy": "",
                    "tradeQuoteCcyList": [],
                    "settleCcy": "USDT",
                    "state": "live",
                    "ruleType": "normal",
                    "stk": "45000",
                    "tickSz": "0.1",
                    "uly": "BTC-USDT"
                }
            ]
        else:  # MARGIN
            mock_data = [
                {
                    "auctionEndTime": "",
                    "baseCcy": "BTC",
                    "ctMult": "",
                    "ctType": "",
                    "ctVal": "",
                    "ctValCcy": "",
                    "contTdSwTime": "1704876947000",
                    "expTime": "",
                    "futureSettlement": False,
                    "instFamily": "",
                    "instId": "BTC-USDT",
                    "instType": "MARGIN",
                    "lever": "3",
                    "listTime": "1704876947000",
                    "lotSz": "0.00000001",
                    "maxIcebergSz": "9999999999.0000000000000000",
                    "maxLmtAmt": "1000000",
                    "maxLmtSz": "9999999999",
                    "maxMktAmt": "1000000",
                    "maxMktSz": "1000000",
                    "maxStopSz": "1000000",
                    "maxTriggerSz": "9999999999.0000000000000000",
                    "maxTwapSz": "9999999999.0000000000000000",
                    "minSz": "0.00001",
                    "optType": "",
                    "openType": "call_auction",
                    "quoteCcy": "USDT",
                    "tradeQuoteCcyList": ["USDT"],
                    "settleCcy": "",
                    "state": "live",
                    "ruleType": "normal",
                    "stk": "",
                    "tickSz": "0.1",
                    "uly": ""
                }
            ]
        
        # 根据过滤条件筛选数据
        if inst_id:
            mock_data = [item for item in mock_data if item["instId"] == inst_id]
        if uly:
            mock_data = [item for item in mock_data if item["uly"] == uly]
        if inst_family:
            mock_data = [item for item in mock_data if item["instFamily"] == inst_family]
        
        return {
            "code": "0",
            "msg": "",
            "data": mock_data
        }