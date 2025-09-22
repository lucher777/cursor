const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 数据存储文件路径
const DATA_FILE = path.join(__dirname, 'db.json');

// 初始化数据文件
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // 文件不存在，创建初始数据
    const initialData = {
      apis: [
        {
          id: 'fanyi-api',
          name: '翻译接口',
          description: '文本翻译服务',
          externalUrl: 'https://uapis.cn/api/fanyi',
          method: 'GET',
          enabled: true,
          requiredFields: ['text'],
          optionalFields: [],
          customFields: [
            {
              name: 'timestamp',
              type: 'auto',
              value: 'current_time',
              description: '请求时间戳'
            },
            {
              name: 'source',
              type: 'fixed',
              value: 'custom_api',
              description: '数据来源标识'
            }
          ],
          fieldMapping: {
            text: 'text',
            result: 'data'
          },
          responseMapping: {
            success: 'code',
            message: 'msg',
            data: 'data'
          }
        }
      ]
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// 读取数据
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    // 兼容不同的数据结构
    if (parsedData.apis) {
      return { apis: parsedData.apis };
    } else if (parsedData.configs) {
      return { apis: parsedData.configs };
    } else {
      return { apis: [] };
    }
  } catch (error) {
    console.error('读取数据失败:', error);
    return { apis: [] };
  }
}

// 写入数据
async function writeData(data) {
  try {
    // 兼容不同的数据结构
    const outputData = { configs: data.apis || data.configs || [] };
    await fs.writeFile(DATA_FILE, JSON.stringify(outputData, null, 2));
    return true;
  } catch (error) {
    console.error('写入数据失败:', error);
    return false;
  }
}

// 生成自定义字段值
function generateCustomFieldValue(field) {
  switch (field.type) {
    case 'auto':
      if (field.value === 'current_time') {
        return new Date().toISOString();
      } else if (field.value === 'uuid') {
        return Math.random().toString(36).substr(2, 9);
      }
      break;
    case 'fixed':
      return field.value;
    default:
      return field.value;
  }
}

// API路由

// 获取所有接口配置
app.get('/api/configs', async (req, res) => {
  try {
    const data = await readData();
    res.json({
      success: true,
      data: data.apis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取配置失败',
      error: error.message
    });
  }
});

// 获取单个接口配置
app.get('/api/configs/:id', async (req, res) => {
  try {
    const data = await readData();
    const api = data.apis.find(a => a.id === req.params.id);
    
    if (!api) {
      return res.status(404).json({
        success: false,
        message: '接口配置不存在'
      });
    }
    
    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取配置失败',
      error: error.message
    });
  }
});

// 创建新接口配置
app.post('/api/configs', async (req, res) => {
  try {
    const data = await readData();
    const newApi = {
      id: req.body.id || `api-${Date.now()}`,
      name: req.body.name,
      description: req.body.description || '',
      externalUrl: req.body.externalUrl,
      method: req.body.method || 'GET',
      enabled: req.body.enabled !== false,
      requiredFields: req.body.requiredFields || [],
      optionalFields: req.body.optionalFields || [],
      customFields: req.body.customFields || [],
      fieldMapping: req.body.fieldMapping || {},
      responseMapping: req.body.responseMapping || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 检查ID是否已存在
    if (data.apis.find(a => a.id === newApi.id)) {
      return res.status(400).json({
        success: false,
        message: '接口ID已存在'
      });
    }
    
    data.apis.push(newApi);
    const saved = await writeData(data);
    
    if (saved) {
      res.json({
        success: true,
        data: newApi,
        message: '接口配置创建成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '保存配置失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建配置失败',
      error: error.message
    });
  }
});

// 更新接口配置
app.put('/api/configs/:id', async (req, res) => {
  try {
    const data = await readData();
    const apiIndex = data.apis.findIndex(a => a.id === req.params.id);
    
    if (apiIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '接口配置不存在'
      });
    }
    
    const updatedApi = {
      ...data.apis[apiIndex],
      ...req.body,
      id: req.params.id, // 保持ID不变
      updatedAt: new Date().toISOString()
    };
    
    data.apis[apiIndex] = updatedApi;
    const saved = await writeData(data);
    
    if (saved) {
      res.json({
        success: true,
        data: updatedApi,
        message: '接口配置更新成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '保存配置失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新配置失败',
      error: error.message
    });
  }
});

// 删除接口配置
app.delete('/api/configs/:id', async (req, res) => {
  try {
    const data = await readData();
    const apiIndex = data.apis.findIndex(a => a.id === req.params.id);
    
    if (apiIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '接口配置不存在'
      });
    }
    
    data.apis.splice(apiIndex, 1);
    const saved = await writeData(data);
    
    if (saved) {
      res.json({
        success: true,
        message: '接口配置删除成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '删除配置失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除配置失败',
      error: error.message
    });
  }
});

