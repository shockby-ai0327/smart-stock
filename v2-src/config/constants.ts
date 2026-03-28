// ============================================================
// APPLICATION CONSTANTS
// ============================================================

/** CORS proxy endpoints — ordered by reliability */
export const PROXIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
] as const;

/** Scoring weights */
export const WEIGHTS = {
  FUND: 0.40,
  TECH: 0.30,
  SENT: 0.30,
} as const;

/** Signal thresholds */
export const THRESHOLDS = {
  BUY: 65,
  SELL: 35,
} as const;

/** Risk control thresholds */
export const RISK = {
  ATR_HIGH: 0.04,      // ATR/price > 4%
  ATR_LOW: 0.02,       // ATR/price < 2%
  PE_HIGH: 50,
  PE_RANGE: [5, 25],
  DEBT_HIGH: 150,
  DEBT_LOW: 80,
  VOL_HIGH: 2.5,
  SCORE_LOW: 30,
  SCORE_OK: 55,
  // Position sizing
  LOW_RISK: { maxPosition: 30, stopLoss: -8 },
  MED_RISK: { maxPosition: 20, stopLoss: -10 },
  HIGH_RISK: { maxPosition: 10, stopLoss: -15 },
} as const;

/** Cache TTL in ms */
export const CACHE_TTL = {
  REALTIME: 1_000,
  CHART: 60_000,
  FUNDAMENTALS: 300_000,
} as const;

/** Auto-refresh interval */
export const REFRESH_INTERVAL = 180_000; // 3 minutes

/** Model version (display in UI for trust) */
export const MODEL_VERSION = '2.0.0';
export const MODEL_LAST_UPDATED = '2026-03-28';

/** Timeframe labels */
export const TF_LABELS: Record<string, string> = {
  '1d': '日漲跌',
  '5d': '五日漲跌',
  '1mo': '月漲跌',
};

/** Signal display config */
export const SIGNAL_CONFIG = {
  buy: {
    label: '買入',
    color: 'positive' as const,
    bgClass: 'bg-positive-subtle',
    borderClass: 'border-positive',
    textClass: 'text-positive',
  },
  hold: {
    label: '觀望',
    color: 'neutral' as const,
    bgClass: 'bg-neutral-subtle',
    borderClass: 'border-neutral',
    textClass: 'text-neutral',
  },
  sell: {
    label: '賣出',
    color: 'negative' as const,
    bgClass: 'bg-negative-subtle',
    borderClass: 'border-negative',
    textClass: 'text-negative',
  },
} as const;
