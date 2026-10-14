'use client';

import Link from 'next/link';

import { useLanguage } from '@/components/LanguageProvider';
import { getMessage } from '@/lib/i18n';

export function WelcomeCover() {
  const { language } = useLanguage();

  return (
    <main className="landing" lang={language}>
      <div className="landing__stars" aria-hidden="true" />

      <header className="landing__masthead">
        <p className="landing__eyebrow">{getMessage(language, 'artwork')}</p>
      </header>

      <section className="landing__scene" aria-labelledby="landing-title">
        <div className="landing__horizon" aria-hidden="true" />
        <div className="glass-orb" aria-hidden="true">
          <span className="glass-orb__core" />
          <span className="glass-orb__ring glass-orb__ring--outer" />
          <span className="glass-orb__ring glass-orb__ring--inner" />
        </div>

        <div className="landing__identity">
          <h1 id="landing-title">Glass World Studio</h1>
          <p className="landing__plaque">
            {getMessage(language, 'tagline')}
          </p>
        </div>

        <Link
          className="landing__continue"
          href="/umbral"
          aria-label={getMessage(language, 'continueLabel')}
        >
          <span className="landing__indicator" aria-hidden="true" />
          <span className="landing__continue-label">{getMessage(language, 'continue')}</span>
        </Link>
      </section>
    </main>
  );
}
