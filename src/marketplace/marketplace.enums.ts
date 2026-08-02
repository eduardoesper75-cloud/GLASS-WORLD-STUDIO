/**
 * GWS · Categorías de G2 (Marketplace)
 * ------------------------------------------------------------
 * Tal como se definió en la documentación original de la Galaxia 2:
 * no es un catálogo plano, tiene tres niveles de negocio distintos,
 * cada uno con reglas propias (ver ProductCategoryTier más abajo).
 */
export enum ProductCategoryTier {
  /** Materias primas: varillas, tubos, fritas, sílice a granel, químicos. */
  INSUMOS_CRITICOS = 'insumos_criticos',
  /** Herramientas manuales, hornos, maquinaria CNC. */
  PRO_TOOLS_MACHINERY = 'pro_tools_machinery',
  /** Cortes, templado externo, ingeniería — no son "productos" físicos. */
  SERVICIOS_INDUSTRIALES = 'servicios_industriales',
  /** Piezas de arte en vidrio terminadas y abiertas al público del sector —
   * Galaxia 2 como marketplace artístico general. Estas obras NO son el
   * catálogo de autor de G1 (ese vive en g1_master_catalog_items); acá
   * cualquier miembro de la comunidad publica obra terminada para la venta. */
  OBRAS_TERMINADAS = 'obras_terminadas',
}

export enum UnitOfMeasure {
  KG = 'kg',
  TONELADA = 'tonelada',
  METRO_LINEAL = 'metro_lineal',
  UNIDAD = 'unidad',
  LITRO = 'litro',
}
