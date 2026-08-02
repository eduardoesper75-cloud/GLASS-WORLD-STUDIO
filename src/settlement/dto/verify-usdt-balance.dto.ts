import { IsIn, IsNumber, IsString, Length, Max, Min } from 'class-validator';
import { USDT_NETWORKS, UsdtNetwork } from '../settlement.const';

/**
 * GWS · Verificación de saldo USDT (demo — la red real es Payment_Vault).
 * La dirección se valida en el adaptador según la red elegida.
 */
export class VerifyUsdtBalanceDto {
  @IsString()
  @Length(34, 42, {
    message: 'La dirección USDT debe tener entre 34 y 42 caracteres',
  })
  walletAddress: string;

  @IsIn(USDT_NETWORKS, {
    message: `network debe ser uno de: ${USDT_NETWORKS.join(', ')}`,
  })
  network: UsdtNetwork;

  @IsNumber()
  @Min(0.01)
  @Max(1_000_000)
  expectedUsd: number;
}
