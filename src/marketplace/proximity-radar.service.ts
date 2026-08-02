import { Injectable } from '@nestjs/common';
import { Product } from './product.entity';
import { resolveRegionTier, RegionTier } from './region-map.const';

export interface RadarGroupedResults {
  local: Product[];
  regional: Product[];
  global: Product[];
}

@Injectable()
export class ProximityRadarService {
  /**
   * Agrupa una lista de productos ya traída de la base (sin geo-query
   * en SQL, porque el volumen esperado por categoría es chico y esto
   * es más legible) según la distancia de MERCADO al comprador. El
   * orden de las claves del objeto resultado importa para el frontend:
   * local primero, siempre.
   */
  groupByRegion(products: Product[], buyerCountryCode: string): RadarGroupedResults {
    const grouped: RadarGroupedResults = { local: [], regional: [], global: [] };

    for (const product of products) {
      const tier: RegionTier = resolveRegionTier(buyerCountryCode, product.sellerCountryCode);
      grouped[tier].push(product);
    }
    return grouped;
  }
}
