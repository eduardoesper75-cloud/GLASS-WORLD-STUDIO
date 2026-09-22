'use client';

import { useTranslations } from 'next-intl';
import { GALAXIES, SATELLITES } from '@/lib/galaxies';
import { GalaxyCard } from '@/components/galaxy/galaxy-card';
import { ButtonLink } from '@/components/ui/button';
import { Reveal } from '@/components/ui/misc';
import { Card, CardBody, CardTitle, SectionSub, SectionTitle } from '@/components/ui/surface';

export default function HomePage() {
  const t = useTranslations('home');
  return (
    <div className="gw-page" aria-label="home">
      <section className="gw-hero" style={{ padding: '64px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 6vw, 4.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
          {t('hero')}
        </h1>
        <p style={{ maxWidth: 560, opacity: 0.85, fontSize: 17, marginTop: 16 }}>{t('heroSub')}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
          <ButtonLink href="/umbral" variant="primary">{t('viewGalaxy')}</ButtonLink>
          <ButtonLink href="/plans" variant="ghost">{useTranslations('plans')('title')}</ButtonLink>
        </div>
      </section>

      <section>
        <Reveal>
          <SectionTitle>{t('galaxiesTitle')}</SectionTitle>
          <SectionSub>{t('galaxiesSub')}</SectionSub>
        </Reveal>
        <div className="gw-grid" style={{ marginTop: 20 }}>
          {GALAXIES.map((g, i) => (
            <Reveal key={g.id} delay={(i % 3) as 0 | 1 | 2}>
              <GalaxyCard g={g} />
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 64 }}>
        <Reveal>
          <SectionTitle>{t('satellitesTitle')}</SectionTitle>
          <SectionSub>{t('satellitesSub')}</SectionSub>
        </Reveal>
        <div className="gw-grid" style={{ marginTop: 20 }}>
          {SATELLITES.map((s) => (
            <Reveal key={s.slug}>
              <Card tone="glass" className="glass-edge">
                <CardBody>
                  <CardTitle>
                    <span aria-hidden="true">{s.icon}</span> {s.slug}
                  </CardTitle>
                  <div style={{ opacity: 0.7, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{s.color}</div>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <p style={{ textAlign: 'center', margin: '64px 0 24px', letterSpacing: '0.35em', opacity: 0.6, fontSize: 12 }}>
        {t('tagline')}
      </p>
    </div>
  );
}