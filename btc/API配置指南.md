# 🔑 API配置指南 - 真实交易设置

## ⚠️ 重要安全提醒

**在配置真实交易之前，请务必了解以下风险：**
- 真实交易涉及真实资金，有亏损风险
- 请先使用小额资金测试
- 建议先在沙盒环境（测试环境）中练习
- 请妥善保管API密钥，不要泄露给他人

## 📋 第一步：获取欧易API密钥

### 1. 注册欧易账户
- 访问：https://www.okx.com
- 点击"注册"并完成账户创建
- 完成身份验证（KYC）

### 2. 创建API密钥
1. 登录欧易账户
2. 进入"账户中心" → "API管理"
3. 点击"创建API密钥"
4. 设置API权限：
   - ✅ **读取权限**（必需）
   - ✅ **交易权限**（如果要自动交易）
   - ❌ **提现权限**（建议不开启，更安全）

### 3. 记录API信息
创建成功后，请记录以下信息：
- **API Key**（公钥）
- **Secret Key**（私钥）  
- **Passphrase**（密码短语）

**⚠️ 重要：这些信息只显示一次，请立即保存！**

## 📝 第二步：配置API密钥

### 方法一：使用环境变量文件（推荐）

1. 在项目根目录创建 `.env` 文件
2. 将以下内容复制到文件中，并替换为您的实际API信息：

```env
# 欧易API配置
OKEX_API_KEY=your_actual_api_key_here
OKEX_SECRET_KEY=your_actual_secret_key_here
OKEX_PASSPHRASE=your_actual_passphrase_here

# 环境设置
OKEX_SANDBOX=true  # 推荐新手使用测试环境

# 交易配置
TRADE_AMOUNT=100    # 每次交易金额（USDT）
MAX_POSITIONS=3     # 最大持仓数量
```

### 方法二：直接修改配置文件

编辑 `config.py` 文件，将API信息直接填入：

```python
class Config:
    # 欧易API配置
    OKEX_API_KEY = 'your_actual_api_key_here'
    OKEX_SECRET_KEY = 'your_actual_secret_key_here'
    OKEX_PASSPHRASE = 'your_actual_passphrase_here'
    OKEX_SANDBOX = True  # 推荐新手使用测试环境
```

## 🧪 第三步：测试配置

### 1. 启动系统
```bash
python main.py --mode web
```

### 2. 检查连接状态
- 访问：http://127.0.0.1:8050
- 查看"系统状态"是否显示"正常"
- 如果显示"错误"，请检查API配置

### 3. 测试数据获取
- 在Web界面中查看价格数据
- 确认能获取到实时价格信息

## 🎯 第四步：开始交易

### 安全建议
1. **先使用测试环境**：设置 `OKEX_SANDBOX=true`
2. **小额测试**：设置较小的 `TRADE_AMOUNT`（如100 USDT）
3. **监控运行**：密切关注系统运行状态
4. **设置止损**：在 `config.py` 中配置止损参数

### 交易模式选择
1. **Web界面模式**：可视化监控，手动控制
2. **命令行分析模式**：技术分析，不执行交易
3. **自动交易模式**：完全自动化，谨慎使用

## 🔧 高级配置

### 风险控制参数
在 `config.py` 中可以调整：

```python
# 风险控制
STOP_LOSS_PERCENT = 0.02      # 2%止损
TAKE_PROFIT_PERCENT = 0.03    # 3%止盈

# 技术指标参数
RSI_PERIOD = 14               # RSI周期
RSI_OVERSOLD = 30             # RSI超卖线
RSI_OVERBOUGHT = 70           # RSI超买线
```

### 交易策略调整
- 修改 `trading_strategy.py` 中的策略逻辑
- 调整技术指标参数
- 自定义买卖信号条件

## 🆘 常见问题

### Q: API连接失败怎么办？
A: 检查以下几点：
- API密钥是否正确
- 网络连接是否正常
- 是否开启了正确的权限

### Q: 如何切换到真实环境？
A: 将 `OKEX_SANDBOX` 设置为 `false`，但请务必：
- 先在小额资金上测试
- 确保策略稳定可靠
- 设置合理的风险控制

### Q: 如何停止自动交易？
A: 
- 在Web界面中关闭"自动交易"开关
- 或直接停止程序（Ctrl+C）

## 📞 技术支持

如果遇到问题：
1. 检查日志文件 `trading_bot.log`
2. 确认API配置正确
3. 验证网络连接正常
4. 查看欧易API文档：https://www.okx.com/docs-v5/

---

**祝您交易顺利！记住：安全第一，盈利第二！** 🚀 