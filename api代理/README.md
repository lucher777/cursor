# API代理管理系统

这是一个基于Node.js和原生HTML/JavaScript开发的API代理管理系统，可以帮助你管理和自定义外部API接口。

## 功能特性

- 🚀 **接口代理**：将外部接口封装成自定义接口
- 🛠️ **字段管理**：支持必填字段、可选字段和自定义字段
- 🎯 **自动扩展**：自动为接口响应添加时间戳、来源标识等字段
- 📊 **可视化管理**：提供直观的Web管理界面
- 🧪 **接口测试**：内置接口测试功能
- ⚡ **实时配置**：支持热更新配置，无需重启服务

## 项目结构

```
api-proxy-system/
├── backend/
│   ├── app.js              # 后端主程序
│   ├── package.json        # 后端依赖配置
│   └── apis.json          # 接口配置数据文件（自动生成）
└── frontend/
    └── index.html         # 前端管理界面
```

## 安装和运行

### 1. 安装后端依赖

```bash
# 进入项目目录
cd api-proxy-system

# 创建后端目录
mkdir backend
cd backend

# 将后端代码保存为 app.js
# 将package.json保存到backend目录

# 安装依赖
npm install
```

### 2. 启动后端服务

```bash
# 开发模式（推荐，支持自动重启）
npm run dev

# 或者生产模式
npm start
```

后端服务将在 `http://localhost:3001` 启动

### 3. 运行前端管理界面

```bash
# 回到项目根目录
cd ..

# 创建前端目录
mkdir frontend
cd frontend

# 将前端代码保存为 index.html
# 在浏览器中打开 index.html 或者使用本地服务器
python -m http.server 8080
# 或者
npx serve -s .
```

前端界面将在 `http://localhost:8080` 可访问

## 使用说明

### 1. 创建API配置

1. 打开前端管理界面
2. 点击"新增"按钮
3. 填写接口基本信息：
   - **接口ID**：唯一标识符
   - **接口名称**：显示名称
   - **接口描述**：可选的描述信息
   - **外部接口URL**：要代理的外部API地址
   - **请求方法**：GET/POST/PUT/DELETE
   - **启用状态**：是否启用此接口

### 2. 配置字段管理

在"字段管理"标签页中：

- **必填字段**：调用接口时必须提供的参数
- **可选字段**：调用接口时可选的参数  
- **自定义字段**：系统自动添加到响应中的字段
  - 固定值：设置固定的字段值
  - 自动生成：支持`current_time`（当前时间）、`uuid`（随机ID）

### 3. 测试接口

在"接口测试"标签页中：
1. 填写测试参数
2. 点击"测试接口"按钮
3. 查看测试结果

### 4. 调用代理接口

接口配置完成后，可以通过以下URL调用：

```
GET/POST http://localhost:3001/proxy/{apiId}?param1=value1&param2=value2
```

示例：
```bash
# 调用翻译接口
curl "http://localhost:3001/proxy/fanyi-api?text=hello"
```

## API接口文档

### 管理接口

- `GET /api/configs` - 获取所有接口配置
- `GET /api/configs/:id` -  获取指定接口配置
- `POST /api/configs` - 创建新接口配置
- `PUT /api/configs/:id` - 更新接口配置
- `DELETE /api/configs/:id` - 删除接口配置
- `POST /api/test/:id` - 测试接口连通性

### 代理接口

- `ALL /proxy/:apiId` - 调用代理接口

## 配置示例

以翻译接口为例：

```json
{
  "id": "fanyi-api",
  "name": "翻译接口",
  "description": "文本翻译服务",
  "externalUrl": "https://uapis.cn/api/fanyi",
  "method": "GET",
  "enabled": true,
  "requiredFields": ["text"],
  "optionalFields": [],
  "customFields": [
    {
      "name": "timestamp",
      "type": "auto",
      "value": "current_time",
      "description": "请求时间戳"
    },
    {
      "name": "source",
      "type": "fixed",
      "value": "custom_api",
      "description": "数据来源标识"
    }
  ]
}
```

调用示例：
```bash
curl "http://localhost:3001/proxy/fanyi-api?text=hello"
```

响应示例：
```json
{
  "success": true,
  "data": {
    "code": 200,
    "msg": "success",
    "data": "你好",
    "timestamp": "2024-01-20T10:30:00.000Z",
    "source": "custom_api",
    "_meta": {
      "apiId": "fanyi-api",
      "apiName": "翻译接口",
      "timestamp": "2024-01-20T10:30:00.000Z",
      "source": "custom_proxy"
    }
  },
  "message": "请求成功"
}
```

## 高级功能

### 字段映射

支持将输入参数映射到外部接口的不同字段名：

```json
{
  "fieldMapping": {
    "query": "text",
    "lang": "language"
  }
}
```

### 响应映射

支持将外部接口的响应字段映射到标准格式：

```json
{
  "responseMapping": {
    "success": "code",
    "message": "msg", 
    "data": "result"
  }
}
```

## 开发和扩展

### 添加新的自动生成字段类型

在 `app.js` 的 `generateCustomFieldValue` 函数中添加新的类型：

```javascript
function generateCustomFieldValue(field) {
  switch (field.type) {
    case 'auto':
      if (field.value === 'current_time') {
        return new Date().toISOString();
      } else if (field.value === 'uuid') {
        return Math.random().toString(36).substr(2, 9);
      } else if (field.value === 'request_id') {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      }
      break;
    // ... 其他类型
  }
}
```

### 添加请求中间件

可以在代理请求前添加自定义逻辑：

```javascript
// 在代理接口调用中添加
app.all('/proxy/:apiId', async (req, res) => {
  // ... 现有代码

  // 添加自定义中间件逻辑
  if (api.middleware) {
    // 执行自定义中间件
    requestData = await executeMiddleware(api.middleware, requestData);
  }

  // ... 继续处理
});
```

## 注意事项

1. **数据持久化**：当前使用JSON文件存储配置，生产环境建议使用数据库
2. **安全性**：建议添加身份验证和访问控制
3. **错误处理**：已包含基本错误处理，可根据需要扩展
4. **性能优化**：大量请求时建议添加缓存和限流机制
5. **CORS配置**：已启用CORS，生产环境请配置具体域名

## 故障排除

### 常见问题

1. **后端启动失败**
   - 检查端口3001是否被占用
   - 确认Node.js版本 >= 14

2. **前端无法连接后端**
   - 确认后端服务已启动
   - 检查前端代码中的API地址是否正确

3. **外部接口调用失败**
   - 检查外部接口URL是否正确
   - 确认网络连接正常
   - 查看后端控制台错误信息

4. **接口测试失败**
   - 检查必填字段是否都已填写
   - 确认外部接口参数格式是否正确

### 日志查看

后端会在控制台输出详细的日志信息，包括：
- 服务启动信息
- 请求处理日志
- 错误信息

## 更新日志

### v1.0.0
- 基础的API代理功能
- Web管理界面
- 字段管理和自定义扩展
- 接口测试功能

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License