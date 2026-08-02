import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsIn,
  IsBoolean,
  IsEmail,
  Matches,
  Min,
  Max,
  MaxLength,
  MinLength,
  ArrayMaxSize,
} from 'class-validator';
import { BUNKER_SPECIALTIES, BUNKER_SUPPORT_TYPES } from '../bunker.const';
import { ISO_ALPHA2_COUNTRY_CODES } from '../../common/iso/iso-3166.const';

/** PATCH del perfil de especialista — todos los campos opcionales. */
export class UpdateSpecialistDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  publicName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  professionalEmail?: string;

  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/)
  phoneE164?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  academicTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  issuingInstitution?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  yearsExperience?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  credentials?: { title: string; issuer: string; credentialId?: string }[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsIn(BUNKER_SPECIALTIES as unknown as string[], { each: true })
  specialties?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(BUNKER_SUPPORT_TYPES as unknown as string[], { each: true })
  supportTypes?: string[];

  @IsOptional()
  @IsIn(ISO_ALPHA2_COUNTRY_CODES as unknown as string[], {
    message: 'countryCode debe ser un código ISO 3166-1 alpha-2 válido (ej: AR, JP)',
  })
  countryCode?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  hourlyRateUsd?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
