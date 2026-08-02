/**
 * GWS · EscrowConst — Blindaje Logístico, Embalaje Certificado y Liberación
 * Automatizada de Fondos (Escrow Inteligente)
 * ------------------------------------------------------------
 * Orden Suprema (Blindaje Logístico y Escrow GWS):
 *   1) Protocolo de Embalaje Certificado GWS: la plataforma NO asume
 *      responsabilidad física por roturas/siniestros en tránsito. Impone
 *      manuales estrictos de empaquetado (requisito excluyente del vendedor);
 *      el incumplimiento libera legalmente a la plataforma de reclamos.
 *   2) Matriz de liberación automatizada de fondos (escrow inteligente) con
 *      retención temporal de pagos en USD + USDT, SIN intervención manual de
 *      la administración para los casos normales:
 *        · Manual instantánea: el comprador presiona "OK / Recibido conforme".
 *        · Automática por categoría si no hay reclamo explícito.
 *   3) Consolidación financiera: comisiones oficiales (G1 30% obra de arte,
 *      18% herramientas/cursos de maestros; G5 20%; resto 18%), Búnker
 *      $50/mes con 0% comisión, carteleras $1 USD/1 USDT por día.
 *
 * GOBIERNA CLAUDE.md §3.1: este módulo es la MÁQUINA DE ESTADOS del escrow
 * (retención, vencimientos, confirmación, reclamo). El movimiento REAL de
 * fondos y las liquidaciones son del Payment_Vault (§3.1) — inalterable para
 * agentes de IA. No cambia tarifas: las comisiones reiteradas por la Orden
 * ya viven en commission_rules.
 */

export const ESCROW_CATEGORIES = [
  'consumables',
  'fragile_glass',
  'electrical_parts',
  'heavy_machinery',
] as const;
export type EscrowCategory = (typeof ESCROW_CATEGORIES)[number];

export const ESCROW_CATEGORY_LABELS: Record<EscrowCategory, string> = {
  consumables: 'Herramientas, esmaltes y consumibles menores',
  fragile_glass: 'Vidrios artísticos, planchas dicroicas y materiales frágiles',
  electrical_parts: 'Componentes eléctricos, repuestos y accesorios generales',
  heavy_machinery: 'Maquinaria pesada, hornos industriales y sistemas G5',
};

/**
 * Horas de LIBERACIÓN AUTOMÁTICA si no hay reclamo explícito del comprador
 * (Matriz de la Orden Suprema). Se calcula desde la creación de la
 * retención (holdUntil = createdAt + releaseHours).
 */
export const ESCROW_RELEASE_HOURS: Record<EscrowCategory, number> = {
  consumables: 24, // 24 horas
  fragile_glass: 72, // 3 días
  electrical_parts: 168, // 1 semana (7 días)
  heavy_machinery: 240, // 10 días (recepción, descarga con grúas, puesta en marcha)
};

export const ESCROW_RELEASE_LABELS: Record<EscrowCategory, string> = {
  consumables: '24 horas',
  fragile_glass: '72 horas (3 días)',
  electrical_parts: '1 semana (7 días)',
  heavy_machinery: '10 días',
};

/**
 * VENTANA DE RECLAMO POST-VENCIMIENTO (endurecimiento E1/E3).
 * La liberación automática NO se consume en holdUntil: se abre una ventana de
 * gracia uniforme durante la cual el comprador aún puede reclamar y el sistema
 * retiene. Protege al usuario legítimo del caso límite "reclamé 1 minuto
 * después del vencimiento" — sin cambiar la matriz de liberación (24h/72h/7d/10d).
 * La liberación automática efectiva ocurre en claimableUntil = holdUntil + gracia.
 */
export const ESCROW_CLAIM_GRACE_HOURS = 24;

/**
 * SLA DE RESOLUCIÓN DE DISPUTAS (endurecimiento E1). Ventana máxima para que
 * el Comando resuelva un reclamo (CLAIMED) antes de que la disputa se marque
 * como ESCALADA. No auto-libera fondos (eso es Payment_Vault + decisión de
 * Jorge); el escalamiento es un registro auditable que congela atención.
 */
