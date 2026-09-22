'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="gw-footer" style={{ padding: '24px 0 32px', textAlign: 'center', opacity: 0.7, fontSize: 13 }}>
      <span style={{ fontFamily: 'var(--font-mono)' }}>◇</span>{' '}
      Glass World Studio · {new Date().getFullYear()} · {t('rights')}
    </footer>
  );
}