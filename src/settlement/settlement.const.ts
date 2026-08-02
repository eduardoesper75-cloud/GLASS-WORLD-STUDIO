/**
 * GWS · SettlementConst — Soberanía Financiera: settlement nativo USD + USDT
 * ------------------------------------------------------------
 * Orden Suprema (Soberanía Financiera): TODAS las transacciones de la
 * plataforma —suscripciones del Búnker, carteleras y liquidaciones del
 * marketplace— operan bajo un doble estándar soberano: Dólares (USD) y
 * Criptomonedas Estables (USDT). Queda prohibida la dependencia exclusiva
 * de monedas fiat locales para servicios transfronterizos o membresía
 * global.
 *
 * ALCANCE DE ESTE MÓDULO (gobernanza CLAUDE.md §3.1):
 *   - ES DOMINIO + DISPLAY. Declara las monedas/métodos admitidos y la
 *     paridad de settlement. NO mueve dinero.
 *   - El adaptador real que habla con redes (verificación de saldos,
 *     confirmación de acreditación) pertenece al Payment_Vault (§3.1),
 *     código inalterable para agentes de IA y solo modificable por Jorge
 *     con elevación + 2FA. Acá vive SOLO el contrato de interfaz y una
 *     implementación DEMO sin credenciales ni conexión de red.
 *   - NINGÚN cambio de tarifa: este módulo agrega la MONEDA de cobro a
 *     los módulos económicos existentes (Búnker USD 50/mes, carteleras
 *     USD 1/día, comisiones G1 30% / G5 20% / estándar 18%). Los valores
 *     ya confirmados por Jorge no se tocan.
 */

/** Monedas de settlement nativas (doble estándar soberano). */
export const SETTLEMENT_CURRENCIES = ['USD', 'USDT'] as const;
export type SettlementCurrency = (typeof SETTLEMENT_CURRENCIES)[number];

/**
 * Métodos de pago admitidos con UN solo clic (la elección del usuario se
 * persiste en el módulo económico; la pasarela real es Payment_Vault).
 */
export const SETTLEMENT_PAYMENT_METHODS = [
  'card_usd',
  'usdt_trc20',
  'usdt_polygon',
] as const;
export type SettlementPaymentMethod = (typeof SETTLEMENT_PAYMENT_METHODS)[number];

/** Redes USDT de bajo costo soportadas (TRC-20 y Polygon). */
export const USDT_NETWORKS = ['trc20', 'polygon'] as const;
export type UsdtNetwork = (typeof USDT_NETWORKS)[number];

/** Paridad de settlement: 1 USDT = 1 USD (stablecoin anclada). */
export const USDT_USD_PARITY = 1;

/**
 * Mapa método → red (para el adaptador de verificación de saldos).
 * 'card_usd' no requiere red (pasarela del procesador licenciado).
 */
export const PAYMENT_METHOD_NETWORK: Record<SettlementPaymentMethod, UsdtNetwork | null> = {
  card_usd: null,
  usdt_trc20: 'trc20',
  usdt_polygon: 'polygon',
};

/** Política de settlement por módulo económico (documentada, display). */
export const SETTLEMENT_POLICY = {
  bunker: {
    rule: 'Suscripción pro USD 50/mes, pagadera por tarjeta USD o USDT (TRC-20/Polygon). Se aplican los descuentos de fidelización 3m=10%, 6m=15%, 12m=20% en la moneda elegida.',
    parity: USDT_USD_PARITY,
  },
  billboards: {
    rule: 'USD 1,00 o 1 USDT por día activo por cartelera (tarifa plana, sin fricciones geográficas).',
    parity: USDT_USD_PARITY,
  },
  marketplace: {
    rule: 'Comisiones G1 30% (artwork_sale), G5 20% (industria) y 18% estándar. Cobro y liquidación en cripto o USD según la elección de las partes.',
    parity: USDT_USD_PARITY,
  },
} as const;

export const SETTLEMENT_POLICY_NOTE =
  'Settlement nativo USD + USDT (Orden Suprema Soberanía Financiera). ' +
  'Este módulo es dominio + display: declara monedas/métodos y paridad 1:1. ' +
  'El cobro real y la verificación de saldos en red son del Payment_Vault ' +
  '(§3.1) — código inalterable para agentes de IA, solo Jorge con elevación.';
