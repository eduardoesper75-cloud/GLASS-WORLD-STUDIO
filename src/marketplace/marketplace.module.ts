import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductionBatch } from './production-batch.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductCategory } from './product-category.entity';
import { ProductReview } from './product-review.entity';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { ProximityRadarService } from './proximity-radar.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductionBatch, ProductVariant, ProductCategory, ProductReview]),
    AuthModule,
  ],
  providers: [MarketplaceService, ProximityRadarService],
  controllers: [MarketplaceController],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
