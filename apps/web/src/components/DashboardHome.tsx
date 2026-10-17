'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/components/LanguageProvider';
import { dashboardLabels, dashboardModules, type DashboardModule } from '@/lib/dashboard';

export function DashboardHome() {
  const { language } = useLanguage();
  const [selectedModule, setSelectedModule] = useState<DashboardModule | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selectedModule) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleDialogKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedModule(null);
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleDialogKeydown);
    return () => {
      document.removeEventListener('keydown', handleDialogKeydown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [selectedModule]);

  const t = (key: keyof typeof dashboardLabels) => dashboardLabels[key][language];
  const galaxies = dashboardModules.filter((module) => module.category === 'galaxy');
  const satellites = dashboardModules.filter((module) => module.category === 'satellite');

  function renderModule(module: DashboardModule) {
    return (
      <button
        key={module.id}
        className={`universe-card universe-card--${module.accent}`}
        type="button"
        aria-label={`${module.title[language]}: ${t('openModule')}`}
        onClick={(event) => {
          triggerRef.current = event.currentTarget;
          setSelectedModule(module);
        }}
        aria-haspopup="dialog"
      >
        <span className="universe-card__topline">
          <span className="universe-card__arrow" aria-hidden="true">
            ↗
          </span>
        </span>
        <span className="universe-card__title">{module.title[language]}</span>
        <span className="universe-card__description">{module.description[language]}</span>
        <span className="universe-card__badge">{module.title[language]}</span>
      </button>
    );
  }

  return (
    <main className="dashboard" lang={language}>
      <div className="dashboard__stars" aria-hidden="true" />
      <header className="dashboard__header">
        <Link className="dashboard__brand" href="/" aria-label="Glass World Studio, Layer 1">
          <span className="dashboard__brand-mark" aria-hidden="true">
            G
          </span>
          <span>
            <strong>GLASS WORLD STUDIO</strong>
            <small>The glass universe</small>
          </span>
        </Link>
        <div className="dashboard__header-tools">
          <span className="dashboard__preview">{t('preview')}</span>
          <LanguageSelector />
        </div>
      </header>

      <section className="dashboard__hero" aria-labelledby="dashboard-title">
        <h1 id="dashboard-title">{t('title')}</h1>
        <p>{t('intro')}</p>
        <div className="dashboard__connection" role="status">
          <span className="dashboard__connection-dot" aria-hidden="true" />
          {t('dataStatus')}
        </div>
      </section>

      <section className="dashboard__section" aria-labelledby="galaxies-title">
        <header className="dashboard__section-heading">
          <h2 id="galaxies-title">{t('galaxySection')}</h2>
        </header>
        <div className="universe-grid universe-grid--galaxies" data-ui="galaxy-marketplace">
          {galaxies.map(renderModule)}
        </div>
      </section>

      <section className="dashboard__section dashboard__section--satellites" aria-labelledby="satellites-title">
        <header className="dashboard__section-heading">
          <h2 id="satellites-title">{t('satelliteSection')}</h2>
        </header>
        <div className="universe-grid universe-grid--satellites" data-ui="service-marketplace">
          {satellites.map(renderModule)}
        </div>
      </section>

      <footer className="dashboard__footer">
        <p>{t('dataExplanation')}</p>
        <Link href="/umbral">{t('back')}</Link>
      </footer>

      {selectedModule && (
        <div
          className="module-modal"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedModule(null);
            }
          }}
        >
          <section
            className={`module-modal__panel module-modal__panel--${selectedModule.accent}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-modal-title"
          >
            <button
              className="module-modal__close"
              type="button"
              ref={closeButtonRef}
              aria-label={t('close')}
              onClick={() => setSelectedModule(null)}
            >
              ×
            </button>
            <p className="module-modal__eyebrow">
              {selectedModule.category === 'galaxy' ? t('galaxySection') : t('satelliteSection')}
            </p>
            <div className="module-modal__title-row">
              <h2 id="module-modal-title">{selectedModule.title[language]}</h2>
            </div>
            <p className="module-modal__description">{selectedModule.description[language]}</p>
            <h3>{t('functions')}</h3>
            <ul className="module-modal__list">
              {selectedModule.modules.map((item) => (
                <li key={item[language]}>
                  <span aria-hidden="true">↗</span>
                  {item[language]}
                </li>
              ))}
            </ul>
            <div className="module-modal__notice">
              <span className="dashboard__connection-dot" aria-hidden="true" />
              <p>
                <strong>{t('dataStatus')}</strong>
                <br />
                {t('dataExplanation')}
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
