/**
 * OKX Web3 API Client (Browser Compatible)
 * Note: Using this on the client side exposes your API Secret Key.
 * For production web apps, a backend proxy is recommended.
 * For mobile apps (Capacitor), this is often the only way without a separate server.
 */

// Use NEXT_PUBLIC_ prefix to make them available in the browser bundle
const API_KEY = process.env.NEXT_PUBLIC_OKX_API_KEY || '';
const API_SECRET = process.env.NEXT_PUBLIC_OKX_SECRET_KEY || '';
const PASSPHRASE = process.env.NEXT_PUBLIC_OKX_PASSPHRASE || '';

/**
 * Sign a request using HMAC-SHA256 (Web Crypto API)
 */
async function getSign(timestamp: string, method: string, path: string, body = '') {
  const str = timestamp + method + path + body;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(API_SECRET);
  const msgData = encoder.encode(str);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function fetchOkxWalletAssets(address: string, chains = '1,56,137,42161,10,43114,8453') {
  const timestamp = new Date().toISOString();
  const method = 'GET';
  const path = '/api/v5/wallet/asset/all-token-balances-by-address';
  const query = `?address=${address}&chains=${chains}&filter=1`;

  const sign = await getSign(timestamp, method, path + query);

  const res = await fetch(`https://web3.okx.com${path}${query}`, {
    method: 'GET',
    headers: {
      'OK-ACCESS-KEY': API_KEY,
      'OK-ACCESS-SIGN': sign,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': PASSPHRASE,
      'Content-Type': 'application/json'
    }
  });

  const data = await res.json();
  return data;
}
