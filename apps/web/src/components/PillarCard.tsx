import type { PillarView } from '@/lib/taxonomy-contract';

/** Tarjeta de un pilar técnico, alimentada por `@gws/taxonomy`. */
export function PillarCard({ pillar }: { pillar: PillarView }) {
  return (
    <article className="pillar" data-pillar={pillar.id}>
      <header className="pillar__head">
        <span className="pillar__badge">{pillar.id}</span>
        <h3 className="pillar__title">{pillar.name.es}</h3>
        <p className="pillar__subtitle">{pillar.name.en}</p>
      </header>

      <p className="pillar__summary">{pillar.summary.es}</p>

      <ul className="pillar__techniques" aria-label={`Técnicas de ${pillar.name.es}`}>
        {pillar.highlights.map((node) => (
          <li key={node.id}>{node.name.es}</li>
        ))}
      </ul>

      <footer className="pillar__foot">
        <span className="pillar__count">
          {pillar.nodeCount} <abbr title="nodos de taxonomía">nodos</abbr>
        </span>
        <ul className="pillar__tags">
          {pillar.tags.slice(0, 3).map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
