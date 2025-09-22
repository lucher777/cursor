import { get7500DataFromDB } from './coingecko_fetcher.js';

// 获取本地存储项
function getLocalStorageItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        return null;
    }
}


// 工具函数
const formatUtils = {
    // 数字格式化工具函数
    removeTrailingZeros: num => parseFloat(num).toString(),
    
    // 交易量格式化显示
    formatVolume(volume) {
        if (!volume && volume !== 0) return '-'; // 空值保护
        if (volume >= 1e8) return `$${(volume / 1e8).toFixed(3)}亿`;
        if (volume >= 1e4) return `$${(volume / 1e4).toFixed(3)}万`;
        return `$${volume.toFixed(3)}`;
    },

    /**
     * 获取币种数据(快速返回null版本)
     * @param {string} symbol 币种符号
     * @returns {Promise<null>} 总是返回null，但会在后台静默更新数据
     */
    async getCoinData(symbol) {
        // 静默处理数据查询(不阻塞主流程)
        this._silentFetchCoinData(symbol);
        return null;
    },

    /**
     * 获取币种数据(完整查询版本)
     * @param {string} symbol 币种符号
     * @returns {Promise<Object|null>} 返回包含币种数据的对象，找不到则返回null
     */
    async getSearchCoinData(symbol) {
        try {
            // 优先从top7500数据中查找
            const coin = await this._findCoinInDatasets(symbol);
            if (coin) return this._formatCoinData(coin);
            
            return null;
        } catch (error) {
            console.error('获取币种数据失败:', error);
            return null;
        }
    },

    // ========== 内部工具方法 ==========
    
    /**
     * 静默获取币种数据(不返回结果)
     * @private
     */
    async _silentFetchCoinData(symbol) {
        try {
            await this._findCoinInDatasets(symbol);
        } catch (error) {
            // 静默失败，不抛出错误
        }
    },

    /**
     * 在数据集中查找币种
     * @private
     */
    async _findCoinInDatasets(symbol) {
        // 先尝试从top7500获取
        const stored7500 = await get7500DataFromDB();
        if (stored7500) {
            const coin = stored7500.find(c => 
                c.symbol && c.symbol.toUpperCase() === symbol.toUpperCase().trim()
            );
            
            if (coin) return coin;
        }
        
        
        
        return null;
    },

    /**
     * 格式化币种数据为统一结构
     * @private
     */
    _formatCoinData(coin) {
        return {
            symbol: coin.symbol,
            name: coin.name,
            image: coin.image,
            current_price: coin.current_price,
            market_cap_rank: coin.market_cap_rank
        };
    },

    // 计算背景色的亮度
    calculateBrightness(r, g, b) {
        return (r * 299 + g * 587 + b * 104) / 1000;
    },
    localStoredCoins(){
        const storedCoins = getLocalStorageItem('top3000Coins');
        if (!storedCoins) return;
        return storedCoins;
    },
    getColumnIndex(column) {
        const columns = {
            'symbol': 1,
            'price': 2,
            '24VOL':3,
            'market_cap_rank': 4,

            'price1': 2,
            'price2': 3,
            'diff': 4,
            'cap-rank': 5,
        };
        return columns[column] || 1;
    }
};

// 导出 formatUtils 对象
export { formatUtils };