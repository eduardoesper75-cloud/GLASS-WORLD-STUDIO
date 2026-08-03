import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdBillboard } from './ad-billboard.entity';
import { AdCampaign } from './ad-campaign.entity';
import { BillboardsService } from './billboards.service';
import { BillboardsController } from './billboards.controller';
import { AuditLog } from '../audit/audit-log.entity';
import { ElevatedSession } from '../auth/elevated-session.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * GWS · Carteleras publicitarias dinámicas — módulo transversal.
 * Display + estado de reserva; el cobro es del Payment_Vault (§3.1).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AdBillboard, AdCampaign, AuditLog, ElevatedSession]),
    AuthModule,
  ],
  controllers: [BillboardsController],
  providers: [BillboardsService],
})
export class BillboardsModule {}
