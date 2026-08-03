import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowHold } from './escrow-hold.entity';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { User } from '../users/user.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { ElevatedSession } from '../auth/elevated-session.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * GWS · EscrowModule — Blindaje logístico y Escrow Inteligente
 * ------------------------------------------------------------
 * Retención temporal y liberación automatizada de fondos (USD/USDT):
 * manual instantánea ("Recibido conforme") o automática por categoría
 * (24h/72h/7d/10d) si no hay reclamo. Máquina de estados; el movimiento
 * real de fondos es del Payment_Vault (§3.1). Reclamos resueltos solo por
 * admin + elevación ('manage_escrow_disputes').
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([EscrowHold, User, AuditLog, ElevatedSession]),
    AuthModule,
  ],
  controllers: [EscrowController],
  providers: [EscrowService],
})
export class EscrowModule {}
