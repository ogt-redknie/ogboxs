export interface MarketCoin {
  instId: string
  symbol: string
  name: string
  icon: string
  price: number
  change24h: number
  volCcy24h: number
  high24h: number
  low24h: number
  open24h: number
}

const KNOWN_COINS: Record<string, { name: string; icon: string }> = {
  BTC: { name: 'Bitcoin', icon: '₿' },
  ETH: { name: 'Ethereum', icon: 'Ξ' },
  XRP: { name: 'XRP', icon: '✕' },
  BNB: { name: 'BNB', icon: '◆' },
  SOL: { name: 'Solana', icon: 'S' },
  TRX: { name: 'TRON', icon: 'T' },
  DOGE: { name: 'Dogecoin', icon: 'D' },
  BCH: { name: 'Bitcoin Cash', icon: 'B' },
  ADA: { name: 'Cardano', icon: 'A' },
  HYPE: { name: 'HyperLiquid', icon: 'H' },
  WBTC: { name: 'Wrapped Bitcoin', icon: '₿' },
  LEO: { name: 'LEO Token', icon: 'L' },
  XMR: { name: 'Monero', icon: 'M' },
  LINK: { name: 'Chainlink', icon: '⬡' },
  XLM: { name: 'Stellar', icon: '✦' },
  HBAR: { name: 'Hedera', icon: 'Ħ' },
  LTC: { name: 'Litecoin', icon: 'Ł' },
  AVAX: { name: 'Avalanche', icon: '▲' },
  DOT: { name: 'Polkadot', icon: '●' },
  MATIC: { name: 'Polygon', icon: '⬢' },
  SHIB: { name: 'Shiba Inu', icon: '🐕' },
  ARB: { name: 'Arbitrum', icon: '◇' },
  OP: { name: 'Optimism', icon: '⊕' },
  SUI: { name: 'Sui', icon: '◎' },
  APT: { name: 'Aptos', icon: '◈' },
  FIL: { name: 'Filecoin', icon: '⬡' },
  ICP: { name: 'Internet Computer', icon: '◉' },
  etc: { name: 'Ethereum Classic', icon: 'Ξ' },
  XDC: { name: 'XDC Network', icon: '✕' },
  MKR: { name: 'Maker', icon: '◇' },
  UNI: { name: 'Uniswap', icon: '🦄' },
  AAVE: { name: 'Aave', icon: '◈' },
  CRO: { name: 'Cronos', icon: 'C' },
  NEAR: { name: 'NEAR Protocol', icon: 'N' },
  ALGO: { name: 'Algorand', icon: 'a' },
  QNT: { name: 'Quant', icon: 'Q' },
  FTX: { name: 'Fantom', icon: 'F' },
  MANA: { name: 'Decentraland', icon: '◆' },
  SAND: { name: 'The Sandbox', icon: '▣' },
  AXS: { name: 'Axie Infinity', icon: '◈' },
  APE: { name: 'ApeCoin', icon: '🦍' },
  CHZ: { name: 'Chiliz', icon: 'C' },
  ENJ: { name: 'Enjin Coin', icon: '◈' },
  THETA: { name: 'Theta Network', icon: 'θ' },
  EOS: { name: 'EOS', icon: 'EO' },
  XTZ: { name: 'Tezos', icon: '⛩' },
  FLOW: { name: 'Flow', icon: 'F' },
  ZEC: { name: 'Zcash', icon: 'Z' },
  DASH: { name: 'Dash', icon: 'D' },
  XEM: { name: 'NEM', icon: 'N' },
  WAVES: { name: 'Waves', icon: '∿' },
  COMP: { name: 'Compound', icon: '◢' },
  SNX: { name: 'Synthetix', icon: 'S' },
  LRC: { name: 'Loopring', icon: '◯' },
  ZIL: { name: 'Zilliqa', icon: 'Z' },
  ENS: { name: 'Ethereum Name Service', icon: 'Ξ' },
  '1INCH': { name: '1inch Network', icon: '1' },
  CRV: { name: 'Curve DAO Token', icon: '◠' },
  OKB: { name: 'OKB', icon: 'O' },
}

function getCoinMeta(symbol: string): { name: string; icon: string } {
  return KNOWN_COINS[symbol] ?? { name: symbol, icon: '?' }
}

export function buildMarketCoins(tickers: MarketCoin[]): MarketCoin[] {
  return tickers.map(t => {
    const meta = getCoinMeta(t.symbol)
    return { ...t, name: meta.name, icon: meta.icon }
  })
}
