'use client';

import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

/**
 * Client-side providers wrapper.
 * - ErrorBoundary: catches render errors, shows retry UI instead of white screen
 * - Future: add theme provider, toast provider, etc. here
 */
export function Providers({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
