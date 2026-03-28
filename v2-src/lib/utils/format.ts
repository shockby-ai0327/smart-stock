/**
 * Formatting utilities
 */

/** Format number with commas: 1234567 → "1,234,567" */
export function fmtNum(n: number | null | undefined, decimals = 0): string {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format price with appropriate decimals and currency symbol */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', TWD: 'NT$', EUR: '\u20AC', GBP: '\u00A3',
  JPY: '\u00A5', HKD: 'HK$', CNY: '\u00A5', KRW: '\u20A9',
  CAD: 'C$', AUD: 'A$', SGD: 'S$',
};

export function fmtPrice(n: number | null | undefined, currency = 'USD'): string {
  if (n == null || isNaN(n)) return '\u2014';
  const decimals = currency === 'JPY' || currency === 'KRW' ? 0
    : n >= 1000 ? 0 : n >= 1 ? 2 : 4;
  const prefix = CURRENCY_SYMBOLS[currency] || `${currency} `;
  return `${prefix}${fmtNum(n, decimals)}`;
}

/** Format percentage: 12.345 → "+12.3%" */
export function fmtPct(n: number | null | undefined, decimals = 1): string {
  if (n == null || isNaN(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(decimals)}%`;
}

/** Format large numbers: 1234567 → "1.23M" */
export function fmtCompact(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

/**
 * Format date from Unix timestamp (seconds).
 * OHLCV timestamps are Unix seconds. For millisecond timestamps (Date.now()),
 * use fmtTimeAgo() instead or divide by 1000 first.
 */
export function fmtDate(tsSeconds: number): string {
  return new Date(tsSeconds * 1000).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
  });
}

/** Format time ago: "3 分鐘前" */
export function fmtTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return '剛剛';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分鐘前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小時前`;
  return `${Math.floor(diff / 86_400_000)} 天前`;
}

/** Signal label */
export function signalLabel(signal: 'buy' | 'hold' | 'sell'): string {
  return signal === 'buy' ? '買入' : signal === 'sell' ? '賣出' : '觀望';
}

/** Signal color class */
export function signalColor(signal: 'buy' | 'hold' | 'sell'): string {
  return signal === 'buy' ? 'text-positive' : signal === 'sell' ? 'text-negative' : 'text-neutral';
}
