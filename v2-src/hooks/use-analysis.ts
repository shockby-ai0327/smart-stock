/**
 * useAnalysis — orchestrates stock analysis flow
 *
 * Fixes applied:
 * - Uses getState() for actions (no store in deps / no re-renders)
 * - Request counter to prevent race conditions (stale result overwrite)
 * - Stable analyze() ref via useCallback with zero deps
 * - Auto-refresh uses refs to avoid effect re-trigger loops
 * - Lightweight refresh via fetchQuickPrice instead of full re-analysis
 */

'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { fetchChart, fetchFundamentals, fetchQuickPrice, classifyError } from '@/lib/api/yahoo-finance';
import { technicalAnalysis } from '@/lib/engine/technical';
import { valueAnalysis } from '@/lib/engine/fundamental';
import { unifiedDecision, riskControl } from '@/lib/engine/decision';
import { calcEntryExit } from '@/lib/engine/entry-exit';
import { REFRESH_INTERVAL } from '@/config/constants';
import type { StockAnalysis } from '@/types';

// Monotonically increasing request ID to discard stale results
let globalRequestId = 0;

export function useStockAnalysis() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickerRef = useRef('');

  // Stable analyze function — never changes reference
  const analyze = useCallback(async (ticker: string) => {
    const normalized = ticker.trim().toUpperCase();
    if (!normalized) return;

    const requestId = ++globalRequestId;
    const { setTicker, setLoading, setError, setResult } = useAppStore.getState();

    tickerRef.current = normalized;
    setTicker(normalized);
    setLoading('loading');

    try {
      // Parallel: chart + fundamentals
      const [chartData, fundamentals] = await Promise.all([
        fetchChart(normalized),
        fetchFundamentals(normalized),
      ]);

      // Race condition guard: discard if user searched something else
      if (requestId !== globalRequestId) return;

      const { meta, ohlcv } = chartData;
      const price = meta.regularMarketPrice;
      const closes = ohlcv.map((d) => d.c);
      const highs = ohlcv.map((d) => d.h);
      const lows = ohlcv.map((d) => d.l);
      const volumes = ohlcv.map((d) => d.v);

      // Technical analysis
      const ta = technicalAnalysis(closes, highs, lows, volumes, price);

      // Value analysis
      const va = valueAnalysis(meta, fundamentals, price);

      // VIX & stock change %
      const prevClose = meta.chartPreviousClose || price;
      const stockChgPct = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;

      // Unified decision
      const ud = unifiedDecision(ta, va, null, stockChgPct);

      // Risk control
      const rc = riskControl(ta, va, ud, price);

      // Entry/Exit
      const ee = calcEntryExit(ta, price);

      const result: StockAnalysis = {
        meta,
        ohlcv,
        ta,
        va,
        ud,
        rc,
        ee,
        price,
        prevClose,
        fundamentalsAvailable: fundamentals !== null,
        fetchedAt: Date.now(),
      };

      // Final race check before committing
      if (requestId !== globalRequestId) return;
      setResult(result);
    } catch (e) {
      if (requestId !== globalRequestId) return;
      setError(classifyError(e));
    }
  }, []); // Zero deps — uses getState() internally

  // Auto-refresh: lightweight price update every 3 minutes
  useEffect(() => {
    const startRefresh = () => {
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(async () => {
        const ticker = tickerRef.current;
        if (!ticker) return;

        // Use lightweight price fetch instead of full re-analysis
        const quick = await fetchQuickPrice(ticker);
        if (!quick) return;

        const { result, setResult } = useAppStore.getState();
        if (!result || result.meta.symbol !== quick.symbol) return;

        // Update price in existing result
        setResult({
          ...result,
          price: quick.price,
          prevClose: quick.prevClose,
          fetchedAt: Date.now(),
        });
      }, REFRESH_INTERVAL);
    };

    // Subscribe to ticker changes to restart timer
    const unsub = useAppStore.subscribe(
      (state) => state.ticker,
      (ticker) => {
        if (ticker) startRefresh();
        else if (timerRef.current) clearInterval(timerRef.current);
      },
    );

    return () => {
      unsub();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { analyze };
}
