import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { BUNKER_MACHINE_TYPES, BUNKER_URGENCIES } from '../bunker.const';

/**
 * GWS · BunkerServiceRequest — ticket técnico Service On-Demand
 * ------------------------------------------------------------
 * El usuario describe el síntoma con el mayor detalle técnico posible:
 * códigos de error, curva térmica inestable, vibraciones. El motor lo
 * conecta con el especialista disponible por región o remoto.
 */
export class CreateServiceRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(20, {
    message: 'Describí el síntoma con detalle (mínimo 20 caracteres)',
  })
  symptom: string;

  @IsIn(BUNKER_MACHINE_TYPES as unknown as string[])
  machineType: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  errorCodes?: string[];

  @IsOptional()
  @IsString()
  thermalCurve?: string;

  @IsOptional()
  @IsIn(BUNKER_URGENCIES as unknown as string[])
  urgency?: string;
}
