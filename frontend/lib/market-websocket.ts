import { COIN_STATIC_LIST } from './market-constants';

const OKX_WS_URL = 'wss://ws.okx.com:8443/ws/v5/public';

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let manualClose = false;

type TickerCallback = (instId: string, last: string, open24h: string, high24h: string, low24h: string, volCcy24h: string) => void;
const tickerCallbacks = new Set<TickerCallback>();

export function onTicker(cb: TickerCallback): () => void {
  tickerCallbacks.add(cb);
  return () => tickerCallbacks.delete(cb);
}

let currentSymbols: string[] = COIN_STATIC_LIST.map(c => c.okxInstId);

function subscribe(wsInstance: WebSocket, symbols?: string[]) {
  if (symbols) {
    currentSymbols = symbols;
  }
  const args = currentSymbols.map(s => `tickers.${s}`);
  wsInstance.send(JSON.stringify({
    op: 'subscribe',
    args,
  }));
}

function unsubscribe(wsInstance: WebSocket, symbols: string[]) {
  const args = symbols.map(s => `tickers.${s}`);
  wsInstance.send(JSON.stringify({
    op: 'unsubscribe',
    args,
  }));
}

export function updateMarketSubscriptions(newSymbols: string[]) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    currentSymbols = newSymbols;
    return;
  }

  // Unsubscribe old, subscribe new
  unsubscribe(ws, currentSymbols);
  currentSymbols = newSymbols;
  subscribe(ws);
}

function connect() {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;

  manualClose = false;
  const instance = new WebSocket(OKX_WS_URL);
  ws = instance;

  instance.onopen = () => {
    console.log('[MarketWS] Connected');
    subscribe(instance);
  };

  instance.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.data) {
        for (const ticker of msg.data) {
          const instId: string = ticker.instId;
          const last: string = ticker.last;
          const open24h: string = ticker.open24h;
          const high24h: string = ticker.high24h;
          const low24h: string = ticker.low24h;
          const volCcy24h: string = ticker.volCcy24h;
          tickerCallbacks.forEach(cb => cb(instId, last, open24h, high24h, low24h, volCcy24h));
        }
      }
    } catch (e) {
      console.warn('[MarketWS] Parse error', e);
    }
  };

  instance.onerror = (e) => {
    console.warn('[MarketWS] Error', e);
  };

  instance.onclose = () => {
    console.log('[MarketWS] Closed');
    ws = null;
    if (!manualClose) {
      reconnectTimer = setTimeout(connect, 3000);
    }
  };
}

export function connectMarketWebSocket() {
  connect();
}

export function disconnectMarketWebSocket() {
  manualClose = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
}
