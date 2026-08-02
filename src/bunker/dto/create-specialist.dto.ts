import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsIn,
  IsEmail,
  Matches,
  Min,
  Max,
  MinLength,
  MaxLength,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { BUNKER_SPECIALTIES, BUNKER_SUPPORT_TYPES } from '../bunker.const';
import { ISO_ALPHA2_COUNTRY_CODES } from '../../common/iso/iso-3166.const';

/**
 * GWS · Alta/matriculación de especialista del Búnker (Orden Suprema)
 * ------------------------------------------------------------
 * Formulario maestro de registro y validación de perfiles: identidad y
 * contacto (privados, solo despacho), credenciales académicas/legales,
 * especialidad/ámbito y disponibilidad/cobertura. El userId sale del
 * token (nunca del body). La verificación (verified) la marca SOLO el
 * admin con elevación — el alta en sí no eleva nada.
 */
export class CreateSpecialistDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  publicName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(160)
  fullName: string;

  @IsEmail({}, { message: 'Ingresá un correo profesional válido' })
  @MaxLength(200)
  professionalEmail: string;

  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Teléfono en formato E.164 con código internacional (ej: +54911...)',
  })
  phoneE164: string;

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  nationality: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  academicTitle: string;

  @IsString()
  @MinLength(3)
  @MaxLength(80)
  registrationNumber: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  issuingInstitution: string;

  @IsInt()
  @Min(0)
  @Max(60)
  yearsExperience: number;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  headline: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsArray()
  @ArrayMaxSize(20)
  credentials: {
    title: string;
    issuer: string;
    credentialId?: string;
  }[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsIn(BUNKER_SPECIALTIES as unknown as string[], { each: true })
  specialties: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(BUNKER_SUPPORT_TYPES as unknown as string[], { each: true })
  supportTypes: string[];

  @IsIn(ISO_ALPHA2_COUNTRY_CODES as unknown as string[], {
    message: 'countryCode debe ser un código ISO 3166-1 alpha-2 válido (ej: AR, JP)',
  })
  countryCode: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  hourlyRateUsd?: number;
}
