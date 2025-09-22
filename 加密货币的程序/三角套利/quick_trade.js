// 一键交易功能模块
class QuickTrade {
    constructor() {
        this.okxAPI = null;
        this.tradeConfig = {
            minProfit: 0.1, // 最小收益率
            maxTradeAmount: 100, // 最大交易金额(USDT)
            slippage: 0.001, // 滑点容忍度
            timeout: 30000, // 交易超时时间(ms)
            retryCount: 3 // 重试次数
        };
        this.isTrading = false;
        this.tradeHistory = [];
        
        this.init();
    }

    init() {
        this.loadConfig();
        this.bindEvents();
    }

    bindEvents() {
        // 监听套利机会点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-trade-btn')) {
                const arbitrageData = JSON.parse(e.target.dataset.arbitrage);
                this.executeArbitrage(arbitrageData);
            }
        });
    }

    loadConfig() {
        const savedConfig = localStorage.getItem('quick_trade_config');
        if (savedConfig) {
            this.tradeConfig = { ...this.tradeConfig, ...JSON.parse(savedConfig) };
        }
    }

    saveConfig() {
        localStorage.setItem('quick_trade_config', JSON.stringify(this.tradeConfig));
    }

    // 设置OKX API实例
    setOKXAPI(okxAPI) {
        this.okxAPI = okxAPI;
    }

    // 执行三角套利交易
    async executeArbitrage(arbitrageData) {
        if (this.isTrading) {
            alert('正在执行交易，请稍候...');
            return;
        }

        if (!this.okxAPI) {
            alert('请先配置API连接');
            return;
        }

        // 验证套利机会
        if (!this.validateArbitrage(arbitrageData)) {
            alert('套利机会验证失败');
            return;
        }

        this.isTrading = true;
        this.showTradeStatus('开始执行三角套利交易...');

        try {
            // 1. 检查账户余额
            const balanceCheck = await this.checkBalance(arbitrageData);
            if (!balanceCheck.success) {
                throw new Error(`余额不足: ${balanceCheck.error}`);
            }

            // 2. 检查交易限制
            const limitCheck = await this.checkTradeLimits(arbitrageData);
            if (!limitCheck.success) {
                throw new Error(`交易限制检查失败: ${limitCheck.error}`);
            }

            // 3. 执行三步交易
            const tradeResult = await this.executeThreeStepTrade(arbitrageData);
            
            if (tradeResult.success) {
                this.showTradeStatus('交易执行成功！', 'success');
                this.addTradeHistory(arbitrageData, tradeResult);
            } else {
                throw new Error(`交易执行失败: ${tradeResult.error}`);
            }

        } catch (error) {
            this.showTradeStatus(`交易失败: ${error.message}`, 'error');
            console.error('交易执行错误:', error);
        } finally {
            this.isTrading = false;
        }
    }

    // 验证套利机会
    validateArbitrage(arbitrageData) {
        const { pair1, pair2, pair3, profit1, profit2 } = arbitrageData;
        
        // 检查收益率是否满足最小要求
        if (profit1 < this.tradeConfig.minProfit && profit2 < this.tradeConfig.minProfit) {
            return false;
        }

        // 检查交易对是否有效
        if (!pair1 || !pair2 || !pair3) {
            return false;
        }

        return true;
    }

    // 检查账户余额
    async checkBalance(arbitrageData) {
        try {
            const response = await this.okxAPI.makeRequest('/api/v5/account/balance', 'GET', null, true);
            
            if (!response.success) {
                return { success: false, error: response.data?.msg || '获取余额失败' };
            }

            const balances = response.data?.data || [];
            const startCurrency = this.getStartCurrency(arbitrageData);
            const requiredAmount = this.calculateRequiredAmount(arbitrageData);

            const balance = balances.find(b => b.ccy === startCurrency);
            if (!balance || parseFloat(balance.availBal) < requiredAmount) {
                return { 
                    success: false, 
                    error: `余额不足，需要 ${requiredAmount} ${startCurrency}，可用 ${balance?.availBal || 0}` 
                };
            }

            return { success: true, balance: balance };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 检查交易限制
    async checkTradeLimits(arbitrageData) {
        try {
            // 检查账户配置
            const configResponse = await this.okxAPI.makeRequest('/api/v5/account/config', 'GET', null, true);
            if (!configResponse.success) {
                return { success: false, error: '获取账户配置失败' };
            }

            // 检查风险状态
            const riskResponse = await this.okxAPI.makeRequest('/api/v5/account/risk-state', 'GET', null, true);
            if (!riskResponse.success) {
                return { success: false, error: '获取风险状态失败' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 执行三步交易
    async executeThreeStepTrade(arbitrageData) {
        const { pair1, pair2, pair3, profit1, profit2 } = arbitrageData;
        const tradePath = profit1 > profit2 ? 'path1' : 'path2';
        
        this.showTradeStatus(`执行交易路径: ${tradePath}`);

        try {
            let currentAmount = this.calculateRequiredAmount(arbitrageData);
            let currentCurrency = this.getStartCurrency(arbitrageData);
            const trades = [];

            // 根据路径执行三步交易
            const steps = this.getTradeSteps(arbitrageData, tradePath);
            
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                this.showTradeStatus(`执行第${i + 1}步交易: ${step.pair} ${step.side} ${currentAmount} ${currentCurrency}`);

                const tradeResult = await this.executeSingleTrade(step, currentAmount, currentCurrency);
                
                if (!tradeResult.success) {
                    // 如果某步失败，尝试撤销之前的交易
                    await this.rollbackTrades(trades);
                    return { success: false, error: `第${i + 1}步交易失败: ${tradeResult.error}` };
                }

                trades.push(tradeResult);
                currentAmount = tradeResult.executedAmount;
                currentCurrency = tradeResult.executedCurrency;
                
                // 添加延迟避免频率限制
                await this.delay(1000);
            }

            // 计算实际收益
            const actualProfit = this.calculateActualProfit(arbitrageData, trades);
            
            return {
                success: true,
                trades: trades,
                profit: actualProfit,
                path: tradePath
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 执行单步交易
    async executeSingleTrade(step, amount, currency) {
        const { pair, side, ordType = 'market' } = step;
        
        const orderData = {
            instId: pair,
            tdMode: 'cash',
            side: side,
            ordType: ordType,
            sz: amount.toString()
        };

        // 如果是限价单，需要计算价格
        if (ordType === 'limit') {
            const price = await this.getOptimalPrice(pair, side);
            orderData.px = price.toString();
        }

        try {
            const response = await this.okxAPI.makeRequest('/api/v5/trade/order', 'POST', orderData, true);
            
            if (!response.success) {
                return { success: false, error: response.data?.msg || '下单失败' };
            }

            const orderId = response.data?.data?.[0]?.ordId;
            if (!orderId) {
                return { success: false, error: '未获取到订单ID' };
            }

            // 等待订单成交
            const executionResult = await this.waitForOrderExecution(orderId, pair);
            
            return {
                success: true,
                orderId: orderId,
                executedAmount: executionResult.executedAmount,
                executedCurrency: executionResult.executedCurrency,
                executedPrice: executionResult.executedPrice
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // 等待订单成交
    async waitForOrderExecution(orderId, pair, maxWaitTime = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const response = await this.okxAPI.makeRequest(
                    `/api/v5/trade/order?instId=${pair}&ordId=${orderId}`, 
                    'GET', null, true
                );

                if (response.success) {
                    const order = response.data?.data?.[0];
                    if (order && order.state === 'filled') {
                        return {
                            executedAmount: order.accFillSz,
                            executedCurrency: order.side === 'buy' ? pair.split('-')[0] : pair.split('-')[1],
                            executedPrice: order.avgPx
                        };
                    }
                }

                await this.delay(1000);
            } catch (error) {
                console.error('检查订单状态失败:', error);
            }
        }

        throw new Error('订单执行超时');
    }

    // 获取最优价格
    async getOptimalPrice(pair, side) {
        try {
            const response = await this.okxAPI.makeRequest(`/api/v5/market/books?instId=${pair}&sz=1`);
            
            if (response.success) {
                const books = response.data?.data?.[0]?.bids || [];
                const asks = response.data?.data?.[0]?.asks || [];
                
                if (side === 'buy' && asks.length > 0) {
                    return parseFloat(asks[0][0]);
                } else if (side === 'sell' && books.length > 0) {
                    return parseFloat(books[0][0]);
                }
            }
            
            throw new Error('无法获取价格数据');
        } catch (error) {
            throw new Error(`获取价格失败: ${error.message}`);
        }
    }

    // 撤销交易
    async rollbackTrades(trades) {
        this.showTradeStatus('开始撤销交易...', 'warning');
        
        for (const trade of trades.reverse()) {
            try {
                await this.okxAPI.makeRequest('/api/v5/trade/cancel-order', 'POST', {
                    instId: trade.instId,
                    ordId: trade.orderId
                }, true);
                
                await this.delay(500);
            } catch (error) {
                console.error('撤销订单失败:', error);
            }
        }
    }

    // 获取交易步骤
    getTradeSteps(arbitrageData, path) {
        const { pair1, pair2, pair3 } = arbitrageData;
        
        if (path === 'path1') {
            // 路径1: A -> B -> C -> A
            return [
                { pair: pair1, side: 'buy' },
                { pair: pair2, side: 'buy' },
                { pair: pair3, side: 'sell' }
            ];
        } else {
            // 路径2: A -> C -> B -> A
            return [
                { pair: pair3, side: 'buy' },
                { pair: pair2, side: 'sell' },
                { pair: pair1, side: 'sell' }
            ];
        }
    }

    // 获取起始货币
    getStartCurrency(arbitrageData) {
        const { pair1 } = arbitrageData;
        return pair1.split('-')[1]; // 假设起始货币是USDT
    }

    // 计算所需金额
    calculateRequiredAmount(arbitrageData) {
        return Math.min(this.tradeConfig.maxTradeAmount, 100); // 默认100 USDT
    }

    // 计算实际收益
    calculateActualProfit(arbitrageData, trades) {
        // 这里需要根据实际成交情况计算收益
        // 简化计算，实际应该考虑手续费、滑点等
        const startAmount = this.calculateRequiredAmount(arbitrageData);
        const endAmount = trades[trades.length - 1]?.executedAmount || 0;
        
        return ((endAmount - startAmount) / startAmount) * 100;
    }

    // 显示交易状态
    showTradeStatus(message, type = 'info') {
        const statusDiv = document.getElementById('trade-status') || this.createTradeStatusDiv();
        
        const timestamp = new Date().toLocaleTimeString();
        const statusClass = {
            'info': 'text-blue-600',
            'success': 'text-green-600',
            'error': 'text-red-600',
            'warning': 'text-yellow-600'
        }[type] || 'text-blue-600';

        const logEntry = document.createElement('div');
        logEntry.className = statusClass;
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        statusDiv.appendChild(logEntry);
        statusDiv.scrollTop = statusDiv.scrollHeight;
    }

    // 创建交易状态显示区域
    createTradeStatusDiv() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'trade-status';
        statusDiv.className = 'fixed top-4 right-4 w-80 h-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4 overflow-y-auto z-50';
        statusDiv.innerHTML = '<h3 class="font-bold mb-2">交易状态</h3>';
        
        document.body.appendChild(statusDiv);
        return statusDiv;
    }

    // 添加交易历史
    addTradeHistory(arbitrageData, tradeResult) {
        const historyEntry = {
            timestamp: new Date().toISOString(),
            arbitrageData: arbitrageData,
            tradeResult: tradeResult
        };
        
        this.tradeHistory.push(historyEntry);
        
        // 保存到本地存储
        localStorage.setItem('trade_history', JSON.stringify(this.tradeHistory));
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取交易历史
    getTradeHistory() {
        return this.tradeHistory;
    }

    // 清空交易历史
    clearTradeHistory() {
        this.tradeHistory = [];
        localStorage.removeItem('trade_history');
    }

    // 更新交易配置
    updateConfig(newConfig) {
        this.tradeConfig = { ...this.tradeConfig, ...newConfig };
        this.saveConfig();
    }

    // 获取交易配置
    getConfig() {
        return this.tradeConfig;
    }
}

// 导出QuickTrade类
export { QuickTrade };
