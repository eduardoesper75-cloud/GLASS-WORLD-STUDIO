import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultCategory } from './vault-category.entity';
import { VaultDocument } from './vault-document.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * GWS · VaultModule — Bóveda del Conocimiento (§3.5/§3.6)
 * ------------------------------------------------------------
 * La Bóveda es un sistema transversal (no una galaxia): biblioteca
 * técnica de la comunidad con taxonomía rigurosa (4 raíces + nivel 1),
 * control de duplicados/spam por hash de contenido y curación humana
 * bajo cláusulas safe-harbor de hosting neutral.
 *
 * NO es pago ni Payment_Vault: la membresía de acceso a galaxias la
 * resuelve GalaxyAccessGuard; la Bóveda publica contenido aprobado por
 * curadores. La búsqueda vectorial (RAG) es infraestructura futura
 * (CLAUDE.md §4).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([VaultCategory, VaultDocument, AuditLog]),
    AuthModule,
  ],
  providers: [VaultService],
  controllers: [VaultController],
  exports: [VaultService],
})
export class VaultModule {}
