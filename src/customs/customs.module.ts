import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomsHsCode } from './customs-hs-code.entity';
import { CustomsCountryParam } from './customs-country-param.entity';
import { CustomsFreightBand } from './customs-freight-band.entity';
import { CustomsService } from './customs.service';
import { CustomsController } from './customs.controller';

/**
 * GWS · CustomsModule — Motor aduanero/logístico (Orden Suprema 2026-08-02)
 * ------------------------------------------------------------
 * Cotización transparente de importaciones: HS/NCM + aranceles regionales +
 * IVA/GST + tasas + percepciones + flete estimado. Referencias versionadas
 * con fuente y fecha; display-only. El desglose se cableará al checkout
 * cuando se habilite la pasarela (Payment_Vault, §3.1).
 */
@Module({
  imports: [TypeOrmModule.forFeature([CustomsHsCode, CustomsCountryParam, CustomsFreightBand])],
  providers: [CustomsService],
  controllers: [CustomsController],
  exports: [CustomsService],
})
export class CustomsModule {}
