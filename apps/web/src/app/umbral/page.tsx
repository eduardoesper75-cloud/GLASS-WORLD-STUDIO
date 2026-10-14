'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { getMessage } from '@/lib/i18n';

export default function AccessThresholdPage() {
  const { language } = useLanguage();
  const [showAuthNotice, setShowAuthNotice] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowAuthNotice(true);
  }

  return (
    <main className="threshold" lang={language}>
      <div className="landing__stars" aria-hidden="true" />
      <LanguageSelector />

      <section className="threshold__panel" aria-labelledby="threshold-title">
        <p className="landing__eyebrow">{getMessage(language, 'threshold')}</p>
        <h1 id="threshold-title">{getMessage(language, 'welcome')}</h1>
        <p className="threshold__lead">{getMessage(language, 'subtitle')}</p>

        <form className="threshold__form" onSubmit={handleSubmit}>
          <label className="threshold__field">
            <span className="threshold__field-icon" aria-hidden="true">
              ♙
            </span>
            <span className="visually-hidden">{getMessage(language, 'name')}</span>
            <input
              autoComplete="name"
              name="name"
              placeholder={getMessage(language, 'name')}
              required
              type="text"
            />
          </label>

          <label className="threshold__field">
            <span className="threshold__field-icon" aria-hidden="true">
              ✉
            </span>
            <span className="visually-hidden">{getMessage(language, 'email')}</span>
            <input
              autoComplete="email"
              name="email"
              placeholder={getMessage(language, 'email')}
              required
              type="email"
            />
          </label>

          <label className="threshold__field">
            <span className="threshold__field-icon" aria-hidden="true">
              ♙
            </span>
            <span className="visually-hidden">{getMessage(language, 'password')}</span>
            <input
              autoComplete="new-password"
              name="password"
              placeholder={getMessage(language, 'password')}
              required
              type="password"
            />
          </label>

          <button className="threshold__submit" type="submit">
            {getMessage(language, 'submit')}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <p className="threshold__notice" role="status" aria-live="polite">
          {showAuthNotice ? getMessage(language, 'pending') : ''}
        </p>

        <Link className="threshold__back" href="/">
          {getMessage(language, 'back')}
        </Link>
      </section>

      <footer className="threshold__footer" aria-label="Glass World Studio">
        <span>GWS</span>
        <p>{getMessage(language, 'tagline')}</p>
      </footer>
    </main>
  );
}
