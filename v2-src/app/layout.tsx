import type { Metadata } from 'next';
import Link from 'next/link';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Stock | 決策引擎',
  description: '個股分析決策引擎 — 3維度評分 + 風險控制',
};

const NAV_ITEMS = [
  { href: '/', label: '分析', icon: '📊' },
  { href: '/methodology', label: '方法論', icon: '📐' },
  { href: '/disclaimer', label: '風險聲明', icon: '⚠️' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        {/* ── Top Nav ── */}
        <header className="sticky top-0 z-50 bg-surface-bg/80 backdrop-blur-md border-b border-surface-border">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-content-primary font-bold text-base">
              <span className="text-accent">&#x25C6;</span>
              Smart Stock
              <span className="text-xs text-content-muted font-normal ml-1">v2</span>
            </Link>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 text-sm text-content-secondary hover:text-content-primary hover:bg-surface-elevated rounded-md transition-colors"
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* ── Main Content (with Error Boundary) ── */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
          <Providers>{children}</Providers>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-surface-border py-4 text-center text-xs text-content-muted">
          <p>
            本工具僅供學習與研究，不構成投資建議。投資有風險，入市需謹慎。
          </p>
          <p className="mt-1">
            資料來源：Yahoo Finance &middot; 模型版本 v2.0.0
          </p>
        </footer>
      </body>
    </html>
  );
}
