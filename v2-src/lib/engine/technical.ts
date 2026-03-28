/**
 * Technical Analysis Engine
 *
 * Computes: MA, MACD, RSI, KD, Bollinger Bands, ATR, Volume Ratio
 * Generates: Buy/Sell signals with scoring
 */

import type { TechnicalAnalysis, TechSignal, SignalLevel } from '@/types';

// ── Math helpers ──

function sma(arr: number[], period: number): number | null {
  if (arr.length < period) return null;
  const slice = arr.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function emaArr(arr: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let prev: number | null = null;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == null) { result.push(null); continue; }
    if (prev == null) {
      prev = arr[i];
    } else {
      prev = arr[i] * k + prev * (1 - k);
    }
    result.push(prev);
  }
  return result;
}

function rsi(closes: number[], period: number): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = (gains / period) / (losses / period);
  return 100 - 100 / (1 + rs);
}

function bollinger(closes: number[], period: number, mult: number) {
  if (closes.length < period) return { hi: null, mid: null, lo: null };
  const slice = closes.slice(-period);
  const mid = slice.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(slice.reduce((a, b) => a + (b - mid) ** 2, 0) / period);
  return { hi: mid + mult * std, mid, lo: mid - mult * std };
}

function stoch(closes: number[], highs: number[], lows: number[], kPeriod: number, kSmooth: number, dSmooth: number) {
  if (closes.length < kPeriod) return { k: 50, d: 50 };
  const rawK: number[] = [];
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const hi = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
    const lo = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
    rawK.push(hi !== lo ? ((closes[i] - lo) / (hi - lo)) * 100 : 50);
  }
  const smoothK = rawK.length >= kSmooth ? rawK.slice(-kSmooth).reduce((a, b) => a + b, 0) / kSmooth : rawK[rawK.length - 1];
  const dArr = rawK.slice(-dSmooth);
  const d = dArr.length >= dSmooth ? dArr.reduce((a, b) => a + b, 0) / dSmooth : smoothK;
  return { k: smoothK, d };
}

function calcATR(closes: number[], highs: number[], lows: number[], period: number): number {
  if (closes.length < period + 1) return 0;
  let sum = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    sum += tr;
  }
  return sum / period;
}

// ── Main analysis function ──

export function technicalAnalysis(
  closes: number[],
  highs: number[],
  lows: number[],
  volumes: number[],
  price: number
): TechnicalAnalysis {
  const ma5 = sma(closes, 5) ?? price;
  const ma20 = sma(closes, 20) ?? price;
  const ma60 = sma(closes, 60);

  // MACD
  const e12 = emaArr(closes, 12);
  const e26 = emaArr(closes, 26);
  const macdLine: number[] = [];
  for (let i = 0; i < e12.length; i++) {
    if (e12[i] != null && e26[i] != null) macdLine.push(e12[i]! - e26[i]!);
  }
  const sigLine = emaArr(macdLine, 9);
  const hist = macdLine.map((v, i) => sigLine[i] != null ? v - sigLine[i]! : null);
  const macdV = macdLine[macdLine.length - 1] ?? 0;
  const sigV = sigLine[sigLine.length - 1] ?? 0;
  const histV = hist[hist.length - 1] ?? 0;
  const histP = hist[hist.length - 2] ?? null;

  const rsiV = rsi(closes, 14);
  const bb = bollinger(closes, 20, 2);
  const kdV = stoch(closes, highs, lows, 9, 3, 3);
  const atrV = calcATR(closes, highs, lows, 14);
  const avgVol = volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumes.length);
  const volRatio = avgVol > 0 ? volumes[volumes.length - 1] / avgVol : 1;

  // ── Signal scoring ──
  const sigs: TechSignal[] = [];
  let score = 0;

  // MA alignment
  if (ma5 > ma20 && ma60 && ma20 > ma60) { sigs.push({ n: '均線多頭排列', t: 'b' }); score += 15; }
  else if (ma5 < ma20 && ma60 && ma20 < ma60) { sigs.push({ n: '均線空頭排列', t: 's' }); score -= 15; }

  // MA crossovers
  const pma5 = sma(closes.slice(0, -1), 5);
  const pma20 = sma(closes.slice(0, -1), 20);
  if (ma5 > ma20 && pma5 && pma20 && pma5 <= pma20) { sigs.push({ n: 'MA5/MA20 黃金交叉', t: 'b' }); score += 20; }
  if (ma5 < ma20 && pma5 && pma20 && pma5 >= pma20) { sigs.push({ n: 'MA5/MA20 死亡交叉', t: 's' }); score -= 20; }

  // MACD
  if (histV > 0 && histP != null && histP <= 0) { sigs.push({ n: 'MACD 柱狀翻正', t: 'b' }); score += 15; }
  if (histV < 0 && histP != null && histP >= 0) { sigs.push({ n: 'MACD 柱狀翻負', t: 's' }); score -= 15; }
  if (macdV > sigV) score += 5; else score -= 5;

  // RSI
  if (rsiV < 30) { sigs.push({ n: `RSI 超賣 (${rsiV.toFixed(1)})`, t: 'b' }); score += 15; }
  else if (rsiV > 70) { sigs.push({ n: `RSI 超買 (${rsiV.toFixed(1)})`, t: 's' }); score -= 15; }
  else if (rsiV < 40) score += 5;
  else if (rsiV > 60) score -= 5;

  // Bollinger Bands
  if (bb.lo != null && price <= bb.lo) { sigs.push({ n: '觸及布林下軌', t: 'b' }); score += 10; }
  if (bb.hi != null && price >= bb.hi) { sigs.push({ n: '觸及布林上軌', t: 's' }); score -= 10; }

  // KD
  if (kdV.k < 20 && kdV.d < 20) { sigs.push({ n: 'KD 超賣區', t: 'b' }); score += 10; }
  if (kdV.k > 80 && kdV.d > 80) { sigs.push({ n: 'KD 超買區', t: 's' }); score -= 10; }
  if (kdV.k > kdV.d && kdV.k < 30) { sigs.push({ n: 'KD 低檔黃金交叉', t: 'b' }); score += 15; }
  if (kdV.k < kdV.d && kdV.k > 70) { sigs.push({ n: 'KD 高檔死亡交叉', t: 's' }); score -= 15; }

  // Volume
  if (volRatio > 1.5 && price > closes[closes.length - 2]) { sigs.push({ n: '放量上漲', t: 'b' }); score += 10; }
  if (volRatio > 1.5 && price < closes[closes.length - 2]) { sigs.push({ n: '放量下跌', t: 's' }); score -= 10; }

  score = Math.max(-100, Math.min(100, score));
  const sig: SignalLevel = score >= 40 ? 'strong-buy' : score >= 15 ? 'buy' : score <= -40 ? 'strong-sell' : score <= -15 ? 'sell' : 'hold';

  return { ma5, ma20, ma60, macd: macdV, signal: sigV, hist: histV, rsi: rsiV, bb, kd: kdV, atr: atrV, volRatio, sigs, score, sig };
}
