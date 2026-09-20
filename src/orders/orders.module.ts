import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { Shipment } from './entities/shipment.entity';
import { Address } from './entities/address.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Product } from '../marketplace/product.entity';
import { ProductVariant } from '../marketplace/product-variant.entity';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * GWS · OrdersModule — Checkout y Órdenes (P0)
 * ------------------------------------------------------------
 * Funda la brecha transversal P0-01: crea la entidad de compra persistida
 * que ancla `escrow_holds.orderRef`, `product_reviews.verifiedPurchase` y
 * la aplicación de `commission_rules`. Estado + snapshot de precios;
 * el dinero real lo mueve Payment_Vault (§3.1), fuera de agentes de IA.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Payment,
      Shipment,
      Address,
      User,
      Product,
      ProductVariant,
    ]),
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}