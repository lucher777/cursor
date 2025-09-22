# 交易产品信息API使用说明

## 概述

本API提供了获取欧易交易所交易产品基础信息的功能，支持所有产品类型（现货、永续合约、交割合约、期权、币币杠杆）。

## API接口

### 1. 获取交易产品基础信息

**接口地址:** `GET /api/v5/account/instruments`

**功能描述:** 获取当前账户可交易产品的信息列表

**限速:** 20次/2s (User ID + Instrument Type)

**权限:** 读取

#### 请求参数

| 参数名 | 类型 | 是否必须 | 描述 |
|--------|------|----------|------|
| instType | String | 是 | 产品类型 (SPOT/MARGIN/SWAP/FUTURES/OPTION) |
| uly | String | 可选 | 标的指数，仅适用于交割/永续/期权，期权必填 |
| instFamily | String | 否 | 交易品种，仅适用于交割/永续/期权 |
| instId | String | 否 | 产品ID |

#### 请求示例

```bash
# 获取所有现货产品
GET /api/v5/account/instruments?instType=SPOT

# 获取特定产品
GET /api/v5/account/instruments?instType=SPOT&instId=BTC-USDT

# 获取永续合约产品
GET /api/v5/account/instruments?instType=SWAP&uly=BTC-USDT
```

#### 返回结果

```json
{
    "code": "0",
    "msg": "",
    "data": [
        {
            "auctionEndTime": "",
            "baseCcy": "BTC",
            "ctMult": "",
            "ctType": "",
            "ctVal": "",
            "ctValCcy": "",
            "contTdSwTime": "1704876947000",
            "expTime": "",
            "futureSettlement": false,
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
        }
    ]
}
```

### 2. 获取产品信息摘要

**接口地址:** `GET /api/instruments/summary`

**功能描述:** 获取各种产品类型的数量和示例产品

#### 返回结果

```json
{
    "code": "0",
    "msg": "",
    "data": {
        "SPOT": {
            "count": 3,
            "products": ["BTC-USDT", "ETH-USDT", "SOL-USDT"]
        },
        "SWAP": {
            "count": 2,
            "products": ["BTC-USDT-SWAP", "ETH-USDT-SWAP"]
        },
        "FUTURES": {
            "count": 1,
            "products": ["BTC-USDT-231229"]
        },
        "OPTION": {
            "count": 1,
            "products": ["BTC-USDT-231229-45000-C"]
        },
        "MARGIN": {
            "count": 1,
            "products": ["BTC-USDT"]
        }
    }
}
```

## 返回参数说明

| 参数名 | 类型 | 描述 |
|--------|------|------|
| instType | String | 产品类型 |
| instId | String | 产品ID，如 BTC-USDT |
| uly | String | 标的指数，如 BTC-USD，仅适用于杠杆/交割/永续/期权 |
| instFamily | String | 交易品种，如 BTC-USD，仅适用于杠杆/交割/永续/期权 |
| baseCcy | String | 交易货币币种，如 BTC-USDT 中的 BTC，仅适用于币币/币币杠杆 |
| quoteCcy | String | 计价货币币种，如 BTC-USDT 中的USDT，仅适用于币币/币币杠杆 |
| settleCcy | String | 盈亏结算和保证金币种，如 BTC，仅适用于交割/永续/期权 |
| ctVal | String | 合约面值，仅适用于交割/永续/期权 |
| ctMult | String | 合约乘数，仅适用于交割/永续/期权 |
| ctValCcy | String | 合约面值计价币种，仅适用于交割/永续/期权 |
| optType | String | 期权类型，C或P，仅适用于期权 |
| stk | String | 行权价格，仅适用于期权 |
| listTime | String | 上线时间，Unix时间戳的毫秒数格式 |
| lever | String | 该instId支持的最大杠杆倍数，不适用于币币、期权 |
| tickSz | String | 下单价格精度，如 0.0001 |
| lotSz | String | 下单数量精度 |
| minSz | String | 最小下单数量 |
| ctType | String | 合约类型 (linear/inverse)，仅适用于交割/永续 |
| state | String | 产品状态 (live/suspend/preopen/test) |
| ruleType | String | 交易规则类型 (normal/pre_market) |
| maxLmtSz | String | 限价单的单笔最大委托数量 |
| maxMktSz | String | 市价单的单笔最大委托数量 |
| maxLmtAmt | String | 限价单的单笔最大美元价值 |
| maxMktAmt | String | 市价单的单笔最大美元价值，仅适用于币币/币币杠杆 |
| maxTwapSz | String | 时间加权单的单笔最大委托数量 |
| maxIcebergSz | String | 冰山委托的单笔最大委托数量 |
| maxTriggerSz | String | 计划委托委托的单笔最大委托数量 |
| maxStopSz | String | 止盈止损市价委托的单笔最大委托数量 |
| futureSettlement | Boolean | 交割合约是否支持每日结算，适用于全仓交割 |
| tradeQuoteCcyList | Array | 可用于交易的计价币种列表 |

