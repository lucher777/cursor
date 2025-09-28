// 交易所过滤管理器
const FILTER_MANAGER = {
    // 本地存储键名
    STORAGE_KEY: 'exchange_filters',
    // 默认保留时长（小时）
    DEFAULT_RETENTION_HOURS: 4,
    // 设置保留时长
    setRetentionHours(hours) {
        localStorage.setItem('filter_retention_hours', hours);
    },
    // 获取保留时长
    getRetentionHours() {
        const storedHours = localStorage.getItem('filter_retention_hours');
        return storedHours ? parseInt(storedHours) : this.DEFAULT_RETENTION_HOURS;
    },
    // 初始化过滤器
    init() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                const { timestamp, filters } = JSON.parse(stored);
                const retentionHours = this.getRetentionHours();
                // 检查是否过期
                if (Date.now() - timestamp < retentionHours * 60 * 60 * 1000) {
                    return filters;
                } else {
                    // 过期则清除旧数据
                    localStorage.removeItem(this.STORAGE_KEY);
                }
            } catch (e) {
                // 解析失败也清除无效数据
                localStorage.removeItem(this.STORAGE_KEY);
            }
        }
        // 默认空过滤器
        return {
            mexc: [],
            xt: ['BEANS'],
            binance: [],
            okex: [],
            hotcoin: [],
            gateio: [],
            huobi: [],
            bitget: [],
            bybit: []
        };
    },
    // 保存过滤器到本地存储
    save(filters) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
            timestamp: Date.now(),
            filters
        }));
    },
    // 添加要过滤的币种
    addFilter(exchange, symbol) {
        const filters = this.init();
        if (!filters[exchange]) {
            filters[exchange] = [];
        }
        if (!filters[exchange].includes(symbol)) {
            filters[exchange].push(symbol);
            this.save(filters);
        }
        return filters;
    },
    // 移除过滤的币种
    removeFilter(exchange, symbol) {
        const filters = this.init();
        if (filters[exchange]) {
            filters[exchange] = filters[exchange].filter(s => s !== symbol);
            this.save(filters);
        }
        return filters;
    },
    // 获取当前过滤器
    getFilters() {
        return this.init();
    }
};
export default FILTER_MANAGER;