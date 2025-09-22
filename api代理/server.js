// server.js

// 引入所需模块
const express = require('express');
const cors = require('cors');
// **FIX: 引入 'node-fetch' 库来提供 fetch 功能**
// 要使用此功能，您必须在终端中运行: npm install node-fetch@2
const fetch = require('node-fetch'); 
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- 配置 ---
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'db.json');

// --- 初始化 ---
const app = express();

// --- 中间件 ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// --- 数据库辅助函数 ---
const initializeDatabase = () => {
    if (!fs.existsSync(DB_FILE)) {
        console.log('未找到 db.json，正在创建一个新的...');
        fs.writeFileSync(DB_FILE, JSON.stringify({ configs: [] }, null, 2));
    }
};
const readDb = () => JSON.parse(fs.readFileSync(DB_FILE));
const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// --- 管理 API 路由 ---
app.get('/admin/configs', (req, res) => {
    try {
        const db = readDb();
        res.status(200).json(db.configs || []);
    } catch (error) {
        console.error("读取配置失败:", error);
        res.status(500).json({ message: "读取配置失败", error: error.message });
    }
});

app.post('/admin/configs', (req, res) => {
    try {
        const db = readDb();
        const newConfig = { id: crypto.randomUUID(), ...req.body };
        db.configs.push(newConfig);
        writeDb(db);
        res.status(201).json(newConfig);
    } catch (error) {
        console.error("创建配置失败:", error);
        res.status(500).json({ message: "创建配置失败", error: error.message });
    }
});

app.put('/admin/configs/:configId', (req, res) => {
    try {
        const { configId } = req.params;
        const db = readDb();
        const configIndex = db.configs.findIndex(c => c.id === configId);
        if (configIndex === -1) return res.status(404).json({ message: "配置未找到" });
        db.configs[configIndex] = { ...req.body, id: configId };
        writeDb(db);
        res.status(200).json(db.configs[configIndex]);
    } catch (error) {
        console.error("更新配置失败:", error);
        res.status(500).json({ message: "更新配置失败", error: error.message });
    }
});

app.delete('/admin/configs/:configId', (req, res) => {
    try {
        const { configId } = req.params;
        const db = readDb();
        const initialLength = db.configs.length;
        db.configs = db.configs.filter(c => c.id !== configId);
        if (db.configs.length === initialLength) return res.status(404).json({ message: "配置未找到" });
        writeDb(db);
        res.status(204).send();
    } catch (error) {
        console.error("删除配置失败:", error);
        res.status(500).json({ message: "删除配置失败", error: error.message });
    }
});

// --- 公共代理 API 路由 ---
app.get('/api/proxy/:configId', async (req, res) => {
    try {
        const { configId } = req.params;
        const db = readDb();
        const config = db.configs.find(c => c.id === configId);
        if (!config) return res.status(404).json({ error: 'API 配置未找到。' });
        if (!config.isEnabled) return res.status(503).json({ error: '此 API 当前已被禁用。' });

        let externalApiUrl = config.externalApiUrl.replace(/\{\{query\.(\w+)\}\}/g, (match, key) => {
            return req.query[key] ? encodeURIComponent(req.query[key]) : '';
        });
        
        console.log(`[Proxy Request] Calling: ${externalApiUrl}`);
        // 现在 fetch 函数是可用的
        const externalResponse = await fetch(externalApiUrl);
        if (!externalResponse.ok) {
            const errorBody = await externalResponse.text();
            throw new Error(`外部API返回错误: ${externalResponse.status}. 响应: ${errorBody}`);
        }
        const externalData = await externalResponse.json();

        let processedData = { ...externalData };
if (config.requiredFields) {
            const required = config.requiredFields.split(',').map(f => f.trim()).filter(Boolean);
            for (const field of required) {
                // 如果在外部API返回的数据(processedData)中找不到这个字段...
                if (!(field in processedData)) {
                    // ...就抛出您看到的这个错误
                    throw new Error(`必需字段 "${field}" 在外部API响应中缺失。`);
                }
            }
        }
        if (config.visibleFields) {
            const visible = config.visibleFields.split(',').map(f => f.trim()).filter(Boolean);
            if (visible.length > 0) {
                const filteredData = {};
                visible.forEach(field => {
                    if (field in processedData) filteredData[field] = processedData[field];
                });
                processedData = filteredData;
            }
        }
        const customFields = JSON.parse(config.customFields || '{}');
        const finalResponse = { ...processedData, ...customFields };
        res.status(200).json(finalResponse);
    } catch (error) {
        console.error(`[Proxy Error]:`, error.message);
        res.status(500).json({ error: '处理API请求时发生内部错误。', details: error.message });
    }
});

// --- 启动服务器 ---
app.listen(PORT, () => {
    initializeDatabase();
    console.log(`API 网关后端服务正在监听端口 ${PORT}`);
    console.log(`管理API Endpoint: http://localhost:${PORT}/admin/configs`);
    console.log(`代理API Endpoint: http://localhost:${PORT}/api/proxy/:configId`);
});
