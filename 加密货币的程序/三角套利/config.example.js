// 欧易API配置文件示例
// 请复制此文件为 config.js 并填入您的实际API信息

const DEFAULT_CONFIG = {
    // API配置
    api: {
        // API Key - 请替换为您的实际API Key
        key: 'your-api-key-here',
        
        // Secret Key - 请替换为您的实际Secret Key
        secret: 'your-secret-key-here',
        
        // 默认环境设置
        environment: 'demo', // 'demo' 为模拟环境，'live' 为实盘环境
        
        // 基础URL配置
        baseUrl: {
            demo: 'https://www.okx.com',
            live: 'https://www.okx.com'
        }
    },
    
    // 交易配置
    trading: {
        // 默认交易对
        defaultPairs: ['BTC-USDT', 'ETH-USDT', 'ETH-BTC'],
        
        // 默认交易数量（用于测试）
        defaultAmount: '0.001',
        
        // 默认价格（用于限价单测试）
        defaultPrice: '50000'
    },
    
    // 测试配置
    testing: {
        // 是否启用自动保存配置
        autoSave: true,
        
        // 测试延迟时间（毫秒）
        testDelay: 1000,
        
        // 快速测试延迟时间（毫秒）
        quickTestDelay: 500
    },
    
    // 界面配置
    ui: {
        // 页面标题
        title: '欧易API接口检测',
        
        // 是否显示调试信息
        debug: true,
        
        // 日志保留条数
        maxLogEntries: 100
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEFAULT_CONFIG };
}

// 浏览器环境下的全局变量
if (typeof window !== 'undefined') {
    window.DEFAULT_CONFIG = DEFAULT_CONFIG;
}
