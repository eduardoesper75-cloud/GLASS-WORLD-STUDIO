import { Module } from '@nestjs/common';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { G2ProductsController } from './g2-products.controller';
import { G2ProductsService } from './g2-products.service';

/**
 * GWS · G2ProductsModule — Capa de listado G2 (spec g2-listado)
 * ------------------------------------------------------------
 * Sin TypeOrmModule propio: reusa MarketplaceService (exportado por
 * MarketplaceModule) para leer el catálogo. La escritura de productos
 * sigue siendo de marketplace.controller — acá solo se lee.
 */
@Module({
  imports: [MarketplaceModule],
  controllers: [G2ProductsController],
  providers: [G2ProductsService],
})
export class G2ProductsModule {}
