// ============================================================
// CORE DOMAIN TYPES
// ============================================================

/** Raw OHLCV candlestick data point */
export interface OHLCV {
  t: number;  // Unix timestamp
  o: number;  // Open
  h: number;  // High
  l: number;  // Low
  c: number;  // Close
  v: number;  // Volume
}

/** Stock metadata from Yahoo Finance */
export interface StockMeta {
  symbol: string;
  longName: string | null;
  shortName: string | null;
  exchangeName: string;
  currency: string;
  regularMarketPrice: number;
  chartPreviousClose: number;
}

/** Technical analysis result */
export interface TechnicalAnalysis {
  ma5: number;
  ma20: number;
  ma60: number | null;
  macd: number;
  signal: number;
  hist: number;
  rsi: number;
  bb: { hi: number | null; mid: number | null; lo: number | null };
  kd: { k: number; d: number };
  atr: number;
  volRatio: number;
  sigs: TechSignal[];
  score: number;     // -100 to 100
  sig: SignalLevel;
}

export interface TechSignal {
  n: string;         // Name
  t: 'b' | 's';     // Buy or Sell
}

export type SignalLevel = 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell';

/** Value (fundamental) analysis result */
export interface ValueAnalysis {
  pe: number | null;
  fpe: number | null;
  pb: number | null;
  peg: number | null;
  dy: number | null;   // Dividend yield %
  roe: number | null;
  debt: number | null;  // Debt to equity %
  pm: number | null;    // Profit margin %
  rg: number | null;    // Revenue growth %
  tp: number | null;    // Target price
  upside: number | null;
  score: number;        // -100 to 100
  factors: ValueFactor[];
  verdict: string;
}

export interface ValueFactor {
  n: string;
  i: '+' | '-' | '0';  // Positive / Negative / Neutral
}

/** Unified decision (3-dimension scoring) */
export interface UnifiedDecision {
  signal: 'buy' | 'hold' | 'sell';
  totalScore: number;     // 0-100
  fundScore: number;      // 0-100
  techScore: number;      // 0-100
  sentScore: number;      // 0-100
  confidence: number;     // 0-100
  confLabel: string;
  steps: DecisionStep[];
  vetoed: string | null;
  sentFactors: string[];
  topReasons: string[];
}

export interface DecisionStep {
  label: string;
  detail: string;
  value: number | string;
  weight: string;
}

/** Risk control */
export interface RiskControl {
  riskLevel: 'low' | 'medium' | 'high';
  riskLabel: string;
  maxPosition: number;   // Max position size %
  stopLoss: number;      // Stop loss % (negative)
  stopPrice: number;
  riskFactors: string[];
  advice: string;
}

/** Entry/exit recommendation */
export interface EntryExit {
  longEntry: number;
  longStop: number;
  shortEntry: number;
  shortStop: number;
}

/** Complete analysis result for a stock */
export interface StockAnalysis {
  meta: StockMeta;
  ohlcv: OHLCV[];
  ta: TechnicalAnalysis;
  va: ValueAnalysis;
  ud: UnifiedDecision;
  rc: RiskControl;
  ee: EntryExit;
  price: number;
  prevClose: number;
  fundamentalsAvailable: boolean;
  fetchedAt: number;
}

// ============================================================
// DECISION LOG (Track Record)
// ============================================================

export interface DecisionLogEntry {
  id: string;
  ticker: string;
  name: string;
  signal: 'buy' | 'hold' | 'sell';
  totalScore: number;
  price: number;
  date: string;           // ISO date
  topReasons: string[];
  // Tracked performance (filled later)
  price7d: number | null;
  price30d: number | null;
  price90d: number | null;
  return7d: number | null;
  return30d: number | null;
  return90d: number | null;
}

// ============================================================
// WATCHLIST
// ============================================================

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  signal: 'buy' | 'hold' | 'sell';
  score: number;
  addedAt: number;
}

// ============================================================
// UI STATE
// ============================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

export type Timeframe = '1d' | '5d' | '1mo';

export type ErrorType = 'rate-limit' | 'not-found' | 'network' | 'parse' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  retry?: boolean;
}
