'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui';

interface SearchBarProps {
  onSearch: (ticker: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function SearchBar({ onSearch, loading = false, placeholder = '輸入股票代號 (e.g. AAPL, 2330.TW)' }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="股票代號"
        autoComplete="off"
        spellCheck={false}
        className="
          flex-1 px-4 py-2.5 rounded-lg text-sm
          bg-surface-elevated border border-surface-border
          text-content-primary placeholder:text-content-muted
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
          transition-colors
        "
        disabled={loading}
      />
      <Button type="submit" loading={loading} disabled={!value.trim()}>
        分析
      </Button>
    </form>
  );
}
