interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseClass = 'animate-shimmer bg-gradient-to-r from-surface-elevated via-surface-card to-surface-elevated bg-[length:200%_100%]';

  const variantClass = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }[variant];

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={{ width, height }}
    />
  );
}

/** Pre-built skeleton for the decision card */
export function DecisionCardSkeleton() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width="64px" height="64px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="40%" />
          <Skeleton width="60%" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton variant="rectangular" height="48px" />
        <Skeleton variant="rectangular" height="48px" />
        <Skeleton variant="rectangular" height="48px" />
      </div>
      <Skeleton variant="rectangular" height="60px" />
      <Skeleton variant="rectangular" height="40px" />
    </div>
  );
}
