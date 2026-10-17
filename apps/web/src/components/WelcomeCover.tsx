'use client';

import Link from 'next/link';

import { ConvocatoriaFlyer } from '@/components/ConvocatoriaFlyer';
import { useLanguage } from '@/components/LanguageProvider';
import { getMessage } from '@/lib/i18n';

export function WelcomeCover() {
  const { language } = useLanguage();

  return (
    <main className="landing" lang={language}>
      <section className="landing__scene" aria-labelledby="landing-title">
        <img
          alt=""
          aria-hidden="true"
          className="landing__artwork"
          fetchPriority="high"
          height="1024"
          src="/arte-del-vidrio-en-el-cosmos.png"
          width="1536"
        />

        <div className="landing__identity">
          <h1 id="landing-title">Glass World Studio</h1>
          <p className="landing__plaque">{getMessage(language, 'tagline')}</p>
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

      <ConvocatoriaFlyer variant="landing" />
    </main>
  );
}
