/**
 * Yahoo Finance API service layer
 *
 * Architecture:
 * - All API calls go through CORS proxies (client-side only)
 * - Proxy failover with sticky last-successful index
 * - Separate JSON / Text fetch paths (no .json() on HTML)
 * - LRU-style cache with max-size eviction
 * - Typed error classification for UI handling
 */

import { PROXIES, CACHE_TTL } from '@/config/constants';
import type { StockMeta, OHLCV, AppError } from '@/types';

// ── State ──
let lastProxyIdx = 0;
const MAX_CACHE_SIZE = 50;
const cache = new Map<string, { ts: number; data: unknown }>();

function cacheSet(key: string, data: unknown) {
  // LRU eviction: delete oldest entries when cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { ts: Date.now(), data });
}

function cacheGet<T>(key: string, ttl: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttl) {
    cache.delete(key);
    return null;
  }
  // Move to end for LRU ordering
  cache.delete(key);
  cache.set(key, entry);
  return entry.data as T;
}

// ── Core proxy fetch (returns raw Response — caller decides json/text) ──
async function rawProxyFetch(url: string): Promise<Response> {
  const order = [lastProxyIdx, ...PROXIES.map((_, i) => i).filter(i => i !== lastProxyIdx)];
  let lastErr: Error | null = null;

  for (const pi of order) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch(PROXIES[pi](url));
        if (!r.ok) {
          const text = await r.text();
          if (text.includes('Too Many Requests')) {
            await delay(1500 * (attempt + 1));
            continue;
          }
          throw new Error(`HTTP ${r.status}`);
        }
        lastProxyIdx = pi;
        return r;
      } catch (e) {
        lastErr = e as Error;
        if (attempt === 0) await delay(500);
      }
    }
  }

  throw lastErr || new Error('All CORS proxies failed');
}

/** Fetch JSON with caching */
async function fetchJson<T = unknown>(url: string, cacheTTL?: number): Promise<T> {
  if (cacheTTL) {
    const cached = cacheGet<T>(url, cacheTTL);
    if (cached !== null) return cached;
  }

  const r = await rawProxyFetch(url);
  const data = await r.json() as T;

  if (cacheTTL) cacheSet(url, data);
  return data;
}

