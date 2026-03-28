import type { ReactNode } from 'react';

type BadgeVariant = 'positive' | 'negative' | 'neutral' | 'accent' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  positive: 'bg-positive/10 text-positive border-positive/20',
  negative: 'bg-negative/10 text-negative border-negative/20',
  neutral: 'bg-neutral/10 text-neutral border-neutral/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
  muted: 'bg-surface-elevated text-content-muted border-surface-border',
};

export function Badge({ variant = 'muted', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border
        ${variantStyles[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}
