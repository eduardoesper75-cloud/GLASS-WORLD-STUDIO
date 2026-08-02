/**
 * GWS · Mapa de regiones para el Radar de Oferta/Demanda (Galaxia 2)
 * ------------------------------------------------------------
 * Implementa la regla de negocio definida por Jorge: un comprador en
 * Argentina debe encontrar primero comercio LOCAL, después la REGIÓN
 * (Brasil, México y el resto de Latinoamérica), y por último GLOBAL
 * (el resto del mundo).
 *
 * Diseño deliberado: esto es una tabla de configuración, no una
 * fórmula de distancia geográfica real (great-circle distance). Una
 * fórmula de distancia pura pondría a Chile más "cerca" que México
 * para un comprador argentino, lo cual es geográficamente cierto pero
 * comercialmente irrelevante si en Chile no hay proveedores de vidrio
 * relevantes y en México sí. La proximidad que le importa a GWS es
 * de MERCADO, no de mapa — por eso es una tabla editable, no una
 * ecuación. Ajustar esta tabla cuando haya datos reales de dónde
 * están los proveedores activos, no antes.
 */
export type RegionTier = 'local' | 'regional' | 'global';

/**
 * Vecinos regionales por país comprador (código ISO 3166-1 alpha-2).
 * Si el país del comprador no está en este mapa, TODO producto que
 * no sea del mismo país cae directo en 'global' (fallback seguro:
 * no asumir cercanía que no fue definida explícitamente).
 */
export const REGIONAL_NEIGHBORS: Record<string, string[]> = {
  AR: ['BR', 'MX', 'CL', 'UY', 'PY', 'BO', 'PE', 'CO'],
  BR: ['AR', 'MX', 'UY', 'PY', 'CL'],
  MX: ['AR', 'BR', 'CO', 'PE', 'CL'],
};

export function resolveRegionTier(buyerCountryCode: string, sellerCountryCode: string): RegionTier {
  if (buyerCountryCode === sellerCountryCode) return 'local';
  const neighbors = REGIONAL_NEIGHBORS[buyerCountryCode] ?? [];
  if (neighbors.includes(sellerCountryCode)) return 'regional';
  return 'global';
}
