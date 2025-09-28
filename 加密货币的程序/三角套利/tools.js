import {
  getCachedCoinPrices
} from './coingecko_fetcher.js';

import { BASECOINS } from './staticData.js'
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


  // 如果利润这个价格就不显示，
  MIN_RETURN: 0.001,


  formatSymbol(rawSymbol) {
    const sortedBaseCoins = [...BASECOINS].sort((a, b) => b.length - a.length);
    const processed = rawSymbol.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    const pattern = new RegExp(`^(?<base>.+?)(?<quote>${sortedBaseCoins.join('|')})$`);
    const match = processed.match(pattern);

    if (match) {
      return {
        symbol: `${match.groups.base}-${match.groups.quote}`,
        before: match.groups.base,
        after: match.groups.quote
      };
    }

    return {
      symbol: processed,
      before: processed,
      after: ''
    };
  },




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
  parseSymbol(symbol) {
    const match = symbol.match(/^(\w+)(?:[\/\-_](\w+))?$/);
    return {
      base: match?.[1] || '',
      quote: match?.[2] || ''
    };
  },
  localStoredCoins() {
    const storedCoins = getLocalStorageItem('top3000Coins');
    if (!storedCoins) return;
    return storedCoins;
  },

  getColumnIndex(column) {
    const columns = {
      'symbol': 1,
      'price': 2,
      'pair1': 2,
      'pair2': 3,

      'pair3': 4,
      'path1': 5,
      'profit1': 6,
      'path2': 7,
      'profit2': 8

    };
    return columns[column] || 1;
  },
  // 获取三角套利的所有的交易对
  getTriangularArbitragePairs(params) {
    const getStandardizedPairKey = (currency1, currency2) => {
      return [currency1, currency2].sort().join('-');
    };

    // 预处理：创建货币映射和收集所有货币
    const currencyPairMap = {};
    const currencySet = new Set();

    params.forEach(item => {
      const [base, quote] = item.symbolList;
      const pairKey = getStandardizedPairKey(base, quote);
      currencyPairMap[pairKey] = item;
      currencySet.add(base).add(quote);
    });

    // 对货币进行排序以确保组合顺序一致
    const currencies = Array.from(currencySet).sort();
    const validTriangles = [];

    // 生成所有三货币组合
    for (let i = 0; i < currencies.length; i++) {
      for (let j = i + 1; j < currencies.length; j++) {
        for (let k = j + 1; k < currencies.length; k++) {
          const trio = [currencies[i], currencies[j], currencies[k]];
          const requiredPairs = [
            getStandardizedPairKey(trio[0], trio[1]),
            getStandardizedPairKey(trio[0], trio[2]),
            getStandardizedPairKey(trio[1], trio[2])
          ];

          // 检查三个交易对是否存在
          if (requiredPairs.every(pair => currencyPairMap[pair])) {
            const sortedId = trio.slice().sort().join('_');

            // 生成顺时针路径（A→B→C→A）
            const clockwiseKey = `${trio[0]} → ${trio[1]} → ${trio[2]} → ${trio[0]}`;
            const clockwisePairs = [
              currencyPairMap[getStandardizedPairKey(trio[0], trio[1])],
              currencyPairMap[getStandardizedPairKey(trio[1], trio[2])],
              currencyPairMap[getStandardizedPairKey(trio[2], trio[0])]
            ];
            validTriangles.push({
              Key: clockwiseKey,
              LIST: clockwisePairs,
              id: sortedId
            });

            // 生成逆时针路径（A→C→B→A）
            const counterKey = `${trio[0]} → ${trio[2]} → ${trio[1]} → ${trio[0]}`;
            const counterPairs = [
              currencyPairMap[getStandardizedPairKey(trio[0], trio[2])],
              currencyPairMap[getStandardizedPairKey(trio[2], trio[1])],
              currencyPairMap[getStandardizedPairKey(trio[1], trio[0])]
            ];
            validTriangles.push({
              Key: counterKey,
              LIST: counterPairs,
              id: sortedId
            });
          }
        }
      }
    }

    return validTriangles;
  },


  // 处理binance的24小时交易量,如果没有提供ending参数，直接返回volume的数值。
  // 如果提供了ending参数，将volume转换为以ending为基准的数值。
  // 例如，如果volume是1000，ending是USDT，那么返回的数值将是1000 * USDT的价格。
  // 如果volume是1000，ending是BTC，那么返回的数值将是1000 * BTC的价格。
  processBinanceVolume(volume, ending) {
    // 如果 ending 参数未提供，直接返回 volume 的数值
    if (ending === undefined) {
      return parseFloat(volume);
    }

    // 以下是原有的处理逻辑
    const price = getCachedCoinPrices()?.find(p => p.symbol === ending)?.price;
    return parseFloat(volume) * price;
  },

  getSymbolPrice() {
    const prices = getCachedCoinPrices();
    if (!prices || !Array.isArray(prices)) return {};

    return prices.reduce((acc, coin) => {
      if (BASECOINS.includes(coin?.symbol?.toUpperCase())) {
        const price = parseFloat(coin.price);
        if (!isNaN(price) && price > 0) {
          acc[coin.symbol.toUpperCase()] = price;
        }
      }
      return acc;
    }, {});
  },
  /**
   * 计算三角套利利润方法
   * @param {Array} arbitragePaths 套利路径数组（包含交易对数据和路径信息）
   * @param {Object} fees 手续费对象（以交易对symbol为键值）
   * @returns {Array} 包含利润计算结果的新数组
   */
  calculateArbitrageProfit(arbitragePaths, fees = {}) {
    return arbitragePaths.map(path => {
      try {
        const steps = path.LIST;
        const currencies = path.Key.split(' → ');

        // 验证路径有效性（必须形成闭环）
        if (currencies.length !== 4 || currencies[0] !== currencies[3]) {
          return { ...path, profit: 0, error: "Invalid path format" };
        }

        let amount = 1; // 初始金额（1单位起始货币）

        for (let i = 0; i < 3; i++) {
          const fromCurr = currencies[i];
          const toCurr = currencies[i + 1];
          const pair = steps[i];

          // 验证交易对有效性
          if (!pair?.symbolList || pair.symbolList.length !== 2 || !pair.price) {
            amount = 0;
            break;
          }

          // 获取交易对基本信息
          const [base, quote] = pair.symbolList;
          const price = Number(pair.price);
          const fee = Math.min(Math.max(fees[pair.symbol] || 0, 0), 0.1); // 限制手续费范围0-10%

          // 计算扣除手续费后的金额
          const amountAfterFee = amount * (1 - fee);

          // 根据交易方向计算金额
          if (fromCurr === quote && toCurr === base) {
            amount = amountAfterFee / price;
          } else if (fromCurr === base && toCurr === quote) {
            amount = amountAfterFee * price;
          } else {
            amount = 0;
            break;
          }

          // 处理极小数值情况
          if (Math.abs(amount) < 1e-10) amount = 0;
        }

        // 计算最终利润并格式化
        const profit = amount - 1;
        return {
          ...path,
          profit: Number(profit.toFixed(9)),     // 9位小数精度
          finalAmount: Number(amount.toFixed(9)) // 最终金额用于调试
        };

      } catch (error) {
        console.error(`Error processing ${path.id}:`, error);
        return { ...path, profit: 0, error: error.message };
      }
    });
  },


  //   优化版的三角套利组合，并可以计算利润
  findTriangularArbitrageOpportunities(data, calculateProfit = false) {
    // 生成标准化货币对键（按字母排序）
    const getStandardizedPairKey = (a, b) => [a, b].sort().join('-');

    // 预处理数据结构
    const currencyPairMap = {};
    const currencySet = new Set();

    data.forEach(item => {
      const [base, quote] = item.symbolList;
      const pairKey = getStandardizedPairKey(base, quote);
      currencyPairMap[pairKey] = { ...item, base, quote }; // 保留原始方向
      currencySet.add(base).add(quote);
    });

    const currencies = Array.from(currencySet).sort();
    const results = [];

    // 路径收益率计算器
    const calculatePathReturn = (steps) => {
      return steps.reduce((acc, { pair, invert }) => {
        return acc * (invert ? 1 / pair.price : pair.price);
      }, 1) - 1;
    };

    // 生成所有三货币组合
    for (let i = 0; i < currencies.length; i++) {
      for (let j = i + 1; j < currencies.length; j++) {
        for (let k = j + 1; k < currencies.length; k++) {
          const [A, B, C] = [currencies[i], currencies[j], currencies[k]];
          const requiredPairs = [
            getStandardizedPairKey(A, B),
            getStandardizedPairKey(A, C),
            getStandardizedPairKey(B, C)
          ];

          // 验证所有交易对存在
          if (requiredPairs.every(pair => currencyPairMap[pair])) {
            const id = [A, B, C].sort().join('_');

            // 生成两种套利路径
            const paths = [
              {
                key: `${A} → ${B} → ${C} → ${A}`,
                steps: [
                  { from: A, to: B, pairKey: requiredPairs[0] },
                  { from: B, to: C, pairKey: requiredPairs[2] },
                  { from: C, to: A, pairKey: requiredPairs[1] }
                ]
              },
              {
                key: `${A} → ${C} → ${B} → ${A}`,
                steps: [
                  { from: A, to: C, pairKey: requiredPairs[1] },
                  { from: C, to: B, pairKey: requiredPairs[2] },
                  { from: B, to: A, pairKey: requiredPairs[0] }
                ]
              }
            ];

            // 处理每条路径
            const validPaths = paths.map(path => {
              const processedSteps = path.steps.map(step => {
                const pair = currencyPairMap[step.pairKey];
                const invert = !(pair.base === step.from && pair.quote === step.to);
                return { pair, invert };
              });

              return {
                key: path.key,
                steps: processedSteps,
                return: calculateProfit ? calculatePathReturn(processedSteps) : null
              };
            });

            // 合并结果
            results.push({
              id,
              list: requiredPairs.map(pair => currencyPairMap[pair]),
              paths: {
                path1: validPaths[0],
                path2: validPaths[1]
              }
            });
          }
        }
      }
    }

    return results;
  }


};

// 导出 formatUtils 对象
export { formatUtils };