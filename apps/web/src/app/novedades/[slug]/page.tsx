import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { announcements, getAnnouncement } from '@/lib/announcements';
import { site } from '@/lib/site';

type AnnouncementPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return announcements.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: AnnouncementPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getAnnouncement(slug);

  if (!item) {
    return { title: `Novedades · ${site.shortName}` };
  }

  return {
    title: `${item.title} · ${site.shortName}`,
    description: item.lead[0],
  };
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const { slug } = await params;
  const item = getAnnouncement(slug);

  if (!item) {
    notFound();
  }

  const [greeting, ...manifesto] = item.lead;

  return (
    <main className="announcement">
      <article className="announcement__hero">
        <header className="announcement__header">
          <p className="announcement__eyebrow">{item.eyebrow}</p>
          <h1 className="announcement__title">{item.title}</h1>
          <p className="announcement__effective">{item.effective}</p>
        </header>

        <div className="announcement__lead">
          <p>{greeting}</p>
          {manifesto.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        <div className="announcement__body">
          {item.sections.map((section) => (
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

        <blockquote className="announcement__closing">{item.closing}</blockquote>

        <div className="announcement__signature">
          <span>{item.farewell}</span>
          <strong>{item.author.name}</strong>
          <span>{item.author.role}</span>
          <a href={`mailto:${item.author.contact}`}>{item.author.contact}</a>
        </div>

        <footer className="announcement__footer">
          <nav className="announcement__nav" aria-label="Glass World Studio">
            <Link href="/novedades">Todas las novedades</Link>
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