## 产品类型说明

### SPOT (现货)
- 基础货币对交易
- 支持 baseCcy 和 quoteCcy
- 无杠杆限制

### MARGIN (币币杠杆)
- 支持杠杆交易
- 有杠杆倍数限制
- 支持 baseCcy 和 quoteCcy

### SWAP (永续合约)
- 无到期日的合约
- 支持杠杆交易
- 有 uly 和 instFamily 字段

### FUTURES (交割合约)
- 有固定到期日的合约
- 支持杠杆交易
- 有 expTime 字段

### OPTION (期权)
- 期权合约
- 有 optType 和 stk 字段
- uly 字段必填

## 使用示例

### Python 示例

```python
from exchange_client import OKExClient

# 创建客户端
client = OKExClient()

# 获取现货产品
spot_instruments = client.get_instruments("SPOT")
print(f"现货产品数量: {len(spot_instruments.get('data', []))}")

# 获取特定产品
btc_spot = client.get_instruments("SPOT", inst_id="BTC-USDT")
if btc_spot.get('data'):
    instrument = btc_spot['data'][0]
    print(f"BTC-USDT 最小下单数量: {instrument['minSz']}")
    print(f"BTC-USDT 价格精度: {instrument['tickSz']}")

# 获取永续合约
swap_instruments = client.get_instruments("SWAP", uly="BTC-USDT")
print(f"BTC-USDT 永续合约数量: {len(swap_instruments.get('data', []))}")
```

### JavaScript 示例

```javascript
// 获取现货产品
async function getSpotInstruments() {
    const response = await fetch('/api/instruments?instType=SPOT');
    const data = await response.json();
    
    if (data.code === '0') {
        console.log(`现货产品数量: ${data.data.length}`);
        data.data.forEach(instrument => {
            console.log(`产品: ${instrument.instId}, 最小数量: ${instrument.minSz}`);
        });
    }
}

// 获取产品摘要
async function getSummary() {
    const response = await fetch('/api/instruments/summary');
    const data = await response.json();
    
    if (data.code === '0') {
        Object.entries(data.data).forEach(([type, info]) => {
            console.log(`${type}: ${info.count} 个产品`);
        });
    }
}
```

## 错误处理

API 返回的错误码：

| 错误码 | 描述 |
|--------|------|
| 0 | 成功 |
| 50105 | Passphrase 不正确 |
| 50106 | API Key 不正确 |
| 50107 | 签名不正确 |
| 50108 | 时间戳不正确 |

## 注意事项

1. **身份验证**: 此API需要完整的API密钥配置（API Key、Secret Key、Passphrase）
2. **限速**: 每个用户ID + 产品类型组合限制为20次/2秒
3. **模拟数据**: 当API配置不完整或网络异常时，系统会返回模拟数据用于演示
4. **产品状态**: 只有状态为 "live" 的产品才能进行交易
5. **精度要求**: 下单时数量和价格必须符合 lotSz 和 tickSz 的精度要求

## 测试工具

项目提供了以下测试工具：

1. **test_instruments.py**: Python 测试脚本
2. **test_instruments_api.html**: Web 界面测试工具

运行测试：
```bash
# Python 测试
python test_instruments.py

# 启动 Web 服务器后访问
# http://localhost:8050/test_instruments_api.html
``` 