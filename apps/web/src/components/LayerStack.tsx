import { SYSTEM_LAYERS } from '@/lib/layers';

/** Las 4 capas de la arquitectura, de la interfaz a los datos. */
export function LayerStack() {
  return (
    <ol className="layers">
      {SYSTEM_LAYERS.map((layer) => (
        <li key={layer.id} className="layer">
          <span className="layer__num" aria-hidden="true">
            {layer.order}
          </span>
          <div className="layer__body">
            <h3 className="layer__name">{layer.name}</h3>
            <p className="layer__detail">{layer.detail}</p>
          </div>
          <code className="layer__path">{layer.location}</code>
        </li>
      ))}
    </ol>
  );
}
