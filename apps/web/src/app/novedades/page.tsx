import type { Metadata } from 'next';
import Link from 'next/link';

import { announcements } from '@/lib/announcements';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: `Novedades · ${site.shortName}`,
  description:
    'Comunicados oficiales de Glass World Studio: reaparición en la plataforma y convocatoria abierta de alianzas estratégicas.',
};

export default function AnnouncementsIndexPage() {
  return (
    <main className="announcement">
      <article className="announcement__hero">
        <header className="announcement__header">
          <p className="announcement__eyebrow">Sala de prensa · Glass World Studio</p>
          <h1 className="announcement__title">Novedades</h1>
          <p className="announcement__effective">Comunicados oficiales de Glass World Studio.</p>
        </header>

        <div className="announcement__list">
          {announcements.map((item) => (
            <Link className="announcement-card" href={`/novedades/${item.slug}`} key={item.slug}>
              <span className="announcement-card__eyebrow">{item.eyebrow}</span>
              <strong className="announcement-card__title">{item.title}</strong>
              <span className="announcement-card__excerpt">{item.lead[0]}</span>
              <span className="announcement-card__meta">
                <span>{item.publishedAt}</span>
                <span className="announcement-card__cta">Leer comunicado →</span>
              </span>
            </Link>
          ))}
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
