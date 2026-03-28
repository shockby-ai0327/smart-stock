'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="bg-negative/10 border border-negative/20 rounded-xl p-6 text-center my-6">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-sm font-semibold text-negative mb-1">發生錯誤</h3>
          <p className="text-xs text-content-muted mb-3">
            {this.state.error?.message || '未知錯誤'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-1.5 text-xs bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
          >
            重試
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
