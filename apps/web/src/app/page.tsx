/**
 * Página raíz (scaffold).
 *
 * Sin lógica de negocio todavía: la lista de pilares está cableada a propósito.
 * Próximo paso: alimentarla desde `@gws/taxonomy` (loadTaxonomy) y las Fichas de
 * Curaduría publicadas en `data/curated`.
 */

const LAYERS = [
  { n: 1, name: 'Presentación / UI', detail: 'YouTube · Cliente web / Dashboard' },
  { n: 2, name: 'Motor de Curaduría y Taxonomía', detail: 'Hot-Kiln · Flame · Cold-Working' },
  { n: 3, name: 'Pipeline de Automatización', detail: 'Ingesta, formateo y sincronización' },
  { n: 4, name: 'Datos y Almacenamiento', detail: 'Google Cloud / Drive & Docs · Git' },
];

export default function HomePage() {
  return (
    <main className="page">
      <header>
        <p className="eyebrow">Glass World Studio</p>
        <h1>Infraestructura de curaduría técnica del vidrio</h1>
        <p className="lead">
          Taxonomía, base de conocimiento contextualizada y ecosistema B2B/C2C sobre una
          arquitectura modular y cloud-native.
        </p>
      </header>

      <section aria-labelledby="stack">
        <h2 id="stack">Capas del sistema</h2>
        <ol className="layers">
          {LAYERS.map((layer) => (
            <li key={layer.n}>
              <span className="num">{layer.n}</span>
              <span>
                <strong>{layer.name}</strong>
                <em>{layer.detail}</em>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