export const ESCROW_DISPUTE_SLA_HOURS: Record<EscrowCategory, number> = {
  consumables: 48, // 2 días
  fragile_glass: 72, // 3 días
  electrical_parts: 120, // 5 días
  heavy_machinery: 168, // 7 días (maquinaria: inspección y peritaje)
};

export enum EscrowStatus {
  /** Fondos retenidos; esperando liberación (antes de holdUntil). */
  HELD = 'held',
  /** Reclamo del comprador: retención congelada hasta resolución admin. */
  CLAIMED = 'claimed',
  /** Liberados al vendedor (manual "Recibido conforme" o automática). */
  RELEASED = 'released',
  /** Reclamo resuelto: fondos devueltos al comprador. */
  REFUNDED = 'refunded',
}

export enum EscrowReleaseType {
  MANUAL = 'manual',
  AUTO = 'auto',
}

export const ESCROW_MIN_AMOUNT = 0.01;
export const ESCROW_MAX_AMOUNT = 1_000_000;

/** Monedas de settlement del escrow (doble estándar soberano, 1:1). */
export const ESCROW_SETTLEMENT_CURRENCIES = ['USD', 'USDT'] as const;
export type EscrowSettlementCurrency = (typeof ESCROW_SETTLEMENT_CURRENCIES)[number];

/**
 * Protocolo de Embalaje Certificado GWS (Orden §1).
 * Requisito excluyente del vendedor: el incumplimiento de la especificación
 * libera a la plataforma de reclamos por el transporte. Categorías alineadas
 * con la matriz de liberación.
 */
export const ESCROW_PACKAGING_STANDARDS: Record<
  EscrowCategory,
  { rule: string; certification: string; liabilityNote: string }
> = {
  consumables: {
    rule: 'Caja de cartón corrugado reforzado (doble pared) + relleno amortiguante (paper foam o burbuja) que impida el desplazamiento interno.',
    certification: 'Embalaje Certificado GWS · Consumibles (sellado con cinta y fleje liviano).',
    liabilityNote:
      'Si el vendedor despacha sin el embalaje certificado y el producto llega dañado, GWS queda liberada de reclamos por transporte.',
  },
  fragile_glass: {
    rule: 'Doble encajado de alta absorción: film protector antirayaduras sobre la superficie + espuma de celda abierta (absorción de impacto) + caja interior + caja exterior de cartón corrugado reforzado. Marcado "FRÁGIL / ESTE LADO ARRIBA" en caras opuestas.',
    certification: 'Embalaje Certificado GWS · Frágiles/Vidrio (doble encajado de alta absorción).',
    liabilityNote:
      'El incumplimiento del doble encajado de alta absorción libera a GWS de responsabilidad por roturas en tránsito.',
  },
  electrical_parts: {
    rule: 'Caja de cartón corrugado + embolsado antiestático para componentes electrónicos + desecante (sílica gel) y relleno amortiguante. Precinto y etiqueta de manejo.',
    certification: 'Embalaje Certificado GWS · Componentes eléctricos (antiestático + desecante).',
    liabilityNote:
      'Daños por humedad o ESD derivados de omitir el embolsado/desecante no son responsabilidad de GWS.',
  },
  heavy_machinery: {
    rule: 'Embalaje en madera tratada (ISPM 15) con estructura de refuerzo, fijación con flejes metálicos y film stretch, bloqueo de componentes móviles, plano de estiba y marcado de orientación/centro de gravedad. Incluye checklist de puesta en marcha inicial.',
    certification: 'Embalaje Certificado GWS · Maquinaria/Hornos (madera tratada ISPM 15 + fleje metálico).',
    liabilityNote:
      'La liberación automática a los 10 días contempla recepción, descarga con grúas y puesta en marcha inicial. El no cumplimiento del crating de madera tratada exime a GWS.',
  },
};

export const ESCROW_NOTE =
  'Escrow Inteligente GWS: retención temporal y liberación automatizada de ' +
  'pagos (USD/USDT). Manual instantánea con "OK / Recibido conforme" o ' +
  'automática por categoría si no hay reclamo. Este módulo es la máquina de ' +
  'estados; el movimiento real de fondos es del Payment_Vault (§3.1).';
