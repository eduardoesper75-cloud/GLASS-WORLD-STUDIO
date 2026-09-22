'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { GALAXIES } from '@/lib/galaxies';
import { Button, ButtonLink } from '@/components/ui/button';
import { Reveal } from '@/components/ui/misc';

const GALAXY_KEY = 'gws.galaxy';

export default function UmbralPage() {
  const t = useTranslations('umbral');
  const [galaxy, setGalaxy] = useState<string>(
    () => (typeof window !== 'undefined' ? window.localStorage.getItem(GALAXY_KEY) ?? 'g2' : 'g2'),
  );

  const registerHref = useMemo(() => `/register?galaxy=${encodeURIComponent(galaxy)}`, [galaxy]);
  const selected = GALAXIES.find((g) => g.apiId === galaxy);

  function choose(id: string) {
    setGalaxy(id);
    try {
      window.localStorage.setItem(GALAXY_KEY, id);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="gw-page" style={{ padding: '48px 0' }}>
      <Reveal>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>{t('title')}</h1>
        <p style={{ maxWidth: 620, opacity: 0.85, marginTop: 12 }}>{t('lead')}</p>
      </Reveal>

      <fieldset className="gw-field" style={{ marginTop: 32 }}>
        <legend className="gw-field__label">Galaxia</legend>
        <div className="gw-grid" style={{ marginTop: 12 }}>
          {GALAXIES.map((g) => (
            <button
              key={g.apiId}
              type="button"
              onClick={() => choose(g.apiId)}
              aria-pressed={galaxy === g.apiId}
              className="gw-tab"
              style={{ textAlign: 'left', height: '100%' }}
            >
              <span aria-hidden="true">{g.icon}</span> {g.id} · {g.slug}
              <span style={{ display: 'block', opacity: 0.7, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{g.color}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="gw-card gw-card--glass glass-edge" style={{ marginTop: 32, maxWidth: 520 }}>
        <div className="gw-card__body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span aria-hidden="true" style={{ color: selected?.glow }}>{selected?.icon}</span>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
              {selected?.id} · {selected?.slug}
            </strong>
          </div>
          <p style={{ opacity: 0.8, fontSize: 13, marginTop: 10 }}>{t('notice')}</p>
        </div>
        <div className="gw-card__footer" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <ButtonLink href={registerHref} variant="primary">{t('ctaRegister')}</ButtonLink>
          <ButtonLink href="/login" variant="ghost">{t('ctaLogin')}</ButtonLink>
        </div>
      </div>
    </div>
  );
}