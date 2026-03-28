'use client';

import { SearchBar } from '@/components/features/decision/search-bar';
import { DecisionCard } from '@/components/features/decision/decision-card';
import { DecisionCardSkeleton } from '@/components/ui/skeleton';
import { useStockAnalysis } from '@/hooks/use-analysis';
import { useTicker, useLoading, useError, useResult, useLastUpdated } from '@/store/use-app-store';
import { fmtTimeAgo } from '@/lib/utils/format';

export default function HomePage() {
  const { analyze } = useStockAnalysis();
  const ticker = useTicker();
  const loading = useLoading();
  const error = useError();
  const result = useResult();
  const lastUpdated = useLastUpdated();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-2xl font-bold text-content-primary mb-2">
          10 秒決策引擎
        </h1>
        <p className="text-sm text-content-secondary max-w-md mx-auto">
          輸入股票代號，獲得基本面 + 技術面 + 市場情緒的三維度評分與建議。
          <br />
          台股請加 .TW（例：2330.TW）
        </p>
      </section>

      {/* Search */}
      <section className="max-w-lg mx-auto">
        <SearchBar onSearch={analyze} loading={loading === 'loading'} />
      </section>

      {/* Results */}
      <section className="max-w-2xl mx-auto">
        {/* Loading state */}
        {loading === 'loading' && <DecisionCardSkeleton />}

        {/* Error state */}
        {error && (
          <div className="bg-negative/10 border border-negative/20 rounded-xl p-4 text-center">
            <p className="text-sm text-negative font-medium">{error.message}</p>
            {error.retry && (
              <button
                onClick={() => ticker && analyze(ticker)}
                className="mt-2 text-xs text-accent hover:underline"
              >
                重試
              </button>
            )}
          </div>
        )}

        {/* Decision Card */}
        {result && loading !== 'loading' && (
          <div className="space-y-2">
            <DecisionCard data={result} />
            {lastUpdated && (
              <p className="text-xs text-content-muted text-right">
                更新於 {fmtTimeAgo(lastUpdated)} &middot; 每 3 分鐘自動刷新
              </p>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !error && loading === 'idle' && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-sm text-content-muted">
              搜尋股票代號開始分析
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {['AAPL', 'TSLA', '2330.TW', 'NVDA'].map((t) => (
                <button
                  key={t}
                  onClick={() => analyze(t)}
                  className="px-3 py-1 text-xs bg-surface-elevated border border-surface-border rounded-md text-content-secondary hover:text-content-primary hover:border-accent/30 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
