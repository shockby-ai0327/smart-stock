/**
 * Entry / Exit Price Calculator
 *
 * Long-term: based on MA60 / value zone
 * Short-term: based on ATR pullback
 */

import type { TechnicalAnalysis, EntryExit } from '@/types';

export function calcEntryExit(ta: TechnicalAnalysis, price: number): EntryExit {
  // Long-term entry: MA60 or -5% from current price
  const longEntry = ta.ma60 ? Math.min(ta.ma60, price * 0.95) : price * 0.95;

  // Long-term stop-loss: -20% from entry
  const longStop = longEntry * 0.80;

  // Short-term entry: ATR-based pullback (1 ATR below current)
  const atr = ta.atr || price * 0.02;
  const shortEntry = price - atr;

  // Short-term stop-loss: 1.5 ATR below entry
  const shortStop = shortEntry - atr * 1.5;

  return {
    longEntry: round2(longEntry),
    longStop: round2(longStop),
    shortEntry: round2(shortEntry),
    shortStop: round2(shortStop),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
