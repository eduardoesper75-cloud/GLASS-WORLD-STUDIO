import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { G2ListProductsQueryDto } from './dto/g2-list-products-query.dto';
import { G2ProductsService } from './g2-products.service';

/**
 * GWS · G2ProductsController — Listado del catálogo G2 (spec g2-listado)
 * ------------------------------------------------------------
 * Público, sin guard: es un catálogo de solo lectura, igual que
 * GET /marketplace/products. Ruta canónica /g2/products (el backend
 * no usa prefijo global /api — ver health.controller.ts) + alias
 * /api/g2/products por CA2 del spec y para gateways que asumen el
 * prefijo.
 */
@ApiTags('g2')
@Controller()
export class G2ProductsController {
  constructor(private readonly g2ProductsService: G2ProductsService) {}

  @ApiOperation({
    summary: 'Listado paginado del catálogo G2',
    description:
      'Filtros combinables: category (tier), brand, price_min, price_max. ' +
      'Paginación page/limit (default 20, máx 100). Respuesta {items,total,page,pageSize}.',
  })
  @Get('g2/products')
  list(@Query() query: G2ListProductsQueryDto) {
    return this.g2ProductsService.list(query);
  }

  @ApiOperation({ summary: 'Alias /api/g2/products (CA2 g2-listado)' })
  @Get('api/g2/products')
  listApiAlias(@Query() query: G2ListProductsQueryDto) {
    return this.g2ProductsService.list(query);
  }
}
