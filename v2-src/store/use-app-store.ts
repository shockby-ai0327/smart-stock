/**
 * Global App Store (Zustand)
 *
 * Rules:
 * - Selectors return primitives or use useShallow for objects
 * - Actions accessed via getState() in hooks (never in dependency arrays)
 * - Only watchlist persisted to localStorage
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type {
  StockAnalysis, WatchlistItem, LoadingState, AppError,
} from '@/types';

// ── Store type ──

interface AppState {
  // Analysis
  ticker: string;
  loading: LoadingState;
  error: AppError | null;
  result: StockAnalysis | null;
  lastUpdated: number | null;

  // Watchlist
  items: WatchlistItem[];

  // UI
  sidebarOpen: boolean;
}

interface AppActions {
  setTicker: (t: string) => void;
  setLoading: (s: LoadingState) => void;
  setError: (e: AppError | null) => void;
  setResult: (r: StockAnalysis) => void;
  reset: () => void;

  addItem: (item: WatchlistItem) => void;
  removeItem: (symbol: string) => void;
  updatePrice: (symbol: string, price: number, change: number) => void;

  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
}

export type AppStore = AppState & AppActions;

// ── Store ──

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
  persist(
    (set) => ({
      // ── State defaults ──
      ticker: '',
      loading: 'idle',
      error: null,
      result: null,
      lastUpdated: null,
      items: [],
      sidebarOpen: false,

      // ── Analysis actions ──
      setTicker: (ticker) => set({ ticker, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: 'idle' }),
      setResult: (result) =>
        set({ result, loading: 'idle', error: null, lastUpdated: Date.now() }),
      reset: () =>
        set({ ticker: '', loading: 'idle', error: null, result: null, lastUpdated: null }),

      // ── Watchlist actions ──
      addItem: (item) =>
        set((s) => ({
          items: s.items.some((i) => i.symbol === item.symbol)
            ? s.items
            : [...s.items, item],
        })),
      removeItem: (symbol) =>
        set((s) => ({ items: s.items.filter((i) => i.symbol !== symbol) })),
      updatePrice: (symbol, price, change) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.symbol === symbol ? { ...i, price, change } : i
          ),
        })),

      // ── UI actions ──
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'smart-stock-v2',
      partialize: (state) => ({ items: state.items }),
    }
  ))
);

// ── Atomic selectors (stable references, no new objects) ──

export const useTicker = () => useAppStore((s) => s.ticker);
export const useLoading = () => useAppStore((s) => s.loading);
export const useError = () => useAppStore((s) => s.error);
export const useResult = () => useAppStore((s) => s.result);
export const useLastUpdated = () => useAppStore((s) => s.lastUpdated);
export const useWatchlistItems = () => useAppStore((s) => s.items);
