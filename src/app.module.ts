import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { CommunityModule } from './community/community.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { G1MastersModule } from './galaxies/g1-masters/g1-masters.module';
import { FoundationModule } from './foundation/foundation.module';
import { LocalizationModule } from './localization/localization.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { VaultModule } from './vault/vault.module';
import { PreferencesModule } from './preferences/preferences.module';
import { CommissionsModule } from './commissions/commissions.module';
import { CustomsModule } from './customs/customs.module';
import { UxModule } from './ux/ux.module';
import { BillboardsModule } from './billboards/billboards.module';
import { BunkerModule } from './bunker/bunker.module';
import { SettlementModule } from './settlement/settlement.module';
import { G6TechSheetsModule } from './galaxies/g6-tech-sheets/g6-tech-sheets.module';
import { EscrowModule } from './escrow/escrow.module';
import { typeOrmEntities } from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global (anti-DoS). 100 req/min/IP por defecto; las rutas
    // sensibles (auth/register/login, webhooks) llevan límites más estrictos
    // vía @Throttle() en el controller. Valores configurables por env.
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL_SECONDS ?? 60),
        limit: Number(process.env.THROTTLE_LIMIT_PER_MINUTE ?? 100),
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME ?? 'gws_dev',
      entities: typeOrmEntities,
      // Migraciones versionadas — VER src/database/migrations/ y MIGRATIONS.md.
      // synchronize:true está PROHIBIDO en producción (alteraría el esquema
      // solo, sin control de versiones ni rollback). En dev, las migraciones
      // también se ejecutan automáticamente (migrationsRun:true) para que la
      // app local siempre refleje el esquema versionado.
      synchronize: false,
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      migrationsRun: true,
      migrationsTableName: 'gws_migrations',
      // Una transacción POR migración (ver data-source.ts): evita 55P04 por
      // ADD VALUE de enum usado en una migración posterior.
      migrationsTransactionMode: 'each',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    CommunityModule,
    MarketplaceModule,
    // Galaxias modulares (ver CLAUDE.md tabla de galaxias):
    // G1 = perfiles de maestro con catálogo de autor independiente.
    // G2 (marketplace) y G3 (community) viven en src/marketplace y
    // src/community; se migrarán a src/galaxies/gN-* en una refactor.
    G1MastersModule,
    // Sistema de membresía fundadora (cupos de la Portada). Es
    // transversal: expone GalaxyAccessGuard para las galaxias que
    // quieran restringir acceso al agotarse sus cupos de fundación.
    FoundationModule,
    // Localización de exhibición: geo/idioma/moneda de la Portada.
    // Display-only — la pasarela de pagos es del Payment_Vault (§3.1).
    LocalizationModule,
    // Tarifario y membresías de suscripción (display + estado de acceso
    // para el guard). El cobro es del Payment_Vault (§3.1), fuera de aquí.
    SubscriptionsModule,
    // Bóveda del Conocimiento: biblioteca técnica transversal con
    // taxonomía rigurosa, dedup por hash y curación safe-harbor (§3.5/§3.6).
    VaultModule,
    // Persistencia de sesión: idioma/moneda del selector de la Portada.
    PreferencesModule,
    // Política de comisiones del Marketplace (estructura confirmada por
    // Jorge). Display-only; edición SOLO admin + elevación con audit log.
    CommissionsModule,
    // Motor aduanero/logístico (Orden Suprema 2026-08-02): cotización
    // estimada de importaciones (HS/NCM, aranceles, IVA, flete).
    CustomsModule,
    // Manifiesto de experiencia (Orden Suprema UX): contrato versionado
    // de flujos críticos ≤3 clics para el bucle de auditoría continua.
    UxModule,
    // Carteleras publicitarias dinámicas (Orden Suprema): USD 1/día por
    // cartelera, colas/slots por Galaxia. Display + estado; cobro real
    // Payment_Vault (§3.1). Pausa SOLO admin + elevación 'manage_billboards'.
    BillboardsModule,
    // Búnker de Ingeniería Especializada (Orden Suprema): cartera élite
    // verificada + tickets Service On-Demand. CERO comisión y membresía pro
    // USD 50/mes con fidelización (rectificación de la Orden).
    BunkerModule,
    // Soberanía Financiera (Orden Suprema): settlement nativo USD + USDT
    // (paridad 1:1). Dominio + display: declara monedas/métodos de un clic
    // y la política por módulo. El adaptador real de red (verificación de
    // saldos) pertenece al Payment_Vault (§3.1), inalterable para IA.
    SettlementModule,
    // Base preconfigurada de fichas técnicas (Orden Suprema, Galaxia 6):
    // autopredictor que completa la ficha oficial por patrón de catálogo +
    // formulario manual para piezas de autor. El vendedor siempre corrige
    // antes de publicar (nunca auto-publicación).
    G6TechSheetsModule,
    // Blindaje logístico y Escrow Inteligente (Orden Suprema): retención
    // temporal de fondos (USD/USDT) con liberación manual instantánea
    // ("Recibido conforme") o automática por categoría (24h/72h/7d/10d) sin
    // reclamo. Máquina de estados + estándares de embalaje certificado;
    // el movimiento real de fondos es del Payment_Vault (§3.1).
    EscrowModule,
  ],
  providers: [
    // Guard global: aplica el rate limit a TODAS las rutas automáticamente.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
