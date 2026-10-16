'use client';

import Link from 'next/link';

import { useLanguage } from '@/components/LanguageProvider';
import { getMessage } from '@/lib/i18n';
import type { Announcement } from '@/lib/announcements';

export function AnnouncementView({ announcement }: { announcement: Announcement }) {
  const { language } = useLanguage();
  const [greeting, ...manifesto] = announcement.lead;

  return (
    <main className="announcement">
      <article className="announcement__hero">
        <header className="announcement__header">
          <p className="announcement__eyebrow" lang="es">
            {announcement.eyebrow}
          </p>
          <h1 className="announcement__title" lang="es">
            {announcement.title}
          </h1>
          <p className="announcement__effective" lang="es">
            {announcement.effective}
          </p>
        </header>

        <div className="announcement__lead" lang="es">
          <p>{greeting}</p>
          {manifesto.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        <div className="announcement__body" lang="es">
          {announcement.sections.map((section) => (
            <section className="announcement__section" key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id}>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet.slice(0, 32)}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <blockquote className="announcement__closing" lang="es">
          {announcement.closing}
        </blockquote>

        <div className="announcement__signature" lang="es">
          <span>{announcement.farewell}</span>
          <strong>{announcement.author.name}</strong>
          <span>{announcement.author.role}</span>
          <a href={`mailto:${announcement.author.contact}`}>{announcement.author.contact}</a>
          {announcement.author.site ? (
            <a href={announcement.author.site}>
              {announcement.author.site.replace(/^https?:\/\//, '')}
            </a>
          ) : null}
        </div>

        <footer className="announcement__footer">
          <nav className="announcement__nav" aria-label="Glass World Studio">
            <Link href="/novedades">{getMessage(language, 'newsAll')}</Link>
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
