/**
 * Arquitectura para comercio transfronterizo (Cross-Border) — Glass World Studio
 *
 * Este módulo deja estructurados los parámetros para:
 * - Manejo de divisas globales (USD, EUR, etc.)
 * - Cálculo de impuestos de exportación/VAT según región
 * - Pasarelas de pago con estándar PCI-DSS (referencia arquitectónica)
 *
 * Implementación funcional pendiente hasta integrar con proveedores de pago reales.
 * No se exponen claves sensibles en este módulo (solo tipos y constantes).
 */

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MXN', 'ARS', 'CLP'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const VAT_REGIONS = ['EU', 'UK', 'CA', 'AU', 'MX', 'LATAM', 'US', 'OTHER'] as const;
export type VatRegion = (typeof VAT_REGIONS)[number];

/** Parámetros fiscales por región (referenciales; pendientes de validación normativa) */
export interface TaxConfig {
  region: VatRegion;
  /** Indica si aplica VAT/IVA o impuesto de importación */
  vatApplicable: boolean;
  /** Tipo impositivo referencial (%) */
  vatRate: number;
  /** Indica si el cálculo debe considerar exportación */
  exportConsiderations: boolean;
}

export const DEFAULT_TAX_CONFIGS: Record<VatRegion, TaxConfig> = {
  EU: { region: 'EU', vatApplicable: true, vatRate: 0.21, exportConsiderations: true },
  UK: { region: 'UK', vatApplicable: true, vatRate: 0.2, exportConsiderations: true },
  CA: { region: 'CA', vatApplicable: true, vatRate: 0.05, exportConsiderations: true },
  AU: { region: 'AU', vatApplicable: true, vatRate: 0.1, exportConsiderations: true },
  MX: { region: 'MX', vatApplicable: true, vatRate: 0.16, exportConsiderations: true },
  LATAM: { region: 'LATAM', vatApplicable: true, vatRate: 0.12, exportConsiderations: true },
  US: { region: 'US', vatApplicable: false, vatRate: 0, exportConsiderations: true },
  OTHER: { region: 'OTHER', vatApplicable: false, vatRate: 0, exportConsiderations: true },
};

/** Esquema para cálculo de totales transfronterizos (no implementado aún) */
export interface CrossBorderTotals {
  currency: SupportedCurrency;
  subtotal: number;
  shipping: number;
  vat: number;
  importDuty: number;
  total: number;
  region: VatRegion;
}

/** Referencia arquitectónica de pasarelas PCI-DSS */
export const PCI_COMPLIANT_GATEWAYS = [
  'stripe',
  'adyen',
  'braintree',
  'checkoutcom',
  'square',
] as const;
export type PciCompliantGateway = (typeof PCI_COMPLIANT_GATEWAYS)[number];

/** Estructura para registrar pasarela activa (solo referencia, sin secretos) */
export interface PaymentGatewayConfig {
  gateway: PciCompliantGateway;
  enabled: boolean;
  /** Indica si utiliza tokenización/3DSecure conforme a PCI-DSS v4.x */
  pciDssCompliant: boolean;
  /** Soporta múltiples divisas */
  multiCurrency: boolean;
}

/** Configuración por defecto (solo referencia arquitectónica) */
export const DEFAULT_PAYMENT_CONFIG: PaymentGatewayConfig = {
  gateway: 'stripe',
  enabled: false,
  pciDssCompliant: true,
  multiCurrency: true,
};
