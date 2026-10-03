import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Body } from '@nestjs/common';
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
@ApiTags('customs')
@Controller('customs')
export class CustomsController {
  constructor(private customsService: CustomsService) {}

  @ApiOperation({ summary: 'Códigos HS/NCM', description: 'Catálogo HS/NCM + aranceles de referencia (público).' })
  @Get('hs-codes')
  hsCodes() {
    return this.customsService.hsCodes();
  }

  @ApiOperation({ summary: 'Parámetros por país', description: 'IVA, tasas, percepciones por país (público).' })
  @Get('countries')
  countries() {
    return this.customsService.countries();
  }

  @ApiOperation({ summary: 'Meta del motor aduanero', description: 'Fuentes, bandas de flete, tipos y disclaimer (público).' })
  @Get('meta')
  meta() {
    return this.customsService.meta();
  }

  @ApiOperation({ summary: 'Estimar importación', description: 'Desglose ESTIMADO de una importación (no vinculante).' })
  @Post('estimate')
  estimate(@Body() dto: EstimateCustomsDto) {
    return this.customsService.estimate(dto);
  }
}
