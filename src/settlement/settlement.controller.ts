import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  SETTLEMENT_CURRENCIES,
  SETTLEMENT_PAYMENT_METHODS,
  SETTLEMENT_POLICY,
  SETTLEMENT_POLICY_NOTE,
  USDT_NETWORKS,
  USDT_USD_PARITY,
} from './settlement.const';
import { DemoBalanceAdapter, IBalanceVerificationAdapter } from './settlement.adapter';
import { VerifyUsdtBalanceDto } from './dto/verify-usdt-balance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

/**
 * GWS · SettlementController — Soberanía Financiera (USD + USDT)
 * ------------------------------------------------------------
 * Política pública de settlement (monedas nativas, métodos de un clic,
 * paridad 1:1) + verificación DEMO de saldo USDT. El adaptador real de
 * red pertenece al Payment_Vault (§3.1) — aquí solo el contrato y la demo
 * sin credenciales. NINGÚN cambio de tarifa: solo la moneda de cobro.
 */
@Controller('settlement')
export class SettlementController {
  private readonly adapter: IBalanceVerificationAdapter;

  constructor() {
    this.adapter = new DemoBalanceAdapter();
  }

  /** Política soberana de settlement (display público). */
  @Get('meta')
  meta() {
    return {
      settlementCurrencies: [...SETTLEMENT_CURRENCIES],
      paymentMethods: [...SETTLEMENT_PAYMENT_METHODS],
      usdtNetworks: [...USDT_NETWORKS],
      parityUsdPerUsdt: USDT_USD_PARITY,
      policy: SETTLEMENT_POLICY,
      note: SETTLEMENT_POLICY_NOTE,
    };
  }

  /** Verificación DEMO de saldo USDT (flujo de un clic, sin red real). */
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('verify-usdt-balance')
  verifyUsdtBalance(@Body() dto: VerifyUsdtBalanceDto) {
    return this.adapter.verifyUsdtBalance({
      walletAddress: dto.walletAddress,
      network: dto.network,
      expectedUsd: dto.expectedUsd,
    });
  }
}