/** Fetch HTML text with caching */
async function fetchText(url: string, cacheTTL?: number): Promise<string> {
  const cacheKey = `text:${url}`;
  if (cacheTTL) {
    const cached = cacheGet<string>(cacheKey, cacheTTL);
    if (cached !== null) return cached;
  }

  const r = await rawProxyFetch(url);
  const text = await r.text();

  if (cacheTTL) cacheSet(cacheKey, text);
  return text;
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ── Error classification ──
export function classifyError(e: unknown): AppError {
  const msg = e instanceof Error ? e.message : String(e);

  if (msg.includes('Too Many Requests'))
    return { type: 'rate-limit', message: '查詢太頻繁，請等待 30 秒後重試', retry: true };
  if (msg.includes('No data for') || msg.includes('404'))
    return { type: 'not-found', message: '找不到此股票代號。台股請加 .TW（例：2330.TW）' };
  if (msg.includes('proxy') || msg.includes('Failed to fetch') || msg.includes('NetworkError'))
    return { type: 'network', message: '網路連線問題，請稍後重試', retry: true };
  return { type: 'unknown', message: `系統異常：${msg}`, retry: true };
}

// ── Public API ──

/** Fetch 6-month OHLCV chart data */
export async function fetchChart(
  ticker: string,
  range = '6mo',
  interval = '1d'
): Promise<{ meta: StockMeta; ohlcv: OHLCV[] }> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}&includePrePost=false`;
  const j = await fetchJson<any>(url, CACHE_TTL.CHART);

  if (!j.chart?.result?.[0]) throw new Error(`No data for ${ticker}`);

  const result = j.chart.result[0];
  const q = result.indicators.quote[0];
  const ts: number[] = result.timestamp;

  const ohlcv: OHLCV[] = [];
  for (let i = 0; i < ts.length; i++) {
    if (q.close[i] != null && q.open[i] != null) {
      ohlcv.push({
        t: ts[i],
        o: q.open[i],
        h: q.high[i],
        l: q.low[i],
        c: q.close[i],
        v: q.volume[i] || 0,
      });
    }
  }

  return {
    meta: {
      symbol: result.meta.symbol,
      longName: result.meta.longName || null,
      shortName: result.meta.shortName || null,
      exchangeName: result.meta.exchangeName || '',
      currency: result.meta.currency || 'USD',
      regularMarketPrice: result.meta.regularMarketPrice,
      chartPreviousClose: result.meta.chartPreviousClose,
    },
    ohlcv,
  };
}

/** Fetch fundamentals by page scraping (HTML → parse) */
export async function fetchFundamentals(ticker: string): Promise<Record<string, any> | null> {
  try {
    if (ticker.endsWith('.TW') || ticker.endsWith('.TWO')) {
      return await fetchTWFundamentals(ticker);
    }
    const html = await fetchText(
      `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}`,
      CACHE_TTL.FUNDAMENTALS
    );
    // Try SvelteKit embedded data (current Yahoo Finance structure)
    const regex = /<script type="application\/json" data-sveltekit-fetched data-url="https:\/\/query1\.finance\.yahoo\.com\/v10\/finance\/quoteSummary[^"]*"[^>]*>([\s\S]*?)<\/script>/;
    const match = html.match(regex);
    if (!match) return null;
    const data = JSON.parse(match[1]);
    const body = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
    return body.quoteSummary.result[0];
  } catch {
    return null;
  }
}

async function fetchTWFundamentals(ticker: string): Promise<Record<string, any> | null> {
  try {
    const html = await fetchText(
      `https://tw.stock.yahoo.com/quote/${encodeURIComponent(ticker)}`,
      CACHE_TTL.FUNDAMENTALS
    );
    // Try multiple patterns (Yahoo TW changes structure frequently)
    let stores: any = null;

    // Pattern 1: root.App.main (legacy)
    const appMainMatch = html.match(/root\.App\.main\s*=\s*(\{[\s\S]*?\});\s*\n/);
    if (appMainMatch) {
      const fixed = appMainMatch[1].replace(/undefined/g, 'null');
      const data = JSON.parse(fixed);
      stores = data.context?.dispatcher?.stores;
    }

    // Pattern 2: __NEXT_DATA__ (newer)
    if (!stores) {
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nextDataMatch) {
        const data = JSON.parse(nextDataMatch[1]);
        stores = data.props?.pageProps?.stores || data.props?.pageProps;
      }
    }

    if (!stores) return null;
    const qf = stores.QuoteFundamental || stores;
    if (!qf) return null;

    const fd = qf.fundamental?.data || {};
    const quoteData = qf.quote?.data || {};
    const price = parseFloat(quoteData.price?.raw) || 0;
    const pa = fd.profitAbility || {};
    const incY = fd.incomesY || [];

    const pe = fd.per ? parseFloat(fd.per) : null;
    const incQ = fd.incomesQ || [];
    const bps = incQ[0]?.bps ? parseFloat(incQ[0].bps) : null;
    const pb = bps && bps > 0 ? price / bps : null;
    const dy = fd.avgYTM ? parseFloat(fd.avgYTM) / 100 : null;
    const roe = pa.roe ? parseFloat(pa.roe) / 100 : null;
    const pm = pa.operatingMargin ? parseFloat(pa.operatingMargin) / 100 : null;

    let rg = null;
    if (incY.length >= 2 && incY[1]?.eps) {
      const epsNow = parseFloat(incY[0].eps);
      const epsPrev = parseFloat(incY[1].eps);
      if (epsPrev > 0) rg = (epsNow - epsPrev) / epsPrev;
    }

    const w = (v: number | null) => (v != null && !isNaN(v) ? { raw: v } : undefined);
    return {
      summaryDetail: { trailingPE: w(pe), priceToBook: w(pb), dividendYield: w(dy) },
      defaultKeyStatistics: { pegRatio: undefined },
      financialData: {
        returnOnEquity: w(roe),
        debtToEquity: undefined,
        profitMargins: w(pm),
        revenueGrowth: w(rg),
        targetMeanPrice: undefined,
      },
    };
  } catch {
    return null;
  }
}

/** Quick price fetch (no cache, lightweight) */
export async function fetchQuickPrice(ticker: string): Promise<{
  symbol: string;
  price: number;
  prevClose: number;
} | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=5m&range=1d&includePrePost=false&_t=${Date.now()}`;
    const j = await fetchJson<any>(url);
    if (!j.chart?.result?.[0]) return null;
    const m = j.chart.result[0].meta;
    return { symbol: m.symbol, price: m.regularMarketPrice, prevClose: m.chartPreviousClose };
  } catch {
    return null;
  }
}
