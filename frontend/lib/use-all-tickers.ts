import { useState, useCallback, useEffect } from 'react';
import { MarketCoin, buildMarketCoins } from './market-types';

const OKX_BASE = 'https://www.okx.com/api/v5/market';
const CACHE_DURATION = 30_000;
const TOP_COUNT = 100;
const FAVORITES_KEY = 'ogbo_market_favorites';
const FETCH_TIMEOUT_MS = 8000;

interface CacheEntry {
  data: MarketCoin[];
  ts: number;
}

let cache: CacheEntry | null = null;
let inFlight: Promise<MarketCoin[]> | null = null;

export function useMarketCoins() {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const fetchMarket = useCallback(async (force = false) => {
    if (!force && cache && Date.now() - cache.ts < CACHE_DURATION) {
      setCoins(cache.data);
      return cache.data;
    }
    if (inFlight) return inFlight;

    setLoading(true);
    inFlight = (async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        const res = await fetch(`${OKX_BASE}/tickers?instType=SPOT`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.code !== '0' || !json.data) throw new Error(json.msg || 'OKX API error');

        const raw: MarketCoin[] = json.data
          .map((t: {
            instId: string;
            last: string;
            open24h: string;
            high24h: string;
            low24h: string;
            volCcy24h: string;
          }) => {
            const last = parseFloat(t.last) || 0;
            const open = parseFloat(t.open24h) || last;
            return {
              instId: t.instId,
              symbol: t.instId.replace(/-USDT$/, '').replace(/-USD$/, ''),
              name: '',
              icon: '?',
              price: last,
              change24h: open > 0 ? ((last - open) / open) * 100 : 0,
              volCcy24h: parseFloat(t.volCcy24h) || 0,
              high24h: parseFloat(t.high24h) || 0,
              low24h: parseFloat(t.low24h) || 0,
              open24h: open,
            };
          })
          .filter((t: MarketCoin) => t.volCcy24h > 0);

        raw.sort((a, b) => b.volCcy24h - a.volCcy24h);
        const top = buildMarketCoins(raw.slice(0, TOP_COUNT));

        cache = { data: top, ts: Date.now() };
        return top;
      } finally {
        inFlight = null;
        setLoading(false);
      }
    })();

    let result: MarketCoin[] | undefined;
    try {
      result = await inFlight;
      setCoins(result);
    } catch (e) {
      console.warn('[useMarketCoins] fetch failed', e);
      if (cache) setCoins(cache.data);
    }

    return result ?? cache?.data ?? [];
  }, []);

  const applyWsUpdate = useCallback((instId: string, last: string, open24h: string, high24h: string, low24h: string, volCcy24h: string) => {
    setCoins(prev => {
      const idx = prev.findIndex(c => c.instId === instId);
      if (idx === -1) return prev;
      const p = parseFloat(last) || 0;
      const o = parseFloat(open24h) || p;
      const next = [...prev];
      next[idx] = {
        ...prev[idx],
        price: p,
        change24h: o > 0 ? ((p - o) / o) * 100 : 0,
        volCcy24h: parseFloat(volCcy24h) || next[idx].volCcy24h,
        high24h: parseFloat(high24h) || next[idx].high24h,
        low24h: parseFloat(low24h) || next[idx].low24h,
      };
      return next;
    });
  }, []);

  return { coins, favorites, loading, fetchMarket, toggleFavorite, applyWsUpdate };
}
