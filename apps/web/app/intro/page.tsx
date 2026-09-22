'use client';

import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/button';

export default function IntroPage() {
  const t = useTranslations('intro');
  return (
    <div className="gw-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '62vh', textAlign: 'center' }}>
      <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 40, opacity: 0.8 }}>◇</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', marginTop: 8 }}>{t('title')}</h1>
      <p style={{ opacity: 0.85, maxWidth: 480, marginTop: 12 }}>{t('subtitle')}</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        <ButtonLink href="/umbral" variant="primary">{t('enter')}</ButtonLink>
        <ButtonLink href="/" variant="ghost">{t('skip')}</ButtonLink>
      </div>
    </div>
  );
}