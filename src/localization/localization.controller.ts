import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { LocalizationService } from './localization.service';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';

/**
 * GWS · LocalizationController — geo y moneda de la Portada
 * ------------------------------------------------------------
 * Endpoints públicos de exhibición: la Portada los consulta para
 * ajustar idioma y moneda del visitante y convertir los montos de
 * los cupos de fundación. Sin autenticación (información no sensible)
 * y sin ningún contacto con datos financieros (CLAUDE.md §3.1).
 */
@Controller()
export class LocalizationController {
  constructor(private localizationService: LocalizationService) {}

  /** Geo resuelta del request (país/idioma/moneda de exhibición). */
  @Get('geo')
  getGeo(@Req() req: Request) {
    return this.localizationService.getGeo(req);
  }

  /** Cotización de monedas soportadas (demo, no live). */
  @Get('currencies')
  getCurrencies() {
    return this.localizationService.getQuote();
  }

  /** Conversión para exhibición: /currencies/convert?amount=100&from=USD&to=ARS */
  @Get('currencies/convert')
  convert(@Query() query: ConvertCurrencyDto) {
    return this.localizationService.convert(query.amount, query.from, query.to);
  }

  /** Todos los bloques del umbral (7 idiomas, Orden Maestra §4). */
  @Get('threshold/messages')
  thresholdMessages() {
    return this.localizationService.listThresholdMessages();
  }

  /** Un bloque del umbral: /threshold/message?lang=es (fallback a es). */
  @Get('threshold/message')
  thresholdMessage(@Query('lang') lang?: string) {
    return this.localizationService.getThresholdMessage(lang ?? 'es');
  }
}
