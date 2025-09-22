const lowCoin = ["PEOPLE-BTC", "BIO-BNB", "BIO-FDUSD", "IOTX-BTC", "GALA-BTC", "TST-FDUSD", "RVN-BTC", "ONE-BTC", "ZK-BTC", "EGLD-FDUSD", "ZIL-BTC"]

// 大写：${symbolObj.before.toUpperCase()}_${symbolObj.after.toUpperCase()}
// 小写：${symbolObj.before.toLowerCase()}-${symbolObj.after.toLowerCase()}


// 初始化筛选配置（默认空对象）
export const FILTER_CONFIG = {
    mexc: {
        id: 'mexc',
        name: 'MEXC',
        urlTemplate: 'https://www.mexc.com/zh-MY/exchange/BTC_USDT',
        symbols: ["PENGU-BNB", ...lowCoin],
        minVolume: 0,  // 默认最小交易量
        minPrice: 0.000001  // 最小有效价格
    },
    xt: {
        id: 'xt',
        name: 'XT',
        urlTemplate: 'https://www.xt.com/zh-CN/trade/btc_usdt',
        symbols: ["PENGU-BNB", ...lowCoin],
        minVolume: 0,  // 默认最小交易量
        minPrice: 0.000001  // 最小有效价格
    },
    binance: {
        id: 'binance',
        name: '币安',
        urlTemplate: 'https://www.binance.com/zh-CN/trade/BTC_USDT?type=spot',
        symbols: ["PENGU-BNB", "VANRY-BTC", "RAY-BNB", "RUNE-BNB", "TNSR-BTC", "WOO-BTC", "VANA-BNB", "SNT-USDT", "CTXC-USDT", "ELF-BTC", "ELF-USDT", "TROY-TRY", "TROY-USDT", "NULS-USDT", "NULS-BTC", "VIDT-USDT", "VIDT-BTC", "CELR-BTC", "BADGER-BTC", "BADGER-USDT", "ALPHA-BTC", "POND-BTC", ...lowCoin],
        minVolume: 0,  // 默认最小交易量
        minPrice: 0.000001  // 最小有效价格
    },
    okex: {
        id: 'okex',
        name: '欧易',
        urlTemplate: 'https://www.okx.com/zh-hans/trade-spot/btc-usdt',
        symbols: ["PENGU-BNB", ...lowCoin],
        minVolume: 0,  // 默认最小交易量
        minPrice: 0.000001  // 最小有效价格
    },
    hotcoin: {
        id: 'hotcoin',
        name: 'HOTCOIN',
        urlTemplate: 'https://www.hotcoin.com/zh_CN/trade/exchange/?tradeCode=btc_usdt',
        symbols: ["PENGU-BNB", ...lowCoin],
        minVolume: 0,  // 默认最小交易量
        minPrice: 0.000001  // 最小有效价格
    },
    gateio: {
        id: 'gateio',
        name: 'Gate.io',
        urlTemplate: 'https://www.gate.io/zh/trade/BTC_USDT',
        symbols: ["PENGU-BNB", ...lowCoin],
        minVolume: 0,  // 默认最小交易量
        minPrice: 0.000001  // 最小有效价格
    },
    huobi: {
        id: 'huobi',
        name: '火币',
        urlTemplate: 'https://www.htx.com/zh-cn/trade/btc_usdt',
        symbols: ["PENGU-BNB", ...lowCoin],
        minVolume: 0,  // 默认最小交易量
        minPrice: 0.000001  // 最小有效价格
    },
    bitget: {
        id: 'bitget',
        name: 'Bitget',
        urlTemplate: 'https://www.bitget.com/zh-CN/spot/BTCUSDT',
        symbols: ["PENGU-BNB", ...lowCoin],
        minVolume: 0,  // 默认最小交易量
        minPrice: 0.000001  // 最小有效价格
    },
    bybit: {
        id: 'bybit',
        name: 'Bybit',
        urlTemplate: 'https://www.bybit.com/zh-MY/trade/spot/BTC/USDT',
        symbols: ["PENGU-BNB", ...lowCoin],
        minVolume: 0,  // 默认最小交易量
        minPrice: 0.000001  // 最小有效价格
    },
};



export const BASECOINS = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'ZAR', 'EUR', 'TRY', 'FDUSD','PAX','TUSD','BUSDS','RUB','ARS']
// export const BASECOINS = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'ZAR', 'FDUSD']



