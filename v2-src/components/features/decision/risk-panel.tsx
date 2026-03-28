'use client';

import { Badge } from '@/components/ui';
import { fmtPrice } from '@/lib/utils/format';
import type { RiskControl } from '@/types';

interface RiskPanelProps {
  rc: RiskControl;
  currency?: string;
}

const riskBadge: Record<RiskControl['riskLevel'], { variant: 'positive' | 'neutral' | 'negative'; icon: string }> = {
  low: { variant: 'positive', icon: '\u{1F7E2}' },
  medium: { variant: 'neutral', icon: '\u{1F7E1}' },
  high: { variant: 'negative', icon: '\u{1F534}' },
};

export function RiskPanel({ rc, currency = 'USD' }: RiskPanelProps) {
  const { variant, icon } = riskBadge[rc.riskLevel];

  return (
    <div className="rounded-lg bg-surface-elevated/50 border border-surface-border p-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-content-muted">風險控制</span>
        <Badge variant={variant}>
          {icon} {rc.riskLabel}
        </Badge>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-content-muted">建議持倉</div>
          <div className="text-sm font-semibold text-content-primary">&le;{rc.maxPosition}%</div>
        </div>
        <div>
          <div className="text-xs text-content-muted">停損幅度</div>
          <div className="text-sm font-semibold text-negative">{rc.stopLoss}%</div>
        </div>
        <div>
          <div className="text-xs text-content-muted">停損價</div>
          <div className="text-sm font-semibold text-content-primary">{fmtPrice(rc.stopPrice, currency)}</div>
        </div>
      </div>

      {/* Risk factors */}
      {rc.riskFactors.length > 0 && (
        <div className="text-xs text-content-muted space-y-0.5">
          {rc.riskFactors.map((f, i) => (
            <div key={i} className="flex items-start gap-1">
              <span className="text-content-muted/60 mt-0.5">&#x2022;</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* Advice */}
      <p className="text-xs text-content-secondary italic">{rc.advice}</p>
    </div>
  );
}
