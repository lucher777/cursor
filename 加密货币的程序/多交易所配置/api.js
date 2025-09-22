// 初始化筛选配置（默认空对象）
let FILTER_CONFIG = {
    mexc: ['JLP',"YZYSOL"],
    xt: ["YZYSOL"],
    binance: ["AERGO", "ERN", "SNT", "CLV", "CTXC", "BAL", "BADGER", "NULS", "ELF", "BETH", "ANT", "MULTI", "SRM", "AST", "AUTO", "BOND", "MIR", "TCT", "UNFI", "VITE", "BTS", "QI", "REN", "ANC", "IRIS", "LOOM", "VGX", "REEF", "KP3R", "OOKI", "BEAM", "YFII", "LINA", "BURGER", "WNXM", "OMG", "MFT", "XMR", "TORN", "POLS", "TRIBE", "EPX", "BETA", "CREAM", "FIRO", "HNT", "AMB", "PROS", "HARD", "COMBO", "VIDT", "WAVES", "BLZ", "UFT","XEM","ALPACA"],
    okex: [],
    hotcoin: ["BEBE"],
    gateio: [],
    huobi: ['GNS'],
    bitget: [],
    bybit: []
};

import { EXCHANGES as StaticExchanges } from './staticData.js';


// 定义一个函数来根据链接查找交易所信息
const getExchangeInfoByLink = (link, exchanges) => {
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

// ... existing code ...

import {
    VOL_24H
} from './staticData.js';

// 处理 deposit 和 withdraw URL 的方法
function updateDepositWithdrawUrls(symbol, exchangeInfo) {
    if (exchangeInfo.symbolCase === 'keep') {
        return {
            deposit: exchangeInfo.deposit,
            withdraw: exchangeInfo.withdraw
        };
    }

    let newSymbol = symbol;
    if (exchangeInfo.symbolCase === 'lower') {
        newSymbol = symbol.toLowerCase();
    } else if (exchangeInfo.symbolCase === 'upper') {
        newSymbol = symbol.toUpperCase();
    }

    const updateUrl = (url, isWithdraw = false) => {
        if (!url) return url;
        const segments = url.split('/');
        let newUrl = segments.slice(0, -1).join('/') + '/' + newSymbol;
        if (isWithdraw && exchangeInfo.withdrawSuffix) {
            newUrl += exchangeInfo.withdrawSuffix;
        }
        return newUrl;
    };

    return {
        deposit: updateUrl(exchangeInfo.deposit),
        withdraw: updateUrl(exchangeInfo.withdraw, true)
    };
}



// 交易所配置（保持原接口调用，新增USDT结尾过滤和数值为0过滤）
const EXCHANGES = {
    // 以MEXC为例，其他交易所类似
    mexc: {
        ...StaticExchanges.mexc,
        parser: (data) => data
            .filter(item => item.symbol.toUpperCase().endsWith('USDT') && parseFloat(item.lastPrice) != 0) // 这里已经过滤价格为0的币
            .filter(item => {
                const symbolWithoutUSDT = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                return !FILTER_CONFIG.mexc.includes(symbolWithoutUSDT);
            })
            .filter(item => parseFloat(item.quoteVolume)> VOL_24H) 
            .map(item => {
                const symbol = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                const originalSymbol = symbol.toUpperCase() + '_USDT';
                const link = `https://www.mexc.com/zh-MY/exchange/${originalSymbol}`;
                const time = item.time ? new Date(item.time).toLocaleTimeString() : new Date().toLocaleTimeString();
                const timeColor = item.time ? '' : 'text-gray-500';
                return {
                    symbol,
                    price: parseFloat(item.lastPrice),
                    time,
                    timeColor,
                    symbolLink: link,
                    priceLink: link,
                    vol24h: parseFloat(item.quoteVolume), // 添加24小时成交量

                };
            }),
        ending: 'USDT'
    },
    xt: {
        ...StaticExchanges.xt,
        parser: (data) => data.result
            .filter(item => item.s.toUpperCase().endsWith('_USDT') && parseFloat(item.c) != 0) // 过滤非USDT结尾且价格不为0
            .filter(item => {
                const symbolWithoutUSDT = item.s.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                return !FILTER_CONFIG.xt.includes(symbolWithoutUSDT);
            })
            .filter(item => parseFloat(item.v)> VOL_24H) 
            .map(item => {
                const symbol = item.s.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                const originalSymbol = symbol.toLowerCase() + '_usdt';
                const link = `https://www.xt.com/zh-CN/trade/${originalSymbol}`;
                const time = item.t ? new Date(item.t).toLocaleTimeString() : new Date().toLocaleTimeString();
                const timeColor = item.t ? '' : 'text-gray-500';
                return {
                    symbol,
                    price: parseFloat(item.c),
                    time,
                    timeColor,
                    symbolLink: link,
                    priceLink: link,
                    vol24h: parseFloat(item.v), // 添加24小时成交量

                };
            }),
        ending: '_usdt'
    },
    binance: {
        ...StaticExchanges.binance,
        parser: (data) => data
            .filter(item => item.symbol.toUpperCase().endsWith('USDT') && parseFloat(item.lastPrice) != 0) // 过滤非USDT结尾且价格不为0
            .filter(item => {
                const symbolWithoutUSDT = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                return !FILTER_CONFIG.binance.includes(symbolWithoutUSDT);
            })
            .filter(item => parseFloat(item.quoteVolume)> VOL_24H) 
            .map(item => {
                const symbol = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                const originalSymbol = symbol.toUpperCase() + '_USDT';
                const link = `https://www.binance.com/zh-CN/trade/${originalSymbol}`;
                const time = new Date().toLocaleTimeString();
                const timeColor = 'text-gray-500';
                return {
                    symbol,
                    price: parseFloat(item.lastPrice),
                    time,
                    timeColor,
                    symbolLink: link,
                    priceLink: link,
                    vol24h: parseFloat(item.quoteVolume), // 添加24小时成交量

                };
            }),
        ending: 'USDT'
    },
    okex: {
        ...StaticExchanges.okex,
        parser: (data) => data.data
            .filter(item => item.instId.toUpperCase().endsWith('USDT') && parseFloat(item.last) != 0) // 过滤非USDT结尾且价格不为0
            .filter(item => {
                const symbolWithoutUSDT = item.instId.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                return !FILTER_CONFIG.okex.includes(symbolWithoutUSDT);
            }) // 应用筛选配置
            .filter(item => parseFloat(item.volCcy24h)> VOL_24H) 
            .map(item => {
                const symbol = item.instId.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                const originalSymbol = symbol.toLowerCase() + '-usdt';
                const link = `https://www.okx.com/zh-hans/trade-spot/${originalSymbol}`;
                const time = item.ts ? new Date(Number(item.ts)).toLocaleTimeString() : new Date().toLocaleTimeString();
                const timeColor = item.ts ? '' : 'text-gray-500';
                return {
                    symbol,
                    price: parseFloat(item.last),
                    time,
                    timeColor,
                    symbolLink: link,
                    priceLink: link,
                    vol24h: parseFloat(item.volCcy24h), // 添加24小时成交量
                };
            }),
        ending: 'USDT'
    },
    hotcoin: {
        ...StaticExchanges.hotcoin,
        parser: (data) => data.ticker
            .filter(item => item.symbol.toUpperCase().endsWith('USDT') && parseFloat(item.last) != 0) // 过滤非USDT结尾且价格不为0
            .filter(item => {
                const symbolWithoutUSDT = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                return !FILTER_CONFIG.hotcoin.includes(symbolWithoutUSDT);
            }) // 应用筛选配置
            .filter(item => parseFloat(item.vol)*parseFloat(item.last)> VOL_24H) 
            .map(item => {
                const symbol = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                const originalSymbol = symbol.toLowerCase() + '_usdt';
                const link = `https://www.hotcoin.com/zh_CN/trade/exchange/?tradeCode=${originalSymbol}`;
                const time = item.time ? new Date(item.time).toLocaleTimeString() : new Date().toLocaleTimeString();
                const timeColor = item.time ? '' : 'text-gray-500';
                return {
                    symbol,
                    price: parseFloat(item.last),
                    time,
                    timeColor,
                    symbolLink: link,
                    priceLink: link,
                    vol24h: parseFloat(item.vol)*parseFloat(item.last), // 添加24小时成交量

                };
            }),
        ending: 'USDT'
    },
    gateio: {
        ...StaticExchanges.gateio,
        // && parseFloat(item.quote_volume) >= 10000
        parser: (data) => data
            .filter(item => item.currency_pair.toUpperCase().endsWith('USDT') && parseFloat(item.last) != 0)
            .filter(item => {
                const symbolWithoutUSDT = item.currency_pair.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                return !FILTER_CONFIG.gateio.includes(symbolWithoutUSDT);
            })
            .filter(item => parseFloat(item.quote_volume)> VOL_24H) 
            .map(item => {
                const symbol = item.currency_pair.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                const originalSymbol = symbol.toLowerCase() + '_usdt';
                const link = `https://www.gate.io/zh/trade/${originalSymbol}`;
                const time = new Date().toLocaleTimeString();
                const timeColor = 'text-gray-500';
                return {
                    symbol,
                    price: parseFloat(item.last),
                    time,
                    timeColor,
                    symbolLink: link,
                    priceLink: link,
                    vol24h: parseFloat(item.quote_volume), // 添加24小时成交量
                };
            }),
        ending: '_usdt'
    },
    huobi: {
        ...StaticExchanges.huobi,
        // && parseFloat(item.vol) >= 10000
        parser: (data) => data.data
            .filter(item => item.symbol.toUpperCase().endsWith('USDT') && parseFloat(item.close) !== 0)
            .filter(item => {
                const symbolWithoutUSDT = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                return !FILTER_CONFIG.huobi.includes(symbolWithoutUSDT);
            })
            .filter(item => parseFloat(item.vol)> VOL_24H) 

            .map(item => {
                const symbol = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                const originalSymbol = symbol.toLowerCase() + '_usdt';
                const link = `https://www.htx.com/zh-cn/trade/${originalSymbol}`;
                const time = new Date(item.ts).toLocaleTimeString();
                const timeColor = '';
                return {
                    symbol,
                    price: parseFloat(item.close),
                    time,
                    timeColor,
                    symbolLink: link,
                    priceLink: link,
                    vol24h: parseFloat(item.vol), // 添加24小时成交量

                };
            }),
        ending: 'USDT'
    },
    bitget: {
        ...StaticExchanges.bitget,
        // && parseFloat(item.usdtVolume) >= 10000
        parser: (data) => data.data
            .filter(item => item.symbol.toUpperCase().endsWith('USDT') && parseFloat(item.lastPr) !== 0)
            .filter(item => {
                const symbolWithoutUSDT = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                return !FILTER_CONFIG.bitget.includes(symbolWithoutUSDT);
            })
            .filter(item => parseFloat(item.usdtVolume)> VOL_24H) 

            .map(item => {
                const symbol = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                const originalSymbol = symbol.toUpperCase() + 'USDT';
                const link = `https://www.bitget.com/zh-CN/spot/${originalSymbol}`;
                const time = new Date(Number(item.ts)).toLocaleTimeString();
                const timeColor = '';
                return {
                    symbol,
                    price: parseFloat(item.lastPr),
                    time,
                    timeColor,
                    symbolLink: link,
                    priceLink: link,
                    vol24h: parseFloat(item.usdtVolume), // 添加24小时成交量

                };
            }),
        ending: 'USDT'
    },
    bybit: {
        ...StaticExchanges.bybit,
        // && parseFloat(item.turnover24h) >= 10000
        parser: (data) => data.result.list
            .filter(item => item.symbol.toUpperCase().endsWith('USDT') && parseFloat(item.lastPrice) !== 0)
            .filter(item => {
                const symbolWithoutUSDT = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                return !FILTER_CONFIG.bybit.includes(symbolWithoutUSDT);
            })
            .filter(item => parseFloat(item.turnover24h)> VOL_24H) 

            .map(item => {
                const symbol = item.symbol.toUpperCase().replace(/_|-/g, '').replace('USDT', '');
                const originalSymbol = symbol.toUpperCase() + 'USDT';
                const link = `https://www.bybit.com/zh-MY/trade/spot/${symbol}/USDT`;
                const time = new Date(Number(item.time)).toLocaleTimeString();
                const timeColor = '';
                return {
                    symbol,
                    price: parseFloat(item.lastPrice),
                    time,
                    timeColor,
                    symbolLink: link,
                    priceLink: link,
                    vol24h: parseFloat(item.turnover24h), // 添加24小时成交量updatePanel3

                };
            }),
        ending: 'USDT'
    }
};

// 加载数据主函数
async function loadData(exchangeId) {
    const exchange = EXCHANGES[exchangeId];
    if (!exchange) return [];
    try {
        const response = await fetch(exchange.apiUrl);
        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        const rawData = await response.json();
        return exchange.parser(rawData);
    } catch (error) {
        return [];
    }
}

async function findSamePairs(data1, data2) {
    const symbolMap = new Map();

    data1.forEach(item => {
        symbolMap.set(item.symbol, { 
        price: item.price, 
        priceLink: item.priceLink,
        vol24h: item.vol24h || ''
});
    });

    // 使用Promise.all来处理所有异步操作
    const promises = data2.map(async (item) => {
        if (symbolMap.has(item.symbol)) {
            const price1 = parseFloat(symbolMap.get(item.symbol).price);
            const price2 = parseFloat(item.price);
            const diff = ((Math.max(price1, price2) - Math.min(price1, price2)) / Math.min(price1, price2)) * 100;

            const exchange1Info = getExchangeInfoByLink(symbolMap.get(item.symbol).priceLink, StaticExchanges);
            const exchange2Info = getExchangeInfoByLink(item.priceLink, StaticExchanges);

            const exchange1 = exchange1Info ? exchange1Info.id : '未知';
            const exchange2 = exchange2Info ? exchange2Info.id : '未知';

            let deposit1 = '未知';
            let withdraw1 = '未知';
            let deposit2 = '未知';
            let withdraw2 = '未知';

            if (exchange1Info) {
                const updatedUrls1 = updateDepositWithdrawUrls(item.symbol, exchange1Info);
                deposit1 = updatedUrls1.deposit;
                withdraw1 = updatedUrls1.withdraw;
            }

            if (exchange2Info) {
                const updatedUrls2 = updateDepositWithdrawUrls(item.symbol, exchange2Info);
                deposit2 = updatedUrls2.deposit;
                withdraw2 = updatedUrls2.withdraw;
            }

            return {
                symbol: item.symbol,
                price1,
                price2,
                vol24h_1: symbolMap.get(item.symbol).vol24h || '',
                vol24h_2: item.vol24h || '',
                diff: diff.toFixed(2),
                price1Link: symbolMap.get(item.symbol).priceLink,
                price2Link: item.priceLink,
                rank: item.market_cap_rank || '-',
                icon: item.icon || '-',
                exchange1,
                exchange2,
                deposit1,
                withdraw1,
                deposit2,
                withdraw2
            };
        }
        return null;
    });

    // 等待所有promise完成并过滤掉null值
    const resolvedResults = await Promise.all(promises);
    return resolvedResults.filter(item => item !== null);
}


export { loadData, findSamePairs, EXCHANGES };