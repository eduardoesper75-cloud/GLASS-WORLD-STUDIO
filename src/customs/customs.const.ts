/**
 * GWS · CustomsConst — Motor aduanero: dominio y constantes
 * ------------------------------------------------------------
 * Orden Suprema de integración (2026-08-02): cotización transparente en el
 * checkout (valor + flete + aduana + total en moneda local/USD/USDT).
 * Este motor produce ESTIMADOS orientativos con fuente y fecha — no es
 * asesoramiento aduanero ni cotización vinculante. La clasificación final
 * la determina la aduana del país de destino.
 */

/** Tipos de producto reconocidos → código HS por defecto (ver migración). */
export const PRODUCT_TYPE_TO_HS: Record<string, string> = {
  art_glassware: '7013.99',
  art_lampwork: '7018.90',
  art_mosaic: '7016.90',
  boro_rod: '7002.20',
  boro_tube: '7002.32',
  cast_sheet: '7003.19',
  drawn_sheet: '7004.90',
  float_sheet: '7005.29',
  worked_glass: '7006.00',
  tempered: '7007.19',
  lab_glass: '7017.20',
  furnace: '8417.80',
  furnace_parts: '8514.90',
  refractory: '6903.10',
  other_glass: '7020.00',
};

/** 'custom' exige código HS explícito (no mapeado a ninguno por defecto). */
export const SUPPORTED_PRODUCT_TYPES = [
  ...Object.keys(PRODUCT_TYPE_TO_HS),
  'custom',
] as const;

export type ProductType = (typeof SUPPORTED_PRODUCT_TYPES)[number];

export const FREIGHT_MODES = ['air', 'ocean'] as const;
export type FreightMode = (typeof FREIGHT_MODES)[number];

export const ORIGIN_REGION_MODIFIER: Record<string, number> = {
  CN: 0.8,
  IN: 0.8,
  JP: 0.6,
  KR: 0.6,
  TW: 0.6,
  TH: 0.8,
  VN: 0.8,
  SG: 0.8,
  MY: 0.8,
  ID: 0.8,
  PH: 0.8,
  DE: -0.4,
  FR: -0.4,
  IT: -0.4,
  ES: -0.4,
  NL: -0.4,
  BE: -0.4,
  PT: -0.4,
  GB: -0.3,
};

/** Peso facturable aéreo = volumen m³ × 167 (IATA). */
export const AIR_VOLUMETRIC_DIVISOR = 167;

/** Peso→volumen estimado para marítimo sin volumen declarado (~200 kg/m³). */
export const OCEAN_KG_PER_CBM = 200;

/** Cargos fijos de gestión (orientativos, USD). */
export const HANDLING_USD = { air: 25, ocean: 40 };

/** Tope de la tasa de estadística de Argentina (USD, ~US$2.000). */
export const STATISTICAL_FEE_CAP_USD = 2000;

export const CUSTOMS_DISCLAIMER =
  'Estimación orientativa calculada con referencias de tarifas vigentes a la fecha (fuentes en el detalle). No es una cotización vinculante ni asesoramiento aduanero/fiscal: la clasificación arancelaria, el arancel efectivo y los impuestos los determina la autoridad aduanera del país de destino al momento del despacho.';

export const CUSTOMS_AS_OF = '2026-08-02';
