/**
 * GWS · G6 TechSheetsConst — Base preconfigurada de fichas técnicas
 * ------------------------------------------------------------
 * Orden Suprema (Base de Datos Inteligente y Preconfigurada de Fichas
 * Técnicas, Galaxia 6 — Ingeniería y Oficio): eliminar la fricción del
 * comerciante al subir productos estandarizados (pirómetros, termocuplas,
 * hornos de fundición, grisallas, óxidos, esmaltes y varillas).
 *
 * MECÁNICA:
 *   · Autopredictor: al ingresar un producto masivo, el sistema detecta la
 *     referencia por patrones de catálogo y AUTOCONPLETA la ficha técnica
 *     oficial (rangos de temperatura, curvas sugeridas, voltaje, materiales
 *     compatibles).
 *   · Fricción cero para el vendedor: no redactar especificaciones desde cero.
 *   · Fallback manual: piezas de autor/herramientas artesanales → formulario
 *     limpio de ficha técnica manual.
 *
 * El CATÁLOGO precargado (templates) vive seedeado por la migración
 * 1741000000000-G6TechSheetsSchema; acá están las familias, los orígenes y
 * las reglas de matching del autopredictor.
 */

export const G6_TECH_FAMILIES = [
  'pyrometer',
  'thermocouple',
  'furnace',
  'grisaille',
  'oxide',
  'enamel',
  'rod',
] as const;
export type G6TechFamily = (typeof G6_TECH_FAMILIES)[number];

export const G6_TECH_FAMILY_LABELS: Record<G6TechFamily, string> = {
  pyrometer: 'Pirómetros',
  thermocouple: 'Termocuplas',
  furnace: 'Hornos de fundición',
  grisaille: 'Grisallas',
  oxide: 'Óxidos colorantes',
  enamel: 'Esmaltes',
  rod: 'Varillas / tubos',
};

/** Origen de una ficha técnica: autocompletada por patrón o manual. */
export const G6_TECH_SHEET_SOURCES = ['autocomplete', 'manual'] as const;
export type G6TechSheetSource = (typeof G6_TECH_SHEET_SOURCES)[number];

export const G6_TECH_SHEET_STATUSES = ['draft', 'published'] as const;
export type G6TechSheetStatus = (typeof G6_TECH_SHEET_STATUSES)[number];

/** Máximo de coincidencias que devuelve el autopredictor. */
export const G6_SUGGEST_LIMIT = 5;

/** Reglas del autopredictor (matching por patrones de catálogo). */
export const G6_MATCH_RULES = {
  minKeywordLength: 3,
  weightName: 3,
  weightKeyword: 2,
  weightBrand: 1,
} as const;

/**
 * G6 · Nota de gobernanza del catálogo (scraping / investigación).
 * El catálogo precargado se alimenta de fuentes públicas (catálogos de
 * fabricantes, normativas UL/CE/EN/IEC) bajo el bucle de investigación
 * documentado en docs/research/g6-fichas-tecnicas-2026.md. Los datos se
 * CURAN con fuente; nunca se auto-publica una ficha sin origen verificado.
 * El scraping en bucle (Orden §3) es una tarea de investigación pendiente,
 * registrada en docs/ops/pendientes-bloqueados-codespace.md.
 */
export const G6_TECH_SHEETS_NOTE =
  'Base preconfigurada de fichas técnicas (Galaxia 6). El autopredictor ' +
  'completa la ficha oficial por patrón; piezas de autor usan el formulario ' +
  'manual. El vendedor SIEMPRE puede corregir la ficha antes de publicar.';
