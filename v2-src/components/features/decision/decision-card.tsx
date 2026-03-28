'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ScoreRing } from './score-ring';
import { RiskPanel } from './risk-panel';
import { fmtPrice, fmtPct, signalLabel } from '@/lib/utils/format';
import { SIGNAL_CONFIG } from '@/config/constants';
import type { StockAnalysis } from '@/types';

interface DecisionCardProps {
  data: StockAnalysis;
}

export const DecisionCard = memo(function DecisionCard({ data }: DecisionCardProps) {
  const { meta, ud, rc, ee, price, prevClose, fundamentalsAvailable } = data;
  const changePct = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0;
  const sigConf = SIGNAL_CONFIG[ud.signal];

  return (
    <Card padding="none" className="overflow-hidden">
      {/* ── Fundamentals Warning ── */}
      {!fundamentalsAvailable && (
        <div className="px-6 py-2 bg-neutral/10 border-b border-neutral/20 flex items-center gap-2">
          <span className="text-xs">⚠️</span>
          <span className="text-xs text-neutral">
            基本面數據不可用，評分僅基於技術面與情緒面，準確性較低
          </span>
        </div>
      )}

      {/* ── Signal Header ── */}
      <div className={`px-6 pt-5 pb-4 border-b border-surface-border ${sigConf.bgClass}`}>
        <div className="flex items-center gap-4">
          {/* Score Ring */}
          <ScoreRing score={ud.totalScore} size={72} label="/100" />

          {/* Signal + Stock Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={sigConf.color}>{signalLabel(ud.signal)}</Badge>
              <span className="text-xs text-content-muted">
                信心 {ud.confidence}%（{ud.confLabel}）
              </span>
            </div>
            <h2 className="text-lg font-bold text-content-primary truncate">
              {meta.symbol}
              {meta.shortName && (
                <span className="text-sm font-normal text-content-secondary ml-2">{meta.shortName}</span>
              )}
            </h2>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-mono font-bold text-content-primary">
                {fmtPrice(price, meta.currency)}
              </span>
              <span className={`text-sm font-mono ${changePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                {fmtPct(changePct)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-Dimension Scores ── */}
      <div className="px-6 py-3 grid grid-cols-3 gap-4 border-b border-surface-border">
        <ProgressBar value={ud.fundScore} label="基本面" color="auto" />
        <ProgressBar value={ud.techScore} label="技術面" color="auto" />
        <ProgressBar value={ud.sentScore} label="市場情緒" color="auto" />
      </div>

      {/* ── Top 3 Reasons ── */}
      <div className="px-6 py-3 border-b border-surface-border">
        <div className="text-xs font-medium text-content-muted mb-1.5">關鍵原因</div>
        <ul className="space-y-1">
          {ud.topReasons.map((reason, i) => (
            <li key={i} className="text-sm text-content-secondary flex items-start gap-1.5">
              <span className="text-content-muted mt-0.5 shrink-0">{i + 1}.</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
        {ud.vetoed && (
          <div className="mt-2 text-xs text-neutral bg-neutral/10 rounded px-2 py-1">
            護欄：{ud.vetoed}
          </div>
        )}
      </div>

      {/* ── Risk Control ── */}
      <div className="px-6 py-3 border-b border-surface-border">
        <RiskPanel rc={rc} currency={meta.currency} />
      </div>

      {/* ── Entry/Exit Quick View ── */}
      <div className="px-6 py-3 grid grid-cols-2 gap-4" role="group" aria-label="進出場建議">
        <div className="space-y-1">
          <div className="text-xs text-content-muted">長線進場</div>
          <div className="text-sm font-mono text-content-primary">{fmtPrice(ee.longEntry, meta.currency)}</div>
          <div className="text-xs text-content-muted">
            停損 {fmtPrice(ee.longStop, meta.currency)}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-content-muted">短線進場</div>
          <div className="text-sm font-mono text-content-primary">{fmtPrice(ee.shortEntry, meta.currency)}</div>
          <div className="text-xs text-content-muted">
            停損 {fmtPrice(ee.shortStop, meta.currency)}
          </div>
        </div>
      </div>

      {/* ── Collapsible Details ── */}
      <details className="border-t border-surface-border">
        <summary className="px-6 py-3 text-sm text-accent cursor-pointer hover:bg-surface-elevated/50 transition-colors select-none">
          展開完整分析
        </summary>
        <div className="px-6 pb-4 space-y-3">
          {/* Decision Steps */}
          <div className="text-xs font-medium text-content-muted mb-1">決策步驟</div>
          {ud.steps.map((step, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-content-muted">{step.label}</span>
                {step.weight && <span className="text-xs text-content-muted/60">({step.weight})</span>}
              </div>
              <span className="font-mono text-content-primary">
                {step.value}
              </span>
            </div>
          ))}

          {/* Sentiment factors */}
          {ud.sentFactors.length > 0 && (
            <div>
              <div className="text-xs font-medium text-content-muted mb-1">情緒因子</div>
              <div className="flex flex-wrap gap-1">
                {ud.sentFactors.map((f, i) => (
                  <Badge key={i} variant="muted">{f}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </details>
    </Card>
  );
});
