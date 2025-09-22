# 🚀 虚拟币自动交易系统

一个基于技术分析的虚拟币现货自动交易程序，支持欧易交易所，具有Web可视化界面。

## ✨ 功能特点

- 🔄 **自动化现货交易** - 基于技术指标的低买高卖策略
- 📊 **多种技术指标** - RSI、MACD、移动平均线、布林带等
- 🌐 **Web可视化界面** - 实时监控交易状态和市场数据
- 🛡️ **完善风险控制** - 止损止盈、仓位管理、日亏损限制
- 📈 **实时数据展示** - K线图、技术指标图表、交易历史
- 🔧 **灵活配置** - 支持多种运行模式和参数调整
- 📋 **交易产品信息API** - 获取现货、合约、期权等产品基础信息
- 🔍 **产品筛选功能** - 支持按产品类型、ID、标的指数等条件筛选

## 🛠️ 快速开始

### 方法一：自动安装（推荐）

```bash
python install.py
```

### 方法二：手动安装

1. **克隆项目**
```bash
git clone <项目地址>
cd btc
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **配置API密钥**
```bash
# 复制配置文件模板
cp .env.example .env

# 编辑配置文件，填入您的欧易API信息
# OKEX_API_KEY=your_api_key_here
# OKEX_SECRET_KEY=your_secret_key_here
# OKEX_PASSPHRASE=your_passphrase_here
```

## 🚦 运行程序

### Web界面模式（推荐）
```bash
python main.py --mode web
```
然后访问 http://127.0.0.1:8050

### 命令行分析模式
```bash
python main.py --mode cli --symbol BTC/USDT
```

### 自动交易模式
```bash
python main.py --mode auto --symbol BTC/USDT
```

### Windows用户
双击运行 `start.bat` 文件，选择对应模式。

## 📊 技术指标说明

| 指标 | 用途 | 参数 |
|------|------|------|
| RSI | 超买超卖判断 | 周期14，超买70，超卖30 |
| MACD | 趋势确认 | 快线12，慢线26，信号线9 |
| 移动平均线 | 趋势方向 | 短期20，长期50 |
| 布林带 | 价格通道 | 周期20，标准差2 |

## ⚙️ 配置参数

在 `config.py` 中可以调整以下参数：

```python
# 交易配置
DEFAULT_SYMBOL = 'BTC/USDT'    # 默认交易对
TRADE_AMOUNT = 100             # 每次交易金额(USDT)
MAX_POSITIONS = 3              # 最大持仓数量

# 风险控制
STOP_LOSS_PERCENT = 0.02       # 止损比例 2%
TAKE_PROFIT_PERCENT = 0.03     # 止盈比例 3%

# 技术指标参数
RSI_PERIOD = 14                # RSI周期
RSI_OVERSOLD = 30              # RSI超卖线
RSI_OVERBOUGHT = 70            # RSI超买线
```

## 🎯 交易策略

### 买入条件
- 趋势看涨且强度 > 0.6
- RSI < 70 (避免超买)
- 价格接近短期均线
- 或 RSI < 30 (超卖反弹)

### 卖出条件
- 趋势看跌且强度 > 0.6
- RSI > 30 (避免超卖)
- 价格接近短期均线
- 或 RSI > 70 (超买回调)

### 风险控制
- 2% 止损
- 3% 止盈
- 最大持仓3个
- 日亏损限制
- 最大回撤控制

## 📁 项目结构

```
btc/
├── main.py              # 主程序入口
├── config.py            # 配置文件
├── exchange_client.py   # 交易所API封装
├── technical_analysis.py # 技术分析模块
├── trading_strategy.py  # 交易策略
├── risk_manager.py      # 风险管理
├── web_dashboard.py     # Web界面
├── install.py           # 安装脚本
├── start.bat            # Windows启动脚本
├── requirements.txt     # 依赖包列表
├── test_instruments.py  # 产品信息API测试
├── test_instruments_api.html # Web API测试界面
├── 交易产品信息API使用说明.md # API使用文档
└── README.md           # 说明文档
```

## 🔧 API配置说明

1. 登录欧易交易所官网
2. 进入API管理页面
3. 创建新的API密钥
4. 配置权限：现货交易、查看
5. 将API信息填入 `.env` 文件

## 📱 Web界面功能

- **实时价格监控** - 显示当前价格和变化
- **技术指标图表** - RSI、MACD等指标可视化
- **交易信号提示** - 买入/卖出信号实时显示
- **持仓管理** - 查看当前持仓和盈亏
- **交易历史** - 完整的交易记录
- **风险控制面板** - 实时风险指标监控
- **产品信息查询** - 获取交易产品基础信息和规格
- **产品筛选功能** - 支持按类型、ID、标的指数等条件筛选

## ⚠️ 风险提示

- 虚拟币交易存在极高风险，可能导致本金全部损失
- 本程序仅供学习和研究使用，不构成投资建议
- 建议先在沙盒环境中充分测试
- 使用实盘交易前请充分了解相关风险
- 建议从小金额开始测试

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 📄 免责声明

本软件仅供教育和研究目的使用。使用本软件进行实际交易的所有风险和损失由用户自行承担。开发者不对任何直接或间接的损失负责。

## 📞 技术支持

如遇到问题，请查看：
1. 检查API配置是否正确
2. 确认网络连接正常
3. 查看日志文件 `trading_bot.log`
4. 提交Issue描述问题