import { Module } from '@nestjs/common';
import { SettlementController } from './settlement.controller';
import { DemoBalanceAdapter } from './settlement.adapter';

/**
 * GWS · SettlementModule — Soberanía Financiera (USD + USDT)
 * ------------------------------------------------------------
 * Dominio + display del settlement nativo: monedas, métodos de un clic y
 * paridad 1:1. Sin tablas propias (las columnas de settlement viven en los
 * módulos económicos: bunker_memberships y ad_campaigns). El adaptador real
 * de red es del Payment_Vault (§3.1) — aquí solo el contrato + demo.
 */
@Module({
  controllers: [SettlementController],
  providers: [DemoBalanceAdapter],
})
export class SettlementModule {}
