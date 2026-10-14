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
    detail: 'Canal de YouTube y cliente web / dashboard.',
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
    detail: 'Ingesta, formateo y sincronización desde Google Drive / Docs y YouTube.',
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
