// 24vol的值
export const VOL_24H = 100000;
// ... existing code ...
export const EXCHANGES = {
    mexc: {
        id: 'mexc',
        name: 'MEXC',
        apiUrl: 'https://api.panpans.cn/mexc-api-proxy',
        deposit: 'https://www.mexc.com/zh-MY/assets/deposit/BTC',
        withdraw: 'https://www.mexc.com/zh-MY/assets/withdraw/BTC',
        symbolCase: 'upper',
        withdrawSuffix: ''
    },
    xt: {
        id: 'xt',
        name: 'XT',
        apiUrl: 'https://api.panpans.cn/xt-api-proxy',
        deposit: 'https://www.xt.com/zh-CN/accounts/assets/wallet/deposit',
        withdraw: 'https://www.xt.com/zh-CN/accounts/assets/wallet/withdraw',
        symbolCase: 'keep',
        withdrawSuffix: ''
    },
    binance: {
        id: 'binance',
        name: '币安',
        apiUrl: 'https://api.panpans.cn/binance-api-proxy',
        deposit: 'https://www.binance.com/zh-CN/my/wallet/account/main/deposit/crypto/BTC',
        withdraw: 'https://www.binance.com/zh-CN/my/wallet/account/main/withdrawal/crypto/BTC',
        symbolCase: 'upper',
        withdrawSuffix: ''
    },
    okex: {
        id: 'okex',
        name: 'OKEX',
        apiUrl: 'https://api.panpans.cn/okex-api-proxy',
        deposit: 'https://www.okx.com/zh-hans/balance/recharge/btc',
        withdraw: 'https://www.okx.com/zh-hans/balance/withdrawal/btc-chain',
        symbolCase: 'lower',
        withdrawSuffix: '--chain'
    },
    hotcoin: {
        id: 'hotcoin',
        name: 'HOTCOIN',
        apiUrl: 'https://api.panpans.cn/hotcoin-api-proxy',
        deposit: 'https://www.hotcoin.com/zh_CN/assetManagement/topup/?name=52',
        withdraw: 'https://www.hotcoin.com/zh_CN/assetManagement/extract/?name=52',
        symbolCase: 'keep',
        withdrawSuffix: ''
    },
    gateio: {
      id: 'gateio',
      name: 'Gate.io',  
      apiUrl: 'https://api.panpans.cn/gateio-api-proxy',
      deposit: 'https://www.gate.io/zh/myaccount/deposit/BTC',
      withdraw: 'https://www.gate.io/zh/myaccount/withdraw/BTC',
      symbolCase: 'upper',
      withdrawSuffix: ''
    },
    huobi: {
      id: 'huobi',
      name: '火币',  
      apiUrl: 'https://api.panpans.cn/huobi-api-proxy',
      deposit: 'https://www.htx.com/zh-cn/finance/deposit/btc',
      withdraw: 'https://www.htx.com/zh-cn/finance/withdraw/btc',
      symbolCase: 'lower',
      withdrawSuffix: ''
    },
    bitget: {
      id: 'bitget',
      name: 'Bitget',  
      apiUrl: 'https://api.panpans.cn/bitget-api-proxy',
      deposit: 'https://www.bitget.com/zh-CN/asset/recharge?coinId=2',
      withdraw: 'https://www.bitget.com/zh-CN/asset/withdraw?coinId=2',
      symbolCase: 'keep',
      withdrawSuffix: ''
    },
    bybit: {
      id: 'bybit',
      name: 'Bybit',  
      apiUrl: 'https://api.panpans.cn/bybit-api-proxy',
      deposit: 'https://www.bybit.com/user/assets/deposit',
      withdraw: 'https://www.bybit.com/user/assets/withdraw',
      symbolCase: 'keep',
      withdrawSuffix: ''
    }
};

// 在文件顶部定义静态DOM节点
export const  STATIC_DOM = {
    exchangeSelect1: document.getElementById('exchange-select-1'),
    exchangeSelect2: document.getElementById('exchange-select-2'),
    samePairsRow: document.getElementById('same-pairs-row'),
    // 其他静态DOM节点...
};


// 排序选项
export const SORT_OPTIONS = [
    { value: 'symbol-asc', label: '按币名升序' },
    { value: 'symbol-desc', label: '按币名降序' },
    { value: 'price-asc', label: '按价格升序' },
    { value: 'price-desc', label: '按价格降序' },
    { value: 'market_cap_rank-asc', label: '按T升序' },
    { value: 'market_cap_rank-desc', label: '按T降序' }
];

// 默认排序状态
export const DEFAULT_SORT_ORDERS = {
    1: { symbol: 'asc', price: 'asc', market_cap_rank: 'asc' },
    2: { symbol: 'asc', price: 'asc', market_cap_rank: 'asc' },
    3: { symbol: 'asc', price1: 'asc', price2: 'asc', diff: 'asc', market_cap_rank: 'asc' },
    4: { symbol: 'asc', maxDiff: 'asc', greaterThan_0_1: 'asc', greaterThan_0_03: 'asc', greaterThan_0_02: 'asc', market_cap_rank: 'asc' }
};

// 面板配置
export const PANEL_CONFIG = {
    1: {
        titleSelector: '[data-panel="1"] .exchange-title',
        countSelector: '[data-panel="1"] .exchange-count',
        rowsSelector: '[data-panel="1"] .exchange-rows'
    },
    2: {
        titleSelector: '[data-panel="2"] .exchange-title',
        countSelector: '[data-panel="2"] .exchange-count',
        rowsSelector: '[data-panel="2"] .exchange-rows'
    },
    3: {
        searchId: 'same-pairs-search',
        rowsId: 'same-pairs-row'
    },
    4: {
        searchId: 'high-diff-stats-search',
        rowsId: 'high-diff-stats'
    }
};

// 差异阈值
export const DIFF_THRESHOLD = 0.01;

// ... 文件中的其他代码 ...

// 模板函数
export const TEMPLATES = {
    loadingState: () => {
        return `
            <tr>
                <td colspan="4" class="text-center py-8">
                    <div class="flex flex-col items-center justify-center space-y-2">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span class="text-gray-600">数据加载中...</span>
                    </div>
                </td>
            </tr>
        `;
    },
    emptyState: () => {
        return `
            <tr>
                <td colspan="4" class="text-center py-8">
                    <div class="flex flex-col items-center justify-center space-y-2">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-gray-500">请选择交易所查看数据</span>
                    </div>
                </td>
            </tr>
        `;
    }
};

// ... 文件中的其他代码 ...