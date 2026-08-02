/**
 * GWS · Galaxia 1 — Íconos Maestros y Vanguardistas del Vidrio
 * ------------------------------------------------------------
 * Tipos de ítem de catálogo propio de un maestro. Cada maestro gestiona
 * y vende lo suyo: formación (cursos/talleres), conocimiento escrito
 * (libros/bibliografía) y producción de autor (herramientas o materiales
 * con su firma). Son rubros distintos con campos distintos — por eso el
 * detalle vive en JSONB (details), validado en el DTO según itemType.
 */
export enum MasterCatalogItemType {
  COURSE = 'course',
  WORKSHOP = 'workshop',
  BOOK = 'book',
  AUTHOR_TOOL_LINE = 'author_tool_line',
  AUTHOR_MATERIAL_LINE = 'author_material_line',
}

/**
 * Nivel de maestría, usado para el perfil público del maestro. No es un
 * ranking de habilidad — es la categoría con la que GWS presenta al
 * maestro ante la comunidad (ver CLAUDE.md tabla G1).
 */
export enum MasterTier {
  ICON = 'icon',
  MASTER = 'master',
  AVANT_GARDE = 'avant_garde',
}

/** Monedas aceptadas para los catálogos de G1 (USD por defecto). */
export const MASTER_CURRENCIES = ['USD', 'ARS', 'EUR'] as const;
