/**
 * GWS · Identidad cromática por Galaxia
 * =====================================
 * DECISIÓN DE ADAPTACIÓN: la Orden Maestra proponía un hue + color por
 * galaxia (#FFD700, #4A90E2, #B565E0...). El canónico gws-design-tokens.css
 * define los cores GLOW por Galaxia y prohíbe inventar tonos. Estos son los
 * colores AUTORIZADOS (--g1-core..--g6-core, --sat-core). Los iconos son
 * los que pidió la orden. Al entrar a una galaxia la UI se tiñe con su hue
 * vía CSS `--galaxy-hue` (derivado del hue del color canónico).
 */

export interface Galaxy {
  id: string;
  slug: string;
  hue: number;
  color: string;
  glow: string;
  icon: string;
  /** Nombre corto de la ruta de catálogo (backend: GALAXY_IDS). */
  apiId: string;
}

export const GALAXIES: Galaxy[] = [
  { id: 'G1', slug: 'maestros', hue: 37, color: '#e8a54b', glow: '#f4c77e', icon: '◈', apiId: 'g1' },
  { id: 'G2', slug: 'marketplace', hue: 201, color: '#4fa8d8', glow: '#7fc4ea', icon: '◆', apiId: 'g2' },
  { id: 'G3', slug: 'comunidad', hue: 351, color: '#e36e80', glow: '#f09aa8', icon: '◇', apiId: 'g3' },
  { id: 'G4', slug: 'institucion', hue: 248, color: '#8577e0', glow: '#aba1ee', icon: '○', apiId: 'g4' },
  { id: 'G5', slug: 'industria', hue: 214, color: '#9ba5b3', glow: '#c7ceda', icon: '⬢', apiId: 'g5' },
  { id: 'G6', slug: 'ingenieria', hue: 168, color: '#52e0c4', glow: '#8cf0dc', icon: '⬡', apiId: 'g6' },
];

export interface Satellite {
  slug: string;
  hue: number;
  color: string;
  glow: string;
  icon: string;
}

/** Satélites transversales — no pertenecen a ninguna galaxia. */
export const SATELLITES: Satellite[] = [
  { slug: 'licitaciones', hue: 358, color: '#f2545b', glow: '#ff8288', icon: '◎' },
  { slug: 'alertas', hue: 358, color: '#f2545b', glow: '#ff8288', icon: '✦' },
  { slug: 'comunidad', hue: 20, color: '#e8a54b', glow: '#f4c77e', icon: '✧' },
  { slug: 'investigacion', hue: 190, color: '#4fa8d8', glow: '#7fc4ea', icon: '◈' },
  { slug: 'soporte', hue: 120, color: '#52e0c4', glow: '#8cf0dc', icon: '✳' },
];

export function getGalaxy(slug: string): Galaxy | undefined {
  return GALAXIES.find((g) => g.slug === slug);
}

export function galaxyHueVar(slug: string): string {
  const g = getGalaxy(slug);
  return g ? `--galaxy-hue: ${g.hue}` : '';
}