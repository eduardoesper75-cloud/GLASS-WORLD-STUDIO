import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BunkerSpecialist } from './bunker-specialist.entity';
import { BunkerServiceRequest } from './bunker-service-request.entity';
import { BunkerMembership } from './bunker-membership.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { ElevatedSession } from '../auth/elevated-session.entity';
import { AuthModule } from '../auth/auth.module';
import { BunkerService } from './bunker.service';
import { BunkerController } from './bunker.controller';

/**
 * GWS · BunkerModule — Búnker de Ingeniería Especializada
 * ------------------------------------------------------------
 * Red soberana de servicio técnico global: cartera élite verificada,
 * tickets Service On-Demand y membresía pro USD 50/mes con fidelización
 * (3m=10%, 6m=15%, 12m=20%). CERO comisiones (rectificación de la Orden).
 * Cobro real por Payment_Vault (§3.1); aquí display + estado.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BunkerSpecialist,
      BunkerServiceRequest,
      BunkerMembership,
      AuditLog,
      ElevatedSession,
    ]),
    AuthModule,
  ],
  providers: [BunkerService],
  controllers: [BunkerController],
  exports: [BunkerService],
})
export class BunkerModule {}
