// ======== Market Constants and Static Data ========

export const MOCK_CHART_RATIOS = [
  1.044, 1.042, 1.040, 1.043, 1.041, 1.036, 1.046, 1.048,
  1.044, 1.039, 1.031, 1.026, 1.021, 1.016, 1.013, 1.011,
  1.009, 1.006, 1.001, 0.999, 0.998, 0.997, 0.999, 1.000,
]

export const MOCK_BASE_TIME = 1740337200000 // 2026-02-23T11:00:00Z (fixed anchor)

export function buildMockChart(price: number): { time: number; price: number }[] {
  return MOCK_CHART_RATIOS.map((r, i) => ({ time: MOCK_BASE_TIME + i * 3600000, price: price * r }))
}

export interface MarketCacheEntry {
  id: string
  price: number
  change24h: number
  volume: string
  marketCap: string
  high24h: number
  low24h: number
  supply: string
  maxSupply: string
  chartData: { time: number; price: number }[]
}

export const BUILT_IN_MARKET_MOCK: MarketCacheEntry[] = [
  { id: 'bitcoin',          price: 64704,     change24h: -3.99144,  volume: '50.09B',  marketCap: '1.30T',   high24h: 67695,     low24h: 64425,     supply: '19.99M',  maxSupply: '21.00M',  chartData: buildMockChart(64704) },
  { id: 'ethereum',         price: 1859.26,   change24h: -4.26409,  volume: '22.59B',  marketCap: '224.90B', high24h: 1958.6,    low24h: 1845.98,   supply: '120.69M', maxSupply: '∞',       chartData: buildMockChart(1859.26) },
  { id: 'ripple',           price: 1.37,      change24h: -1.79745,  volume: '3.44B',   marketCap: '83.40B',  high24h: 1.42,      low24h: 1.34,      supply: '61.02B',  maxSupply: '100.00B', chartData: buildMockChart(1.37) },
  { id: 'binancecoin',      price: 596.32,    change24h: -2.51601,  volume: '1.45B',   marketCap: '81.50B',  high24h: 615.83,    low24h: 585.83,    supply: '136.36M', maxSupply: '200.00M', chartData: buildMockChart(596.32) },
  { id: 'solana',           price: 78.33,     change24h: -5.73523,  volume: '4.86B',   marketCap: '44.47B',  high24h: 83.54,     low24h: 77.32,     supply: '568.47M', maxSupply: '∞',       chartData: buildMockChart(78.33) },
  { id: 'tron',             price: 0.281915,  change24h: -3.03778,  volume: '631.30M', marketCap: '26.70B',  high24h: 0.291002,  low24h: 0.281785,  supply: '94.74B',  maxSupply: '∞',       chartData: buildMockChart(0.281915) },
  { id: 'dogecoin',         price: 0.093931,  change24h: -1.07405,  volume: '1.03B',   marketCap: '15.89B',  high24h: 0.097358,  low24h: 0.091894,  supply: '168.83B', maxSupply: '∞',       chartData: buildMockChart(0.093931) },
  { id: 'bitcoin-cash',     price: 526.83,    change24h: -7.64023,  volume: '384.46M', marketCap: '10.55B',  high24h: 572.74,    low24h: 527.36,    supply: '20.00M',  maxSupply: '21.00M',  chartData: buildMockChart(526.83) },
  { id: 'cardano',          price: 0.26408,   change24h: -2.11833,  volume: '450.59M', marketCap: '9.72B',   high24h: 0.273903,  low24h: 0.258928,  supply: '36.81B',  maxSupply: '45.00B',  chartData: buildMockChart(0.26408) },
  { id: 'hyperliquid',      price: 26.0,      change24h: -10.19582, volume: '264.23M', marketCap: '6.22B',   high24h: 29.01,     low24h: 25.89,     supply: '238.39M', maxSupply: '1.00B',   chartData: buildMockChart(26.0) },
  { id: 'wrapped-bitcoin',  price: 64393,     change24h: -4.16708,  volume: '171.35M', marketCap: '7.79B',   high24h: 67472,     low24h: 64027,     supply: '120.73K', maxSupply: '∞',       chartData: buildMockChart(64393) },
  { id: 'leo-token',        price: 8.08,      change24h: -1.04536,  volume: '3.30M',   marketCap: '7.45B',   high24h: 8.34,      low24h: 7.93,      supply: '921.31M', maxSupply: '∞',       chartData: buildMockChart(8.08) },
  { id: 'monero',           price: 311.45,    change24h: -3.11795,  volume: '84.47M',  marketCap: '5.74B',   high24h: 328.23,    low24h: 307.88,    supply: '18.45M',  maxSupply: '∞',       chartData: buildMockChart(311.45) },
  { id: 'chainlink',        price: 8.29,      change24h: -3.99467,  volume: '371.26M', marketCap: '5.88B',   high24h: 8.69,      low24h: 8.19,      supply: '708.10M', maxSupply: '1.00B',   chartData: buildMockChart(8.29) },
  { id: 'stellar',          price: 0.151293,  change24h: -2.08703,  volume: '100.14M', marketCap: '4.97B',   high24h: 0.157003,  low24h: 0.14974,   supply: '32.86B',  maxSupply: '∞',       chartData: buildMockChart(0.151293) },
  { id: 'hedera-hashgraph', price: 0.094964,  change24h: -2.37653,  volume: '98.76M',  marketCap: '4.08B',   high24h: 0.098322,  low24h: 0.093733,  supply: '43.00B',  maxSupply: '50.00B',  chartData: buildMockChart(0.094964) },
]

