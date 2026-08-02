import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Master } from './master.entity';
import { MasterCatalogItem } from './master-catalog-item.entity';
import { User } from '../../users/user.entity';
import { ElevatedSession } from '../../auth/elevated-session.entity';
import { AuditLog } from '../../audit/audit-log.entity';
import { G1MastersService } from './g1-masters.service';
import { G1MastersController } from './g1-masters.controller';
import { AuthModule } from '../../auth/auth.module';

/**
 * GWS · Galaxia 1 — Maestros e Íconos del Vidrio
 * ------------------------------------------------------------
 * Módulo autocontenido de G1 (ver CLAUDE.md tabla G1). Gestiona:
 *   - Perfiles de autor independientes (Master, 1:1 con User)
 *   - Catálogo personal de autor por maestro (MasterCatalogItem)
 *
 * El patrón por galaxia: cada galaxia es un módulo NestJS bajo
 * src/galaxies/gN-masters que importa AuthModule (guards) y expone su
 * propio controller/service/entidades. G2 (marketplace) y G3
 * (community) viven en src/marketplace y src/community, y se
 * migrarán al esquema src/galaxies en una refactor posterior.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Master,
      MasterCatalogItem,
      User,
      ElevatedSession,
      AuditLog,
    ]),
    AuthModule,
  ],
  providers: [G1MastersService],
  controllers: [G1MastersController],
  exports: [G1MastersService],
})
export class G1MastersModule {}
