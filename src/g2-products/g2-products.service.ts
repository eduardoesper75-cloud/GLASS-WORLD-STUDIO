import { Injectable } from '@nestjs/common';
import { Product } from '../marketplace/product.entity';
import {
  MarketplaceService,
  ProductListFilters,
} from '../marketplace/marketplace.service';
import { G2ListProductsQueryDto } from './dto/g2-list-products-query.dto';

/** Contrato de respuesta del listado G2 (spec g2-listado, D3):
 * `{items, total, page, pageSize}` — distinto del Paginated legacy
 * (limit/hasMore): el spec fija pageSize y el frontend no consume
 * hasMore en la v1. */
export interface G2ProductsPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class G2ProductsService {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  /**
   * Delega en el listado del marketplace (misma query builder, misma
   * clamping de limit, mismo `active = true`) y adapta la forma de la
   * respuesta al contrato G2. Un solo motor de filtros: no se duplica
   * la lógica de buildFilteredQuery.
   */
  async list(dto: G2ListProductsQueryDto): Promise<G2ProductsPage> {
    const filters: ProductListFilters = {
      categoryTier: dto.category,
      brand: dto.brand,
      priceMin: dto.price_min,
      priceMax: dto.price_max,
    };
    const result = await this.marketplaceService.listProducts(
      filters,
      dto.page ?? 1,
      dto.limit ?? 20,
      { field: 'id', dir: 'ASC' },
    );
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.limit,
    };
  }
}
