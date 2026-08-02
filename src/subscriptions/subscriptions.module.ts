import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { UserSubscription } from './user-subscription.entity';
import { SubscriptionPricingService } from './subscription-pricing.service';
import { SubscriptionsController } from './subscriptions.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * GWS · SubscriptionsModule — Tarifario y membresías de acceso
 * ------------------------------------------------------------
 * Datos de configuración (planes, descuentos) + registros de
 * membresía que evalúa el GalaxyAccessGuard. El COBRO no vive acá:
 * es del Payment_Vault (CLAUDE.md §3.1, zona de exclusión). Este
 * módulo se limita a exhibir tarifas y a registrar/consultar el
 * estado de suscripción — la creación de registros hoy es un stub
 * admin para poder probar la transición post-fundación.
 *
 * Los precios seedados son el tarifario oficial dictado por Jorge
 * (Orden Maestra §2). Cambiarlos exige 'change_subscription_pricing'
 * con elevación + 2FA.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, UserSubscription]),
    AuthModule,
  ],
  providers: [SubscriptionPricingService],
  controllers: [SubscriptionsController],
  exports: [SubscriptionPricingService],
})
export class SubscriptionsModule {}
