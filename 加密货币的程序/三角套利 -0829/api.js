import { EXCHANGES as StaticExchanges, FILTER_CONFIG } from './staticData.js';
import { formatUtils } from './tools.js';

const symbolPrice = formatUtils.getSymbolPrice();

// 通用解析器生成器
const createExchangeParser = (exchangeConfig) => {
  const {
    dataPath = '', 
    fieldMapping,
    symbolLinkFormatter,
    filterKey
  } = exchangeConfig;

  return (rawData) => {
    // 修复数据路径解析逻辑
    const keys = dataPath.split('.').filter(Boolean); // 过滤空路径段
    const targetData = keys.length 
      ? keys.reduce((d, key) => (d || {})[key], rawData) // 安全访问嵌套属性
      : rawData; // 直接使用原始数据
    const data = Array.isArray(targetData) ? targetData : [];
    return data.reduce((acc, item) => {
      if (!item) return acc;
      // 使用解构赋值提取字段
      const {
        [fieldMapping.symbol]: symbol,
        [fieldMapping.volume]: volume,
        [fieldMapping.quoteVolume]: quoteVolume,
        [fieldMapping.lastPrice]: lastPrice
      } = item;

      // 统一数值处理
      const [v, qv, lp] = [volume, quoteVolume, lastPrice].map(parseFloat);
      if ([v, qv, lp].some(v => v === 0)) return acc;

      // 统一 symbol 处理
      const symbolObj = formatUtils.formatSymbol(symbol);
      if (FILTER_CONFIG[filterKey].symbols.includes(symbolObj.symbol)) return acc;
      // 统一成交量处理
      const finalQuoteVolume = fieldMapping.calculateQuoteVolume 
        ? fieldMapping.calculateQuoteVolume({v, lp}) 
        : qv;
      const vol24h = formatUtils.processBinanceVolume(finalQuoteVolume, symbolObj.after);
      console.log(vol24h,'========vol24h');
      console.log(symbolObj,'========symbolObj');
      if (vol24h >= formatUtils.getVol24h()) {
      console.log(vol24h,'========vol24h--------------20000');
        acc.push({
          symbol: symbolObj.symbol,
          symbolList: [symbolObj.before, symbolObj.after],
          price: lp,
          symbolPrice,
          vol24h,
          exchange: filterKey,
          symbolLink: symbolLinkFormatter(symbolObj)
        });
      }

      return acc;
    }, []);
  };
};

// 交易所字段映射配置
const EXCHANGE_CONFIGS = {
  mexc: {
    dataPath: '',
    fieldMapping: {
      symbol: 'symbol',
      volume: 'volume',
      quoteVolume: 'quoteVolume',
      lastPrice: 'lastPrice'
    },
    symbolLinkFormatter: ({before, after}) => 
      `https://www.mexc.com/zh-MY/exchange/${before.toUpperCase()}_${after.toUpperCase()}`,
    filterKey: 'mexc'
  },
  xt: {
    dataPath: 'result',
    fieldMapping: {
      symbol: 's',
      volume: 'q',
      quoteVolume: 'v',
      lastPrice: 'c'
    },
    symbolLinkFormatter: ({before, after}) =>
      `https://www.xt.com/zh-CN/trade/${before.toLowerCase()}_${after.toLowerCase()}`,
    filterKey: 'xt'
  },
  binance: {
    dataPath: '',
    fieldMapping: {
      symbol: 'symbol',
      volume: 'volume',
      quoteVolume: 'quoteVolume',
      lastPrice: 'lastPrice'
    },
    symbolLinkFormatter: ({before, after}) =>
      `https://www.binance.com/zh-CN/trade/${before.toUpperCase()}_${after.toUpperCase()}`,
    filterKey: 'binance'
  },
  okex: {
    dataPath: 'data',
    fieldMapping: {
      symbol: 'instId',
      // volume: 'volCcy24h',
      // quoteVolume: 'vol24h',
      volume: 'vol24h',
      quoteVolume: 'volCcy24h',
      lastPrice: 'last'
    },
    symbolLinkFormatter: ({before, after}) =>
      `https://www.okx.com/zh-hans/trade-spot/${before.toLowerCase()}-${after.toLowerCase()}`,
    filterKey: 'okex'
  },
  hotcoin: {
    dataPath: 'ticker',
    fieldMapping: {
      symbol: 'symbol',
      volume: 'vol',
      lastPrice: 'last',
      calculateQuoteVolume: ({v, lp}) => v * lp // 特殊处理成交量计算
    },
    symbolLinkFormatter: ({before, after}) =>
      `https://www.hotcoin.com/zh_CN/trade/exchange/?tradeCode=${before.toLowerCase()}-${after.toLowerCase()}`,
    filterKey: 'okex' // 保持原有逻辑
  },
  gateio: {
    dataPath: '',
    fieldMapping: {
      symbol: 'currency_pair',
      volume: 'base_volume',
      quoteVolume: 'quote_volume',
      lastPrice: 'last'
    },
    symbolLinkFormatter: ({before, after}) =>
      `https://www.gate.io/zh/trade/${before.toUpperCase()}_${after.toUpperCase()}`,
    filterKey: 'okex' // 保持原有逻辑
  },
  huobi: {
    dataPath: 'data',
    fieldMapping: {
      symbol: 'symbol',
      volume: 'amount',
      quoteVolume: 'vol',
      lastPrice: 'close'
    },
    symbolLinkFormatter: ({before, after}) =>
      `https://www.htx.com.de/zh-cn/trade/${before.toLowerCase()}_${after.toLowerCase()}?type=spot`,
    filterKey: 'okex' // 保持原有逻辑
  },
  bitget: {
    dataPath: 'data',
    fieldMapping: {
      symbol: 'symbol',
      volume: 'baseVolume',
      quoteVolume: 'usdtVolume',
      lastPrice: 'lastPr'
    },
    symbolLinkFormatter: ({before, after}) =>
      `https://www.bitget.com/zh-CN/spot/${before.toUpperCase()}${after.toUpperCase()}?type=spot`,
    filterKey: 'okex' // 保持原有逻辑
  },
  bybit: {
    dataPath: 'result.list',
    fieldMapping: {
      symbol: 'symbol',
      volume: 'volume24h',
      quoteVolume: 'turnover24h',
      lastPrice: 'lastPrice'
    },
    symbolLinkFormatter: ({before, after}) =>
      `https://www.bybit.com/zh-MY/trade/spot/${before.toUpperCase()}/${after.toUpperCase()}?type=spot`,
    filterKey: 'okex' // 保持原有逻辑
  }
};

// 生成最终的 EXCHANGES 配置
const EXCHANGES = Object.keys(StaticExchanges).reduce((acc, exchangeId) => {
  acc[exchangeId] = {
    ...StaticExchanges[exchangeId],
    parser: createExchangeParser(EXCHANGE_CONFIGS[exchangeId])
  };
  return acc;
}, {});

// 加载数据主函数（保持不变）
async function loadData(exchangeId) {
  const exchange = EXCHANGES[exchangeId];
  if (!exchange) return [];
  try {
    const response = await fetch(exchange.apiUrl);
    if (!response.ok) throw new Error(`请求失败: ${response.status}`);
    return exchange.parser(await response.json());
  } catch (error) {
    return [];
  }
}

export { loadData, EXCHANGES };