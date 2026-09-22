'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Avatar con iniciales (señal de la identidad, sin foto). */
export function Avatar({ name, className, size = 40 }: { name?: string; className?: string; size?: number }) {
  const initial = (name ?? '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      className={cn('gw-avatar', className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      title={name}
      aria-label={name}
    >
      {initial}
    </span>
  );
}

/** Veta de luz: favicon/glifo de la marca (placeholder agnóstico). */
export function Icon({ glyph, title, size = 18, className }: { glyph: string; title?: string; size?: number; className?: string }) {
  return (
    <span role={title ? 'img' : undefined} aria-label={title} className={cn('inline-flex', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="22" rx="6" stroke="currentColor" strokeOpacity="0.55" />
        <path d="M4 15.5 9.5 7l3.6 5.2L16 8.4l4 5.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        {glyph && <text x="12" y="15.5" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="var(--font-mono)" style={{ opacity: 0.9 }}>{glyph}</text>}
      </svg>
    </span>
  );
}

export function Tabs({ tabs, active, onChange, className }: { tabs: { value: string; label: ReactNode }[]; active: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={cn('gw-tabs', className)} role="tablist">
      {tabs.map((t) => (
        <button key={t.value} type="button" role="tab" aria-selected={active === t.value} className={cn('gw-tab', active === t.value && 'gw-tab--active')} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Reveal por Intersección (desplegado con retardo progresivo). */
export function Reveal({ children, delay = 0, className, as = 'div' }: { children: ReactNode; delay?: 0 | 1 | 2; className?: string; as?: 'div' | 'li' | 'section' }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag ref={ref as never} className={cn('gw-reveal', visible && 'in-view', delay === 1 && 'gw-reveal--d1', delay === 2 && 'gw-reveal--d2', className)}>
      {children}
    </Tag>
  );
}

/** Diálogo de confirmación con dos salidas explícitas (caja de cristal). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onCancel} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2,4,14,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 24 }}>
      <div className="glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, width: '100%' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)' }}>{title}</h3>
        <div style={{ opacity: 0.85, fontSize: 14 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" className="gw-btn gw-btn--ghost" onClick={onCancel}>Cancelar</button>
          <button type="button" className={danger ? 'gw-btn gw-btn--danger' : 'gw-btn gw-btn--primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}