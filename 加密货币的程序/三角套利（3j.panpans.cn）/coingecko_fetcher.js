// 基础配置
const COINGECKO_API = {
  baseUrl: 'https://api.coingecko.com/api/v3',
  getMarkets: params => `${COINGECKO_API.baseUrl}/coins/markets?${new URLSearchParams(params)}`
};

// 缓存配置
export const COIN_PRICE_CACHE_KEY = 'coinPricesCache';
export const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1小时

// 币种映射
const CoinPrice = [
  { symbol: "BTC", id: "bitcoin" },
  { symbol: "ETH", id: "ethereum" },
  { symbol: "USDT", id: "tether" },
  { symbol: "BNB", id: "binancecoin" },
  { symbol: "USDC", id: "usd-coin" },
  { symbol: "FDUSD", id: "first-digital-usd" }
];

// 缓存处理
const handleCache = () => {
  try {
    const cache = JSON.parse(sessionStorage.getItem(COIN_PRICE_CACHE_KEY));
    return cache?.data?.length && Date.now() - cache.timestamp < CACHE_EXPIRATION_TIME 
      ? cache.data 
      : null;
  } catch (e) {
    console.error('缓存处理异常:', e);
    return null;
  }
};

async function getCoinPrices(coinIds = CoinPrice, vsCurrency = 'usd') {
  if (handleCache()) return handleCache();

  try {
    const response = await fetch(COINGECKO_API.getMarkets({
      vs_currency: vsCurrency,
      ids: coinIds.map(({ id }) => id)
    }));
    
    if (!response.ok) throw new Error(`请求失败: ${response.status}`);

    const prices = await response.json();
    const data = prices.map(({ id, symbol, current_price }) => ({
      id,
      symbol: symbol.toUpperCase(),
      price: current_price
    }));

    sessionStorage.setItem(COIN_PRICE_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (error) {
    console.error('币价获取失败:', error);
    return null;
  }
}

export const getCachedCoinPrices = handleCache;
export { getCoinPrices };