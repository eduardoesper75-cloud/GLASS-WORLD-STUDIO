import type { Metadata } from 'next';

import { reaparicion } from '@/lib/announcements';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: `${reaparicion.title} · ${site.shortName}`,
  description:
    'Comunicado oficial de reaparición de Glass World Studio: la nueva etapa del Marketplace Vertical integral para la industria global del vidrio.',
};

export default function AnnouncementPage() {
  const [greeting, ...manifesto] = reaparicion.lead;

  return (
    <main className="announcement">
      <article className="announcement__hero">
        <header className="announcement__header">
          <p className="announcement__eyebrow">{reaparicion.eyebrow}</p>
          <h1 className="announcement__title">{reaparicion.title}</h1>
          <p className="announcement__effective">{reaparicion.effective}</p>
        </header>

        <div className="announcement__lead">
          <p>{greeting}</p>
          {manifesto.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        <div className="announcement__body">
          {reaparicion.sections.map((section) => (
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

        <blockquote className="announcement__closing">{reaparicion.closing}</blockquote>

        <div className="announcement__signature">
          <span>{reaparicion.farewell}</span>
          <strong>{reaparicion.author.name}</strong>
          <span>{reaparicion.author.role}</span>
          <a href={`mailto:${reaparicion.author.contact}`}>{reaparicion.author.contact}</a>
        </div>

        <footer className="announcement__footer">
          <nav className="announcement__nav" aria-label="Glass World Studio">
            <a href="/">Volver al inicio</a>
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
