// 交易历史管理
class TradeHistoryManager {
    constructor() {
        this.tradeHistory = [];
        this.filteredHistory = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {
            status: '',
            profit: '',
            startDate: '',
            endDate: ''
        };
        
        this.init();
    }

    init() {
        this.loadTradeHistory();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // 清空历史按钮
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            if (confirm('确定要清空所有交易历史吗？此操作不可恢复。')) {
                this.clearHistory();
            }
        });

        // 应用筛选按钮
        document.getElementById('apply-filter-btn').addEventListener('click', () => {
            this.applyFilters();
        });

        // 分页按钮
        document.getElementById('prev-page').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('next-page').addEventListener('click', () => {
            this.nextPage();
        });

        // 筛选器变化监听
        ['status-filter', 'profit-filter', 'start-date', 'end-date'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateFilters();
            });
        });
    }

    loadTradeHistory() {
        try {
            const savedHistory = localStorage.getItem('trade_history');
            this.tradeHistory = savedHistory ? JSON.parse(savedHistory) : [];
            this.filteredHistory = [...this.tradeHistory];
        } catch (error) {
            console.error('加载交易历史失败:', error);
            this.tradeHistory = [];
            this.filteredHistory = [];
        }
    }

    saveTradeHistory() {
        try {
            localStorage.setItem('trade_history', JSON.stringify(this.tradeHistory));
        } catch (error) {
            console.error('保存交易历史失败:', error);
        }
    }

    clearHistory() {
        this.tradeHistory = [];
        this.filteredHistory = [];
        this.currentPage = 1;
        localStorage.removeItem('trade_history');
        this.render();
    }

    updateFilters() {
        this.filters = {
            status: document.getElementById('status-filter').value,
            profit: document.getElementById('profit-filter').value,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value
        };
    }

    applyFilters() {
        this.updateFilters();
        this.filteredHistory = this.tradeHistory.filter(record => {
            return this.matchesFilters(record);
        });
        this.currentPage = 1;
        this.render();
    }

    matchesFilters(record) {
        // 状态筛选
        if (this.filters.status && record.tradeResult?.success !== (this.filters.status === 'success')) {
            return false;
        }

        // 收益筛选
        if (this.filters.profit) {
            const profit = record.tradeResult?.profit || 0;
            if (this.filters.profit === 'positive' && profit <= 0) return false;
            if (this.filters.profit === 'negative' && profit >= 0) return false;
            if (this.filters.profit === 'zero' && profit !== 0) return false;
        }

        // 日期筛选
        if (this.filters.startDate || this.filters.endDate) {
            const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
            if (this.filters.startDate && recordDate < this.filters.startDate) return false;
            if (this.filters.endDate && recordDate > this.filters.endDate) return false;
        }

        return true;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.render();
        }
    }

    nextPage() {
        const maxPage = Math.ceil(this.filteredHistory.length / this.itemsPerPage);
        if (this.currentPage < maxPage) {
            this.currentPage++;
            this.render();
        }
    }

    render() {
        this.updateStatistics();
        this.renderTradeHistory();
        this.updatePagination();
    }

    updateStatistics() {
        const totalTrades = this.tradeHistory.length;
        const successfulTrades = this.tradeHistory.filter(record => record.tradeResult?.success).length;
        
        let totalProfit = 0;
        let totalDuration = 0;
        let validTrades = 0;

        this.tradeHistory.forEach(record => {
            if (record.tradeResult?.profit !== undefined) {
                totalProfit += record.tradeResult.profit;
                validTrades++;
            }
            // 这里可以添加耗时计算逻辑
        });

        const avgProfit = validTrades > 0 ? totalProfit / validTrades : 0;
        const avgDuration = validTrades > 0 ? totalDuration / validTrades : 0;

        document.getElementById('total-trades').textContent = totalTrades;
        document.getElementById('successful-trades').textContent = successfulTrades;
        document.getElementById('total-profit').textContent = `${avgProfit.toFixed(4)}%`;
        document.getElementById('avg-duration').textContent = `${avgDuration.toFixed(1)}s`;
    }

    renderTradeHistory() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredHistory.slice(startIndex, endIndex);

        const container = document.getElementById('trade-history-list');
        
        if (pageData.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>暂无交易记录</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pageData.map(record => this.renderTradeRecord(record)).join('');
    }

    renderTradeRecord(record) {
        const timestamp = new Date(record.timestamp).toLocaleString('zh-CN');
        const arbitrageData = record.arbitrageData;
        const tradeResult = record.tradeResult;
        
        const statusClass = tradeResult?.success ? 'status-success' : 'status-error';
        const statusText = tradeResult?.success ? '成功' : '失败';
        const profitClass = this.getProfitClass(tradeResult?.profit || 0);
        
        return `
            <div class="history-card bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">
                            三角套利交易 #${record.id || 'N/A'}
                        </h3>
                        <p class="text-sm text-gray-600">${timestamp}</p>
                    </div>
                    <div class="flex space-x-2">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass}">
                            ${statusText}
                        </span>
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${profitClass}">
                            ${(tradeResult?.profit || 0).toFixed(4)}%
                        </span>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <h4 class="font-medium text-gray-700 mb-2">交易对</h4>
                        <div class="space-y-1 text-sm">
                            <div>交易对1: <span class="font-mono">${arbitrageData.pair1}</span></div>
                            <div>交易对2: <span class="font-mono">${arbitrageData.pair2}</span></div>
                            <div>交易对3: <span class="font-mono">${arbitrageData.pair3}</span></div>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-700 mb-2">预期收益</h4>
                        <div class="space-y-1 text-sm">
                            <div>路径1: <span class="font-mono">${(arbitrageData.profit1 * 100).toFixed(4)}%</span></div>
                            <div>路径2: <span class="font-mono">${(arbitrageData.profit2 * 100).toFixed(4)}%</span></div>
                            <div>执行路径: <span class="font-mono">${tradeResult?.path || 'N/A'}</span></div>
                        </div>
                    </div>
                </div>
                
                ${this.renderTradeDetails(tradeResult)}
            </div>
        `;
    }

    renderTradeDetails(tradeResult) {
        if (!tradeResult || !tradeResult.trades) {
            return `
                <div class="border-t pt-4">
                    <p class="text-sm text-gray-600">
                        ${tradeResult?.error || '无详细信息'}
                    </p>
                </div>
            `;
        }

        const trades = tradeResult.trades;
        
        return `
            <div class="border-t pt-4">
                <h4 class="font-medium text-gray-700 mb-2">交易详情</h4>
                <div class="space-y-2">
                    ${trades.map((trade, index) => `
                        <div class="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                            <span>第${index + 1}步交易</span>
                            <span class="font-mono">${trade.executedAmount} ${trade.executedCurrency}</span>
                            <span class="font-mono">@ ${trade.executedPrice}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getProfitClass(profit) {
        if (profit > 0) return 'profit-positive';
        if (profit < 0) return 'profit-negative';
        return 'profit-neutral';
    }

    updatePagination() {
        const totalItems = this.filteredHistory.length;
        const maxPage = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        document.getElementById('showing-start').textContent = totalItems > 0 ? startItem : 0;
        document.getElementById('showing-end').textContent = endItem;
        document.getElementById('total-count').textContent = totalItems;
        document.getElementById('current-page').textContent = this.currentPage;

        // 更新分页按钮状态
        document.getElementById('prev-page').disabled = this.currentPage <= 1;
        document.getElementById('next-page').disabled = this.currentPage >= maxPage;

        if (this.currentPage <= 1) {
            document.getElementById('prev-page').classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            document.getElementById('prev-page').classList.remove('opacity-50', 'cursor-not-allowed');
        }

        if (this.currentPage >= maxPage) {
            document.getElementById('next-page').classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            document.getElementById('next-page').classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // 添加新的交易记录
    addTradeRecord(record) {
        record.id = this.tradeHistory.length + 1;
        this.tradeHistory.unshift(record); // 添加到开头
        this.saveTradeHistory();
        this.render();
    }

    // 导出交易历史
    exportHistory() {
        const dataStr = JSON.stringify(this.tradeHistory, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `trade_history_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // 导入交易历史
    importHistory(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedHistory = JSON.parse(e.target.result);
                if (Array.isArray(importedHistory)) {
                    this.tradeHistory = importedHistory;
                    this.saveTradeHistory();
                    this.render();
                    alert('交易历史导入成功！');
                } else {
                    alert('文件格式错误，请选择正确的JSON文件');
                }
            } catch (error) {
                alert('文件解析失败，请检查文件格式');
            }
        };
        reader.readAsText(file);
    }
}

// 初始化交易历史管理器
document.addEventListener('DOMContentLoaded', () => {
    window.tradeHistoryManager = new TradeHistoryManager();
});

// 导出管理器类
export { TradeHistoryManager };