export const COIN_STATIC_LIST: Array<{ id: string; symbol: string; name: string; icon: string; okxInstId: string }> = [
  { id: 'bitcoin',          symbol: 'BTC',  name: 'Bitcoin',         icon: '₿', okxInstId: 'BTC-USDT' },
  { id: 'ethereum',         symbol: 'ETH',  name: 'Ethereum',        icon: 'Ξ', okxInstId: 'ETH-USDT' },
  { id: 'ripple',           symbol: 'XRP',  name: 'XRP',             icon: '✕', okxInstId: 'XRP-USDT' },
  { id: 'binancecoin',      symbol: 'BNB',  name: 'BNB',             icon: '◆', okxInstId: 'BNB-USDT' },
  { id: 'solana',           symbol: 'SOL',  name: 'Solana',          icon: 'S', okxInstId: 'SOL-USDT' },
  { id: 'tron',             symbol: 'TRX',  name: 'TRON',            icon: 'T', okxInstId: 'TRX-USDT' },
  { id: 'dogecoin',         symbol: 'DOGE', name: 'Dogecoin',        icon: 'D', okxInstId: 'DOGE-USDT' },
  { id: 'bitcoin-cash',     symbol: 'BCH',  name: 'Bitcoin Cash',    icon: 'B', okxInstId: 'BCH-USDT' },
  { id: 'cardano',          symbol: 'ADA',  name: 'Cardano',         icon: 'A', okxInstId: 'ADA-USDT' },
  { id: 'hyperliquid',      symbol: 'HYPE', name: 'HyperLiquid',    icon: 'H', okxInstId: 'HYPE-USDT' },
  { id: 'wrapped-bitcoin',  symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: '₿', okxInstId: 'WBTC-USDT' },
  { id: 'leo-token',        symbol: 'LEO',  name: 'LEO Token',      icon: 'L', okxInstId: 'LEO-USDT' },
  { id: 'monero',           symbol: 'XMR',  name: 'Monero',          icon: 'M', okxInstId: 'XMR-USDT' },
  { id: 'chainlink',        symbol: 'LINK', name: 'Chainlink',       icon: '⬡', okxInstId: 'LINK-USDT' },
  { id: 'stellar',          symbol: 'XLM',  name: 'Stellar',         icon: '✦', okxInstId: 'XLM-USDT' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera',         icon: 'Ħ', okxInstId: 'HBAR-USDT' },
]
