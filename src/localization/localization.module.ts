import { Module } from '@nestjs/common';
import { LocalizationService } from './localization.service';
import { LocalizationController } from './localization.controller';

/**
 * GWS · LocalizationModule — país/idioma/moneda (exhibición)
 * ------------------------------------------------------------
 * Sin repositorios ni estado: solo deriva información del request.
 * El contrato con el frontend: /geo, /currencies y
 * /currencies/convert devuelven datos de exhibición, nunca una
 * cotización de pago (la pasarela vive en Payment_Vault, CLAUDE.md
 * §3.1, y la integra Jorge cuando defina el proveedor final).
 */
@Module({
  providers: [LocalizationService],
  controllers: [LocalizationController],
  exports: [LocalizationService],
})
export class LocalizationModule {}
