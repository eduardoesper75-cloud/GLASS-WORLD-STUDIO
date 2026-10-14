import { LayerStack } from '@/components/LayerStack';
import { PillarCard } from '@/components/PillarCard';
import { SYSTEM_LAYERS } from '@/lib/layers';
import { site } from '@/lib/site';
import { getTaxonomyView } from '@/lib/taxonomy';

export default function HomePage() {
  const taxonomy = getTaxonomyView();

  return (
    <div className="shell">
      <header className="masthead">
        <a className="brand" href="#top">
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__text">
            <strong>{site.shortName}</strong>
            <em>{site.name}</em>
          </span>
        </a>

        <nav className="nav" aria-label="Navegación principal">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a className="nav__cta" href={site.channel.url} target="_blank" rel="noreferrer">
            Canal
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">{site.name} · Plataforma técnica del vidrio</p>
          <h1 id="hero-title" className="hero__title">
            El <span className="grad">umbral</span> al conocimiento técnico del vidrio.
          </h1>
          <p className="hero__lead">{site.description}</p>

          <div className="hero__actions">
            <a className="btn btn--primary" href="#pilares">
              Explorar los pilares
            </a>
            <a className="btn btn--ghost" href={site.channel.url} target="_blank" rel="noreferrer">
              {site.channel.handle}
            </a>
          </div>

          <dl className="stats">
            <div className="stat">
              <dt>Pilares</dt>
              <dd>{taxonomy.pillarCount}</dd>
            </div>
            <div className="stat">
              <dt>Nodos de taxonomía</dt>
              <dd>{taxonomy.totalNodes}</dd>
            </div>
            <div className="stat">
              <dt>Capas del sistema</dt>
              <dd>{SYSTEM_LAYERS.length}</dd>
            </div>
            <div className="stat">
              <dt>Versión</dt>
              <dd>v{taxonomy.version}</dd>
            </div>
          </dl>
        </section>

        <section id="pilares" className="section" aria-labelledby="pilares-title">
          <header className="section__head">
            <h2 id="pilares-title">Tres pilares técnicos</h2>
            <p>
              Taxonomía viva: cada técnica es un nodo versionado y referenciable por las fichas de
              curaduría.
            </p>
          </header>

          <div className="pillars">
            {taxonomy.pillars.map((pillar) => (
              <PillarCard key={pillar.id} pillar={pillar} />
            ))}
          </div>
        </section>

        <section id="sistema" className="section" aria-labelledby="sistema-title">
          <header className="section__head">
            <h2 id="sistema-title">Arquitectura de 4 capas</h2>
            <p>Separación estricta entre la capa de datos, la automatización y la interfaz.</p>
          </header>

          <LayerStack />
        </section>

        <section id="comunidad" className="section band" aria-labelledby="comunidad-title">
          <div className="band__copy">
            <h2 id="comunidad-title">Cruza el umbral</h2>
            <p>
              Formación, curaduría técnica y ecosistema comercial del vidrio. Únete a la comunidad
              que documenta el oficio.
            </p>
          </div>
          <a className="btn btn--primary" href={site.channel.url} target="_blank" rel="noreferrer">
            Suscribirse al canal
          </a>
        </section>
      </main>

      <footer className="footer">
        <span>
          {site.name} · {site.channel.handle}
        </span>
        <span>Taxonomía v{taxonomy.version}</span>
      </footer>
    </div>
  );
}
