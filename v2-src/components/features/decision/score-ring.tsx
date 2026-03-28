'use client';

interface ScoreRingProps {
  score: number;      // 0-100
  size?: number;      // px
  strokeWidth?: number;
  label?: string;
  className?: string;
}

// Must match tailwind.config.ts semantic colors exactly
function scoreColor(score: number): string {
  if (score >= 65) return '#10b981'; // positive
  if (score >= 35) return '#f59e0b'; // neutral
  return '#ef4444';                  // negative
}

export function ScoreRing({
  score,
  size = 80,
  strokeWidth = 6,
  label,
  className = '',
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`評分 ${score} 分`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-elevated"
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-content-primary">{score}</span>
        {label && <span className="text-[10px] text-content-muted">{label}</span>}
      </div>
    </div>
  );
}