export const getExchangeInfoByLink = (link, exchanges) => {
    const exchangeMap = {
        'www.htx.com': 'huobi',
        'www.binance.com': 'binance',
        'www.mexc.com': 'mexc',
        'www.xt.com': 'xt',
        'www.okx.com': 'okex',
        'www.hotcoin.com': 'hotcoin',
        'www.gate.io': 'gateio',
        'www.bitget.com': 'bitget',
        'www.bybit.com': 'bybit'
    };

    for (const domain in exchangeMap) {
        if (link.includes(domain)) {
            const exchangeId = exchangeMap[domain];
            return exchanges[exchangeId];
        }
    }
    return null;
};
// 每个币小于这个数值的，就不显示
export const VOL_24H = 20 * 10000;
// ... existing code ...
export const EXCHANGES = {
    mexc: {
        id: 'mexc',
        name: 'MEXC',
        apiUrl: 'https://api.panpans.cn/mexc-api-proxy',
        deposit: 'https://www.mexc.com/zh-MY/assets/deposit/BTC',
        withdraw: 'https://www.mexc.com/zh-MY/assets/withdraw/BTC',
        urlTemplate: 'https://www.mexc.com/zh-MY/exchange/BTC_USDT',
        symbolCase: 'upper',
        withdrawSuffix: '',
        ending: 'USDT'
    },
    xt: {
        id: 'xt',
        name: 'XT',
        apiUrl: 'https://api.panpans.cn/xt-api-proxy',
        deposit: 'https://www.xt.com/zh-CN/accounts/assets/wallet/deposit',
        withdraw: 'https://www.xt.com/zh-CN/accounts/assets/wallet/withdraw',
        symbolCase: 'keep',
        withdrawSuffix: '',
        ending: '_usdt'
    },
    binance: {
        id: 'binance',
        name: '币安',
        apiUrl: 'https://api.panpans.cn/binance-api-proxy',
        // apiUrl: 'https://api.binance.com/api/v3/ticker/24hr',
        deposit: 'https://www.binance.com/zh-CN/my/wallet/account/main/deposit/crypto/BTC',
        withdraw: 'https://www.binance.com/zh-CN/my/wallet/account/main/withdrawal/crypto/BTC',
        urlTemplate: 'https://www.binance.com/zh-CN/trade/BTC_USDT?type=spot',
        symbolCase: 'upper',
        withdrawSuffix: '',
        ending: 'USDT'
    },
    okex: {
        id: 'okex',
        name: 'OKEX',
        apiUrl: 'https://api.panpans.cn/okex-api-proxy',
        deposit: 'https://www.okx.com/zh-hans/balance/recharge/btc',
        withdraw: 'https://www.okx.com/zh-hans/balance/withdrawal/btc-chain',
        urlTemplate: 'https://www.okx.com/zh-hans/trade-spot/btc-usdt',
        symbolCase: 'lower',
        withdrawSuffix: '--chain'
    },
    hotcoin: {
        id: 'hotcoin',
        name: 'HOTCOIN',
        apiUrl: 'https://api.panpans.cn/hotcoin-api-proxy',
        deposit: 'https://www.hotcoin.com/zh_CN/assetManagement/topup/?name=52',
        withdraw: 'https://www.hotcoin.com/zh_CN/assetManagement/extract/?name=52',
        urlTemplate: 'https://www.hotcoin.com/zh_CN/trade/exchange/?tradeCode=btc_usdt',
        symbolCase: 'keep',
        withdrawSuffix: '',
        ending: '_usdt'
    },
    gateio: {
      id: 'gateio',
      name: 'Gate.io',  
      apiUrl: 'https://api.panpans.cn/gateio-api-proxy',
      deposit: 'https://www.gate.io/zh/myaccount/deposit/BTC',
      withdraw: 'https://www.gate.io/zh/myaccount/withdraw/BTC',
      urlTemplate: 'https://www.gate.io/zh/trade/BTC_USDT',
      symbolCase: 'upper',
      withdrawSuffix: ''
    },
    huobi: {
      id: 'huobi',
      name: '火币',  
      apiUrl: 'https://api.panpans.cn/huobi-api-proxy',
      deposit: 'https://www.htx.com/zh-cn/finance/deposit/btc',
      withdraw: 'https://www.htx.com/zh-cn/finance/withdraw/btc',
      urlTemplate: 'https://www.htx.com/zh-cn/trade/btc_usdt',
      symbolCase: 'lower',
      withdrawSuffix: '',
      ending: '_usdt'
    },
    bitget: {
      id: 'bitget',
      name: 'Bitget',  
      apiUrl: 'https://api.panpans.cn/bitget-api-proxy',
      deposit: 'https://www.bitget.com/zh-CN/asset/recharge?coinId=2',
      withdraw: 'https://www.bitget.com/zh-CN/asset/withdraw?coinId=2',
      urlTemplate: 'https://www.bitget.com/zh-CN/spot/BTCUSDT',
      symbolCase: 'keep',
      withdrawSuffix: '',
      ending: '_usdt'
    },
    bybit: {
      id: 'bybit',
      name: 'Bybit',  
      apiUrl: 'https://api.panpans.cn/bybit-api-proxy',
      deposit: 'https://www.bybit.com/user/assets/deposit',
      withdraw: 'https://www.bybit.com/user/assets/withdraw',
      urlTemplate: 'https://www.bybit.com/zh-MY/trade/spot/BTC/USDT',
      symbolCase: 'keep',
      withdrawSuffix: '',
      ending: '_usdt'
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
        `;
    },
    emptyState: () => {
        return `
                 <tr class="no-data-row">
                        <td style="height: 500px;" colspan="8" class="text-center text-gray-500">暂无数据</td>
                    </tr>

        `;
    }
};

// ... 文件中的其他代码 ...