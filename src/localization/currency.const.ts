/**
 * GWS · Localización — países/idiomas/monedas de la Portada
 * ------------------------------------------------------------
 * SOLO EXHIBICIÓN. Aquí no hay procesamiento de pagos ni datos de
 * tesorería (CLAUDE.md §3.1): estas tasas son estáticas, de demo,
 * para que la Portada muestre precios/cupos en la moneda del país
 * visitante. La pasarela real (USDT TRC-20/Polygon vía Payment_Vault)
 * la completa Jorge; este módulo queda como proveedor de cotización
 * visual desacoplado de cualquier wallet.
 *
 * COVERAGE_PERCENT se usa para mostrar qué tan completo es el mapa
 * (honestidad sobre cobertura, no sobre promesas).
 */

export const SUPPORTED_CURRENCIES = [
  'USD', 'USDT', 'ARS', 'BRL', 'MXN', 'EUR', 'GBP',
  'BOB', 'CLP', 'COP', 'PEN', 'PYG', 'UYU', 'VES',
] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/** Tasas estáticas de demo, base USD=1. TODO: reemplazar por el
 * proveedor de cotización real cuando exista Payment_Vault. */
export const DEMO_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  USDT: 1,
  ARS: 1150,
  BRL: 5.4,
  MXN: 18.5,
  EUR: 0.92,
  GBP: 0.79,
  BOB: 6.9,
  CLP: 960,
  COP: 4100,
  PEN: 3.75,
  PYG: 7600,
  UYU: 41.5,
  VES: 0.00004,
};

export const SUPPORTED_LANGUAGES = ['es', 'en', 'pt', 'it', 'de', 'fr', 'zh'] as const;

export interface CountryMeta {
  countryCode: string;
  name: string;
  currency: CurrencyCode;
  language: string;
}

/** ISO 3166-1 alpha-2 → moneda e idioma por defecto. Cobertura
 * inicial: LATAM + EU + US/GB (benchmark 2026 de alcance). El resto
 * cae en un default honesto (ver LocalizationService). */
export const COUNTRY_META: Record<string, CountryMeta> = {
  AR: { countryCode: 'AR', name: 'Argentina', currency: 'ARS', language: 'es' },
  BO: { countryCode: 'BO', name: 'Bolivia', currency: 'BOB', language: 'es' },
  BR: { countryCode: 'BR', name: 'Brasil', currency: 'BRL', language: 'pt' },
  CL: { countryCode: 'CL', name: 'Chile', currency: 'CLP', language: 'es' },
  CO: { countryCode: 'CO', name: 'Colombia', currency: 'COP', language: 'es' },
  EC: { countryCode: 'EC', name: 'Ecuador', currency: 'USD', language: 'es' },
  MX: { countryCode: 'MX', name: 'México', currency: 'MXN', language: 'es' },
  PE: { countryCode: 'PE', name: 'Perú', currency: 'PEN', language: 'es' },
  PY: { countryCode: 'PY', name: 'Paraguay', currency: 'PYG', language: 'es' },
  UY: { countryCode: 'UY', name: 'Uruguay', currency: 'UYU', language: 'es' },
  VE: { countryCode: 'VE', name: 'Venezuela', currency: 'VES', language: 'es' },
  US: { countryCode: 'US', name: 'Estados Unidos', currency: 'USD', language: 'en' },
  GB: { countryCode: 'GB', name: 'Reino Unido', currency: 'GBP', language: 'en' },
  ES: { countryCode: 'ES', name: 'España', currency: 'EUR', language: 'es' },
  IT: { countryCode: 'IT', name: 'Italia', currency: 'EUR', language: 'it' },
  DE: { countryCode: 'DE', name: 'Alemania', currency: 'EUR', language: 'de' },
  FR: { countryCode: 'FR', name: 'Francia', currency: 'EUR', language: 'fr' },
};

export const COVERAGE_PERCENT = Math.round(
  (Object.keys(COUNTRY_META).length / 195) * 100,
);
