'use client';

import Link from 'next/link';
import type { Galaxy } from '@/lib/galaxies';

export function GalaxyCard({ g }: { g: Galaxy }) {
  return (
    <article
      className="gw-card gw-card--glass gw-card--icon"
      data-galaxy={g.apiId}
      style={{ '--galaxy-hue': `${g.hue}`, height: '100%' } as React.CSSProperties}
    >
      <div className="gw-card__body">
        <div className="gw-card__icon" style={{ background: `rgba(${g.hue} 1.2)` }} aria-hidden="true">
          {g.icon}
        </div>
        <h3 className="gw-card__title" style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>
          {g.id} · {g.slug}
        </h3>
        <div className="gw-card__meta" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="gw-badge gw-badge--galaxy">{g.icon}</span>
          <span style={{ opacity: 0.8, fontSize: 13 }}>GLASS WORLD STUDIO</span>
        </div>
        <p style={{ opacity: 0.85, fontSize: 14, margin: '12px 0 0' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{g.icon}</span>{' '}
          <span style={{ color: g.glow }}>{g.color}</span>
        </p>
      </div>
      <div className="gw-card__footer">
        <Link href={`/galaxies/${g.slug}`} className="gw-btn gw-btn--ghost" style={{ width: '100%' }}>
          {g.icon} {g.slug}
        </Link>
      </div>
    </article>
  );
}