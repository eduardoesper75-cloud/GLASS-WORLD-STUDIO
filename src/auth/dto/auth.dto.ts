import { IsEmail, IsString, MinLength, MaxLength, IsBoolean, Equals, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Eduardo Esper', description: 'Nombre completo visible' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ example: 'esper.eduardo@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'eduardo_esper', description: 'Nombre de usuario único' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: 'Mínimo 8 caracteres', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  /** El registro NO se completa si esto no es true. La honestidad
   * regulatoria (CLAUDE.md §4, "para qué registra") empieza acá: no
   * hay checkbox premarcado ni default en el DTO. */
  @ApiProperty({ description: 'Debe ser true: aceptación de la nota de privacidad', examples: [true] })
  @IsBoolean()
  @Equals(true, { message: 'Debe aceptar la nota de privacidad para registrarse' })
  privacyAccepted: boolean;

  @ApiProperty({ enum: ['es', 'en'], example: 'es' })
  @IsIn(['es', 'en'])
  preferredLanguage: string;
}

export class LoginDto {
  /** Acepta email o username indistintamente — se resuelve en el service. */
  @ApiProperty({ example: 'eduardo_esper', description: 'Email o username' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'supersecreto' })
  @IsString()
  password: string;
}

export class ElevateDto {
  @ApiProperty({ description: 'Contraseña de la cuenta (re-autenticación)' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Código TOTP de 6 dígitos', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Código TOTP inválido' })
  totpCode: string;
}

/**
 * Setup TOTP — paso 1: exige la CONTRASEÑA de la cuenta. Un JWT robado
 * solo no puede rotar el secreto 2FA (el atacante tendría que conocer
 * además la contraseña) — ver gws-security-hardening.
 */
export class SetupTotpInitDto {
  @ApiProperty({ description: 'Contraseña de la cuenta (anti-secuestro 2FA)' })
  @IsString()
  password: string;
}

/** Confirma la activación de TOTP: el código que el usuario ve en su
 * app de autenticación, verificado contra el secreto generado en setup.
 * Exige la contraseña por la misma razón que setup (anti-secuestro 2FA). */
export class ConfirmTotpSetupDto {
  @ApiProperty({ description: 'Contraseña de la cuenta' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Código TOTP de 6 dígitos', minLength: 6, maxLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(6, { message: 'El código TOTP tiene 6 dígitos' })
  code: string;
}

/** Desactivar 2FA es una acción sensible (downgrade de seguridad de la
 * cuenta): exige la contraseña actual + un código TOTP válido. */
export class DisableTotpDto {
  @ApiProperty({ description: 'Contraseña de la cuenta' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Código TOTP de 6 dígitos', minLength: 6, maxLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(6, { message: 'El código TOTP tiene 6 dígitos' })
  totpCode: string;
}
