interface ProgressBarProps {
  value: number;       // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  color?: 'auto' | 'positive' | 'negative' | 'neutral' | 'accent';
  className?: string;
}

// Thresholds match THRESHOLDS.BUY (65) and THRESHOLDS.SELL (35)
function autoColor(value: number): string {
  if (value >= 65) return 'bg-positive';
  if (value >= 35) return 'bg-neutral';
  return 'bg-negative';
}

const colorMap: Record<string, string> = {
  positive: 'bg-positive',
  negative: 'bg-negative',
  neutral: 'bg-neutral',
  accent: 'bg-accent',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'sm',
  color = 'auto',
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color === 'auto' ? autoColor(value) : colorMap[color];
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-content-muted">{label}</span>}
          {showValue && <span className="text-xs font-mono text-content-secondary">{Math.round(value)}</span>}
        </div>
      )}
      <div className={`w-full ${h} bg-surface-elevated rounded-full overflow-hidden`}>
        <div
          className={`${h} ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
