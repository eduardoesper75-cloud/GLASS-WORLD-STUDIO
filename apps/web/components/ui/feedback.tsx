'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'neutral' | 'galaxy' | 'verified' | 'alert';

const BADGES: Record<BadgeVariant, string> = {
  neutral: 'gw-badge gw-badge--neutral',
  galaxy: 'gw-badge gw-badge--galaxy',
  verified: 'gw-badge gw-badge--verified',
  alert: 'gw-badge gw-badge--alert',
};

export function Badge({ variant = 'neutral', className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span className={cn(BADGES[variant], className)} {...props}>
      {children}
    </span>
  );
}

export type AlertTone = 'info' | 'warn' | 'danger';

const ALERTS: Record<AlertTone, string> = {
  info: 'gw-alert gw-alert--info',
  warn: 'gw-alert gw-alert--warn',
  danger: 'gw-alert gw-alert--danger',
};

export function Alert({ tone = 'info', icon, className, children, ...props }: HTMLAttributes<HTMLDivElement> & { tone?: AlertTone; icon?: ReactNode }) {
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn(ALERTS[tone], className)} {...props}>
      {icon != null && <span className="gw-alert__icon" aria-hidden="true">{icon}</span>}
      <div>{children}</div>
    </div>
  );
}

export function Spinner({ className, label = '…' }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cn('inline-flex', className)}>
      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export interface PaginationProps {
  page: number;
  hasMore: boolean;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, hasMore, onChange, className }: PaginationProps) {
  return (
    <nav className={cn('gw-pagination', className)} aria-label="pagination">
      <button type="button" className="gw-page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹
      </button>
      <span className="gw-page gw-page--current" aria-current="page">
        {page}
      </span>
      <button type="button" className="gw-page" disabled={!hasMore} onClick={() => onChange(page + 1)}>
        ›
      </button>
    </nav>
  );
}

export function Price({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('gw-price', className)}>
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)}
    </span>
  );
}