'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { dashboardLabels } from '@/lib/dashboard';
import { getMessage } from '@/lib/i18n';

export default function AccessThresholdPage() {
  const { language } = useLanguage();
  const [showAuthNotice, setShowAuthNotice] = useState(false);

  function renderFieldIcon(kind: 'person' | 'email' | 'password') {
    if (kind === 'person') {
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="7.5" r="3.25" />
          <path d="M5.5 20v-1.8a6.5 6.5 0 0 1 13 0V20z" />
        </svg>
      );
    }

    if (kind === 'email') {
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
      </svg>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowAuthNotice(true);
  }

  return (
    <main className="threshold" lang={language}>
      <div className="landing__stars" aria-hidden="true" />
      <div className="threshold__glass" aria-hidden="true" />
      <div className="threshold__rock" aria-hidden="true" />
      <LanguageSelector />

      <section className="threshold__panel" aria-labelledby="threshold-title">
        <p className="landing__eyebrow">{getMessage(language, 'threshold')}</p>
        <h1 id="threshold-title">{getMessage(language, 'welcome')}</h1>
        <p className="threshold__lead">{getMessage(language, 'subtitle')}</p>

        <form className="threshold__form" onSubmit={handleSubmit}>
          <label className="threshold__field">
            <span className="threshold__field-icon">{renderFieldIcon('person')}</span>
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
            <span className="threshold__field-icon">{renderFieldIcon('email')}</span>
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
            <span className="threshold__field-icon">{renderFieldIcon('password')}</span>
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
        <Link className="threshold__back" href="/novedades">
          {getMessage(language, 'news')}
        </Link>
        <Link className="threshold__explore-preview" href="/inicio">
          {dashboardLabels.explore[language]}
        </Link>
      </section>

      <footer className="threshold__footer" aria-label="Glass World Studio">
        <span>GWS</span>
        <p>{getMessage(language, 'tagline')}</p>
      </footer>
    </main>
  );
}
