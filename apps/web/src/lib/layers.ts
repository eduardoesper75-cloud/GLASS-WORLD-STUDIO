export interface SystemLayer {
  order: number;
  id: string;
  name: string;
  detail: string;
  /** Dónde vive esta capa en el repositorio. */
  location: string;
}

/** Las 4 capas de la arquitectura GWS, de la interfaz a los datos. */
export const SYSTEM_LAYERS: readonly SystemLayer[] = [
  {
    order: 1,
    id: 'ui',
    name: 'Presentación / UI',
    detail: 'Cliente web / dashboard de Glass World Studio.',
    location: 'apps/web',
  },
  {
    order: 2,
    id: 'curation',
    name: 'Motor de Curaduría y Taxonomía',
    detail: 'Pilares Hot-Kiln, Flame y Cold-Working; fichas con metadatos y marcas temporales.',
    location: 'packages/taxonomy · packages/schemas',
  },
  {
    order: 3,
    id: 'pipeline',
    name: 'Pipeline de Automatización',
    detail: 'Ingesta, formateo y sincronización de contenido propio desde Google Drive / Docs.',
    location: 'pipeline',
  },
  {
    order: 4,
    id: 'data',
    name: 'Datos y Almacenamiento',
    detail: 'Google Cloud / Drive & Docs REST API y control de versiones.',
    location: 'data · Git',
  },
];
