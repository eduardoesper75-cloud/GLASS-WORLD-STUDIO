/**
 * GWS · Fundación — Las 6 Galaxias + Satélite
 * ------------------------------------------------------------
 * Única fuente de verdad de los identificadores de galaxia. Los
 * cupos de fundación se siembran contra estos ids (ver migración
 * FoundationSlots) y el GalaxyAccessGuard los usa para saber qué
 * galaxia está "gated" al agotarse sus cupos.
 *
 * g4/g5 están RESERVADAS (CLAUDE.md §1): aunque tengan cupos de
 * fundación configurados, su contenido no se construye hasta tener
 * material real. El guard las trata como bloqueadas por defecto.
 */

export interface GalaxyInfo {
  id: string;
  name: string;
  core: string;
  glow: string;
  /** Reservada = sin contenido real todavía; siempre gateada salvo override. */
  reserved?: boolean;
}

export const GWS_GALAXIES: readonly GalaxyInfo[] = [
  { id: 'g1', name: 'Íconos Maestros', core: '#e8a54b', glow: '#f4c77e' },
  { id: 'g2', name: 'Marketplace', core: '#4fa8d8', glow: '#7fc4ea' },
  { id: 'g3', name: 'Comunidad', core: '#e36e80', glow: '#f09aa8' },
  { id: 'g4', name: 'Boro y Envases', core: '#8577e0', glow: '#aba1ee', reserved: true },
  { id: 'g5', name: 'Gran Industria', core: '#9ba5b3', glow: '#c7ceda', reserved: true },
  { id: 'g6', name: 'Ingeniería y Oficio', core: '#52e0c4', glow: '#8cf0dc' },
] as const;

export const GALAXY_IDS: readonly string[] = GWS_GALAXIES.map((g) => g.id);

export function isReservedGalaxy(galaxy: string): boolean {
  return GWS_GALAXIES.some((g) => g.id === galaxy && g.reserved === true);
}
