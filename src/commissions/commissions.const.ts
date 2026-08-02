/**
 * GWS · CommissionsConst — Política de comisiones del Marketplace
 * ------------------------------------------------------------
 * Estructura CONFIRMADA por Jorge (2026-08-02):
 *   · G1 artwork_sale = 30.00 % — venta de obras de arte y piezas de
 *     colección (vitrina de museo / acceso directo a coleccionistas).
 *   · G1 product_line = 18.00 % — herramientas, materiales, insumos,
 *     cursos y libros propios del maestro: misma base que el marketplace
 *     universal (incentiva a los íconos a volcar su inventario recurrente).
 *   · G2/G3/G4/G6     = 18.00 % — estándar del marketplace universal.
 *   · G5               = 20.00 % — gran industria.
 *
 * La diferenciación por tipo de transacción existe SOLO en G1. Estos
 * valores viven en la tabla commission_rules (seed); acá solo están las
 * constantes de dominio (galaxias y tipos válidos).
 */
export const SUPPORTED_GALAXIES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'] as const;

/** Tipos de transacción de G1 (null = regla global de la galaxia). */
export const G1_TRANSACTION_TYPES = ['artwork_sale', 'product_line'] as const;

export const PERCENT_MIN = 0;
export const PERCENT_MAX = 100;
