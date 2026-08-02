import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionRule } from './commission-rule.entity';
import { ElevatedSession } from '../auth/elevated-session.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * GWS · CommissionsModule — Política de comisiones del Marketplace
 * ------------------------------------------------------------
 * Transversal a las 6 Galaxias (liquidación). Estructura confirmada por
 * Jorge (G1 30/18 por tipo, resto 18 %, G5 20 %). Display-only: el cobro
 * real es del Payment_Vault (§3.1). La edición exige ADMIN + elevación y
 * queda en el audit log inmutable.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CommissionRule, ElevatedSession, AuditLog]),
    AuthModule,
  ],
  providers: [CommissionsService],
  controllers: [CommissionsController],
  exports: [CommissionsService],
})
export class CommissionsModule {}
