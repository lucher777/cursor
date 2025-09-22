# 配置文件使用说明

## 概述

本系统使用静态配置文件来管理API密钥和其他设置。配置文件为 `config.js`，您可以根据需要修改其中的默认值。

## 文件结构

- `config.js` - 主配置文件（包含您的实际API信息）
- `config.example.js` - 配置文件示例（展示如何填写）
- `CONFIG_README.md` - 本说明文件

## 配置步骤

### 1. 创建配置文件

如果您还没有 `config.js` 文件，请复制 `config.example.js` 为 `config.js`：

```bash
cp config.example.js config.js
```

### 2. 编辑配置文件

打开 `config.js` 文件，找到以下部分并填入您的实际API信息：

```javascript
api: {
    // API Key - 请替换为您的实际API Key
    key: 'your-api-key-here',
    
    // Secret Key - 请替换为您的实际Secret Key
    secret: 'your-secret-key-here',
    
    // 默认环境设置
    environment: 'demo', // 'demo' 为模拟环境，'live' 为实盘环境
}
```

### 3. 配置说明

#### API配置
- `key`: 您的欧易API Key
- `secret`: 您的欧易Secret Key
- `environment`: 默认环境，建议使用 'demo'（模拟环境）

#### 交易配置
- `defaultPairs`: 默认测试的交易对
- `defaultAmount`: 默认测试交易数量
- `defaultPrice`: 默认测试价格

#### 测试配置
- `autoSave`: 是否自动保存配置到浏览器本地存储
- `testDelay`: 批量测试时的延迟时间（毫秒）
- `quickTestDelay`: 快速测试时的延迟时间（毫秒）

#### 界面配置
- `title`: 页面标题
- `debug`: 是否显示调试信息
- `maxLogEntries`: 日志保留条数

## 配置优先级

系统按以下优先级加载配置：

1. **浏览器本地存储** - 用户手动保存的配置（最高优先级）
2. **config.js文件** - 静态配置文件中的默认值
3. **空值** - 如果都没有配置，则留空

## 安全注意事项

⚠️ **重要安全提醒**：

1. **不要将包含真实API密钥的 `config.js` 文件提交到版本控制系统**
2. **建议将 `config.js` 添加到 `.gitignore` 文件中**
3. **在生产环境中，请使用更安全的配置管理方式**
4. **定期更换API密钥，确保账户安全**

## 使用示例

### 基本配置
```javascript
api: {
    key: '1234567890abcdef',        // 您的API Key
    secret: 'abcdef1234567890',     // 您的Secret Key
    environment: 'demo'             // 使用模拟环境
}
```

### 完整配置
```javascript
const DEFAULT_CONFIG = {
    api: {
        key: 'your-api-key',
        secret: 'your-secret-key',
        environment: 'demo',
        baseUrl: {
            demo: 'https://www.okx.com',
            live: 'https://www.okx.com'
        }
    },
    trading: {
        defaultPairs: ['BTC-USDT', 'ETH-USDT'],
        defaultAmount: '0.001',
        defaultPrice: '50000'
    },
    testing: {
        autoSave: true,
        testDelay: 1000,
        quickTestDelay: 500
    },
    ui: {
        title: '欧易API接口检测',
        debug: true,
        maxLogEntries: 100
    }
};
```

## 故障排除

### 配置未生效
1. 检查 `config.js` 文件是否存在
2. 确认文件语法正确（没有JavaScript错误）
3. 检查浏览器控制台是否有错误信息

### API密钥无效
1. 确认API Key和Secret Key正确
2. 检查API密钥是否已启用
3. 确认API密钥有足够的权限

### 环境配置问题
1. 确认环境设置正确（demo/live）
2. 检查网络连接是否正常
3. 确认欧易API服务状态

## 更新日志

- v1.0.0 - 初始版本，支持基本API配置
- v1.1.0 - 添加交易配置和测试配置
- v1.2.0 - 添加界面配置和安全提醒