// 代理接口调用
app.all('/proxy/:apiId', async (req, res) => {
  try {
    const data = await readData();
    const api = data.apis.find(a => a.id === req.params.apiId);
    
    if (!api) {
      return res.status(404).json({
        success: false,
        message: '接口配置不存在'
      });
    }
    
    if (!api.enabled) {
      return res.status(403).json({
        success: false,
        message: '接口已禁用'
      });
    }
    
    // 检查必填字段
    const requestData = { ...req.query, ...req.body };
    for (const field of api.requiredFields) {
      if (!requestData[field]) {
        return res.status(400).json({
          success: false,
          message: `缺少必填字段: ${field}`
        });
      }
    }
    
    // 构建外部接口请求
    let externalUrl = api.externalUrl;
    let requestConfig = {
      method: api.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Custom-API-Proxy/1.0'
      }
    };
    
    // 处理参数映射
    let mappedParams = {};
    Object.keys(requestData).forEach(key => {
      const mappedKey = api.fieldMapping[key] || key;
      mappedParams[mappedKey] = requestData[key];
    });
    
    if (api.method.toLowerCase() === 'get') {
      const params = new URLSearchParams(mappedParams);
      externalUrl += (externalUrl.includes('?') ? '&' : '?') + params.toString();
    } else {
      requestConfig.data = mappedParams;
    }
    
    requestConfig.url = externalUrl;
    
    // 调用外部接口
    const externalResponse = await axios(requestConfig);
    let responseData = externalResponse.data;
    
    // 添加自定义字段
    api.customFields.forEach(field => {
      const value = generateCustomFieldValue(field);
      responseData[field.name] = value;
    });
    
    // 添加元数据
    responseData._meta = {
      apiId: api.id,
      apiName: api.name,
      timestamp: new Date().toISOString(),
      source: 'custom_proxy'
    };
    
    res.json({
      success: true,
      data: responseData,
      message: '请求成功'
    });
    
  } catch (error) {
    console.error('代理请求失败:', error);
    res.status(500).json({
      success: false,
      message: '代理请求失败',
      error: error.response?.data || error.message
    });
  }
});

// 测试接口连通性
app.post('/api/test/:apiId', async (req, res) => {
  try {
    const data = await readData();
    const api = data.apis.find(a => a.id === req.params.apiId);
    
    if (!api) {
      return res.status(404).json({
        success: false,
        message: '接口配置不存在'
      });
    }
    
    const testParams = req.body.testParams || {};
    
    // 构建测试请求
    let testUrl = api.externalUrl;
    let requestConfig = {
      method: api.method,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Custom-API-Proxy/1.0'
      }
    };
    
    if (api.method.toLowerCase() === 'get') {
      const params = new URLSearchParams(testParams);
      testUrl += (testUrl.includes('?') ? '&' : '?') + params.toString();
    } else {
      requestConfig.data = testParams;
    }
    
    requestConfig.url = testUrl;
    
    const startTime = Date.now();
    const response = await axios(requestConfig);
    const responseTime = Date.now() - startTime;
    
    res.json({
      success: true,
      message: '接口测试成功',
      data: {
        status: response.status,
        responseTime: `${responseTime}ms`,
        headers: response.headers,
        data: response.data
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: '接口测试失败',
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    });
  }
});

// 启动服务器
async function startServer() {
  await initDataFile();
  app.listen(PORT, () => {
    console.log(`后端服务启动成功，端口: ${PORT}`);
    console.log(`API文档: http://localhost:${PORT}/api/configs`);
    console.log(`代理接口格式: http://localhost:${PORT}/proxy/{apiId}`);
  });
}

startServer().catch(console.error);