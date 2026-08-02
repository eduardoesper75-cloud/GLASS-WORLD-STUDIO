/**
 * GWS · BalanceVerificationAdapter — verificación de saldos USDT
 * ------------------------------------------------------------
 * CONTRATO DE INTERFAZ (Orden Suprema Soberanía Financiera §3):
 *   "integrar los adaptadores necesarios para la verificación de saldos en
 *   redes de USDT de bajo costo, garantizando que el usuario elija su método
 *   de pago preferido con un solo clic y sin demoras en la confirmación."
 *
 * GOBIERNA CLAUDE.md §3.1 (Zona de Exclusión):
 *   - La implementación de PRODUCCIÓN (conexión real a TRC-20/Polygon,
 *     wallets, credenciales) pertenece al Payment_Vault y es código
 *     INALTERABLE para agentes de IA. Solo Jorge, con elevación de
 *     privilegio + 2FA, la implementa o configura.
 *   - Este archivo entrega el CONTRATO + una implementación DEMO que NO
 *     toca ninguna red, NO guarda credenciales y NO mueve dinero. Sirve
 *     para validar el flujo de la Portada y como especificación de lo que
 *     el Payment_Vault debe cumplir.
 *
 * Otra implementación (ProductBalanceVerificationAdapter) puede vivir en
 * Payment_Vault siempre que respete la misma firma y devuelva:
 *   { confirmed, reason?, balanceUsdt?, txRef? }
 */

export interface UsdtBalanceCheck {
  walletAddress: string;
  network: 'trc20' | 'polygon';
  expectedUsd: number;
}

export interface UsdtBalanceResult {
  verified: boolean;
  /** Por qué falló la verificación (demo: motivo esperado). */
  reason?: string;
  /** Saldo disponible en USDT si la red respondió (demo: null). */
  balanceUsdt?: number | null;
  /** Referencia de la confirmación on-chain (demo: null — solo Payment_Vault). */
  txRef?: string | null;
  /** Provisorio: la verificación real de red es del Payment_Vault (§3.1). */
  source: 'demo' | 'payment_vault';
}

export interface IBalanceVerificationAdapter {
  verifyUsdtBalance(check: UsdtBalanceCheck): Promise<UsdtBalanceResult>;
}

/**
 * GWS · DemoBalanceAdapter — implementación DEMO
 * ------------------------------------------------------------
 * NO se conecta a ninguna red; valida únicamente la forma del input
 * (dirección y monto) para que la Portada pueda probar el flujo de
 * "un clic". Nunca devuelve `verified: true` de verdad: en demo la
 * acreditación queda "pendiente de confirmación on-chain".
 */
export class DemoBalanceAdapter implements IBalanceVerificationAdapter {
  async verifyUsdtBalance(check: UsdtBalanceCheck): Promise<UsdtBalanceResult> {
    const addr = (check.walletAddress ?? '').trim();
    const invalidAddr = !/^(T[1-9A-HJ-NP-Za-km-z]{33})$/.test(addr)
      && !/^(0x[0-9a-fA-F]{40})$/.test(addr);
    if (invalidAddr) {
      return {
        verified: false,
        reason: 'Dirección no reconocida (esperaba T-address TRC-20 o 0x-address Polygon).',
        balanceUsdt: null,
        txRef: null,
        source: 'demo',
      };
    }
    if (!(check.expectedUsd > 0)) {
      return {
        verified: false,
        reason: 'expectedUsd debe ser mayor que cero.',
        balanceUsdt: null,
        txRef: null,
        source: 'demo',
      };
    }
    return {
      verified: false,
      reason:
        'Modo demo: la verificación de saldo en red se confirma por Payment_Vault (§3.1). ' +
        'El flujo de un clic queda validado; la acreditación on-chain la resuelve Jorge.',
      balanceUsdt: null,
      txRef: null,
      source: 'demo',
    };
  }
}
