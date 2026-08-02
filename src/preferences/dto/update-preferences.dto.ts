import { IsIn, IsOptional } from 'class-validator';
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES } from '../../localization/currency.const';

/**
 * GWS · UpdatePreferencesDto — persistencia de sesión (Portada)
 * -------------------------------------------------------------
 * Solo se puede elegir entre los idiomas/monedas que la plataforma
 * realmente soporta (whitelists de currency.const.ts). preferredLanguage
 * se sobreescribe SOLO si se envía — la cuenta ya trae un default.
 */
export class UpdatePreferencesDto {
  @IsOptional()
  @IsIn(SUPPORTED_LANGUAGES as unknown as string[])
  preferredLanguage?: string;

  @IsOptional()
  @IsIn(SUPPORTED_CURRENCIES as unknown as string[])
  preferredCurrency?: string;
}
