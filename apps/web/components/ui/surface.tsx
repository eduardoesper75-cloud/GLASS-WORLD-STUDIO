'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

export type CardTone = 'flat' | 'glass' | 'icon';

export function Card({ tone = 'flat', className, ...props }: HTMLAttributes<HTMLDivElement> & { tone?: CardTone }) {
  return (
    <div
      className={cn(
        'gw-card',
        tone === 'glass' && 'gw-card--glass',
        tone === 'icon' && 'gw-card--icon glass-edge',
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('gw-card__body', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('gw-card__title', className)} {...props} />;
}

export function CardMeta({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('gw-card__meta', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('gw-card__footer', className)} {...props} />;
}

/** Superficie de cristal suelto (vitral). */
export function Glass({ className, strong = false, edge = false, ...props }: HTMLAttributes<HTMLDivElement> & { strong?: boolean; edge?: boolean }) {
  return (
    <div
      className={cn(strong ? 'glass--strong' : 'glass', edge && 'glass-edge', className)}
      {...props}
    />
  );
}

export function Skeleton({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('gw-skeleton', className)} style={{ minHeight: 14, ...style }} {...props} />;
}

export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('gw-divider', className)} {...props} />;
}

export function SectionTitle({ children, className, as = 'h2' }: { children: ReactNode; className?: string; as?: 'h1' | 'h2' | 'h3' }) {
  const Tag = as;
  return <Tag className={cn('gw-section-title', className)}>{children}</Tag>;
}

export function SectionSub({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('gw-section-sub', className)}>{children}</p>;
}