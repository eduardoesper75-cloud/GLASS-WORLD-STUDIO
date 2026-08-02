import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoundingSlot } from './founding-slot.entity';
import { FoundingClaim } from './founding-claim.entity';
import { FoundationService } from './foundation.service';
import { FoundationController } from './foundation.controller';
import { GalaxyAccessGuard } from './guards/galaxy-access.guard';
import { AuthModule } from '../auth/auth.module';
import { UserSubscription } from '../subscriptions/user-subscription.entity';

/**
 * GWS · FoundationModule — Cupos de fundación
 * ------------------------------------------------------------
 * Transversal a las 6 Galaxias (no es una galaxia en sí: es el
 * sistema de membresía fundadora de la Portada). Expone:
 *   - FoundationService  : slots, claim transaccional, SSE.
 *   - GalaxyAccessGuard  : barrera @GalaxyAccess('gN') reutilizable
 *     por cualquier módulo de galaxia que la importe.
 *
 * Al igual que el resto de la plataforma, NO toca datos de pago
 * (CLAUDE.md §3.1): el claim es intención, la liquidación es del
 * Payment_Vault, fuera del alcance de este módulo.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([FoundingSlot, FoundingClaim, UserSubscription]),
    AuthModule,
  ],
  providers: [FoundationService, GalaxyAccessGuard],
  controllers: [FoundationController],
  exports: [FoundationService, GalaxyAccessGuard],
})
export class FoundationModule {}
