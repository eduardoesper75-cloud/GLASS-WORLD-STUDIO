import { Body, Controller, Get, Post } from '@nestjs/common';
import { CustomsService } from './customs.service';
import { EstimateCustomsDto } from './dto/estimate-customs.dto';

/**
 * GWS · CustomsController — Motor aduanero/logístico
 * ------------------------------------------------------------
 * Público (sin sesión):
 *   GET /customs/hs-codes   — catálogo HS/NCM + aranceles de referencia.
 *   GET /customs/countries  — parámetros por país (IVA, tasas, percepciones).
 *   GET /customs/meta       — fuentes, bandas de flete, tipos y disclaimer.
 *   POST /customs/estimate  — desglose estimado de una importación.
 *
 * El motor es ESTIMADOR, no cotización vinculante (ver custom.const.ts).
 */
@Controller('customs')
export class CustomsController {
  constructor(private customsService: CustomsService) {}

  @Get('hs-codes')
  hsCodes() {
    return this.customsService.hsCodes();
  }

  @Get('countries')
  countries() {
    return this.customsService.countries();
  }

  @Get('meta')
  meta() {
    return this.customsService.meta();
  }

  @Post('estimate')
  estimate(@Body() dto: EstimateCustomsDto) {
    return this.customsService.estimate(dto);
  }
}
