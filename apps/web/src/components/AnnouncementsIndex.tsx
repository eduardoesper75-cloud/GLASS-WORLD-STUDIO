'use client';

import Link from 'next/link';

import { useLanguage } from '@/components/LanguageProvider';
import { getMessage } from '@/lib/i18n';
import type { Announcement } from '@/lib/announcements';

export function AnnouncementsIndex({ announcements }: { announcements: Announcement[] }) {
  const { language } = useLanguage();

  return (
    <main className="announcement">
      <article className="announcement__hero">
        <header className="announcement__header">
          <p className="announcement__eyebrow">{getMessage(language, 'newsEyebrow')}</p>
          <h1 className="announcement__title">{getMessage(language, 'news')}</h1>
          <p className="announcement__effective">{getMessage(language, 'newsIntro')}</p>
        </header>

        <div className="announcement__list">
          {announcements.map((item) => (
            <Link className="announcement-card" href={`/novedades/${item.slug}`} key={item.slug}>
              <span className="announcement-card__eyebrow" lang="es">
                {item.eyebrow}
              </span>
              <strong className="announcement-card__title" lang="es">
                {item.title}
              </strong>
              <span className="announcement-card__excerpt" lang="es">
                {item.lead[0]}
              </span>
              <span className="announcement-card__meta">
                <span>{item.publishedAt}</span>
                <span className="announcement-card__cta">
                  {getMessage(language, 'newsRead')} →
                </span>
              </span>
            </Link>
          ))}
        </div>

        <footer className="announcement__footer">
          <nav className="announcement__nav" aria-label="Glass World Studio">
            <Link href="/">{getMessage(language, 'newsBack')}</Link>
            <a href="/terms">Términos de Servicio</a>
            <a href="/privacy">Política de Privacidad</a>
            <a href="/cookies">Declaración de Cookies</a>
            <a href="/refunds">Política de Devoluciones</a>
          </nav>
        </footer>
      </article>
    </main>
  );
}
