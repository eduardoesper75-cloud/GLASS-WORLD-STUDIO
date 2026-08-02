import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  COUNTRY_META,
  COVERAGE_PERCENT,
  DEMO_RATES,
  SUPPORTED_LANGUAGES,
  SUPPORTED_CURRENCIES,
  CurrencyCode,
} from './currency.const';
import {
  THRESHOLD_MESSAGES,
  getThresholdMessage,
  ThresholdMessage,
} from './threshold-messages.const';

export interface GeoResult {
  countryCode: string | null;
  countryName: string | null;
  language: string;
  currency: CurrencyCode;
  /** 'header' = derivado del request (x-country-code/cf-ipcountry);
   *  'default' = no se pudo resolver, se cae a un default honesto. */
  resolvedFrom: 'header' | 'default';
}

export interface CurrencyQuote {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  updatedAt: string;
  live: boolean;
  provider: 'static-demo';
  coveragePercent: number;
}

/**
 * GWS · LocalizationService — geo e idioma/moneda de exhibición
 * ------------------------------------------------------------
 * Resuelve la ubicación del visitante SIN guardar nada (estado
 * efímero del request): país por header proxy/CF, idioma por
 * Accept-Language, moneda por tabla país→moneda. Cuando el país no
 * se puede resolver se devuelve un default EXPLÍCITO con
 * resolvedFrom='default' — nunca se asume una ubicación real de
 * alguien que no la compartió (mismo criterio que el radar de G2).
 *
 * convert() es matemática de exhibición sobre DEMO_RATES. No es un
 * servicio financiero: no cierra cotización ni toca Payment_Vault.
 */
@Injectable()
export class LocalizationService {
  getGeo(req: Request): GeoResult {
    const raw = req.headers['x-country-code'] ?? req.headers['cf-ipcountry'];
    const candidate = typeof raw === 'string' ? raw.trim().toUpperCase().slice(0, 2) : null;
    const meta = candidate ? COUNTRY_META[candidate] : undefined;

    // Preferencia explícita del usuario (selector de la Portada) manda por
    // sobre la derivación por país: x-gws-lang / x-gws-currency los setea el
    // frontend desde el perfil persistido (PUT /preferences / localStorage).
    const explicitLang = this.headerValue(req.headers['x-gws-lang']);
    const explicitCurrency = this.headerValue(req.headers['x-gws-currency']);

    const language =
      explicitLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(explicitLang)
        ? explicitLang
        : this.pickLanguage(req.headers['accept-language'], meta?.language);
    const currency =
      explicitCurrency && (SUPPORTED_CURRENCIES as readonly string[]).includes(explicitCurrency)
        ? (explicitCurrency as CurrencyCode)
        : (meta?.currency ?? 'USD');

    return {
      countryCode: meta?.countryCode ?? null,
      countryName: meta?.name ?? null,
      language,
      currency,
      resolvedFrom: meta ? 'header' : 'default',
    };
  }

  private headerValue(value: string | string[] | undefined): string | null {
    if (value === undefined) return null;
    const v = Array.isArray(value) ? value[0] : value;
    return v?.trim().slice(0, 8) || null;
  }

  getQuote(): CurrencyQuote {
    return {
      base: 'USD',
      rates: { ...DEMO_RATES },
      updatedAt: new Date(0).toISOString(),
      live: false,
      provider: 'static-demo',
      coveragePercent: COVERAGE_PERCENT,
    };
  }

  /** Lista completa de los bloques del umbral (7 idiomas, Orden §4). */
  listThresholdMessages(): { available: string[]; messages: readonly ThresholdMessage[] } {
    return {
      available: THRESHOLD_MESSAGES.map((m) => m.code),
      messages: THRESHOLD_MESSAGES,
    };
  }

  /** Un bloque del umbral por idioma (fallback a es). */
  getThresholdMessage(lang: string): ThresholdMessage {
    return getThresholdMessage(lang);
  }

  convert(amount: number, from: CurrencyCode, to: CurrencyCode): {
    amount: number;
    from: CurrencyCode;
    to: CurrencyCode;
    converted: number;
    rate: number;
    live: false;
  } {
    const fromRate = DEMO_RATES[from];
    const toRate = DEMO_RATES[to];
    if (fromRate === undefined || toRate === undefined) {
      throw new BadRequestException('Moneda no soportada');
    }
    const converted = Math.round((amount / fromRate) * toRate * 100) / 100;
    return { amount, from, to, converted, rate: toRate / fromRate, live: false };
  }

  private pickLanguage(acceptLanguage: string | undefined, fallback?: string): string {
    if (acceptLanguage) {
      const first = acceptLanguage
        .split(',')[0]
        .trim()
        .toLowerCase()
        .split('-')[0];
      if ((SUPPORTED_LANGUAGES as readonly string[]).includes(first)) return first;
    }
    if (fallback && (SUPPORTED_LANGUAGES as readonly string[]).includes(fallback)) {
      return fallback;
    }
    return 'es';
  }
}
