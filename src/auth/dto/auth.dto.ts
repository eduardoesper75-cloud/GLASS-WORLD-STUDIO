import { IsEmail, IsString, MinLength, MaxLength, IsBoolean, Equals, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  /** El registro NO se completa si esto no es true. La honestidad
   * regulatoria (CLAUDE.md §4, "para qué registra") empieza acá: no
   * hay checkbox premarcado ni default en el DTO. */
  @IsBoolean()
  @Equals(true, { message: 'Debe aceptar la nota de privacidad para registrarse' })
  privacyAccepted: boolean;

  @IsIn(['es', 'en'])
  preferredLanguage: string;
}

export class LoginDto {
  /** Acepta email o username indistintamente — se resuelve en el service. */
  @IsString()
  identifier: string;

  @IsString()
  password: string;
}

export class ElevateDto {
  @IsString()
  password: string;

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
  @IsString()
  password: string;
}

/** Confirma la activación de TOTP: el código que el usuario ve en su
 * app de autenticación, verificado contra el secreto generado en setup.
 * Exige la contraseña por la misma razón que setup (anti-secuestro 2FA). */
export class ConfirmTotpSetupDto {
  @IsString()
  password: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6, { message: 'El código TOTP tiene 6 dígitos' })
  code: string;
}

/** Desactivar 2FA es una acción sensible (downgrade de seguridad de la
 * cuenta): exige la contraseña actual + un código TOTP válido. */
export class DisableTotpDto {
  @IsString()
  password: string;

  @IsString()
  @MinLength(6)
  @MaxLength(6, { message: 'El código TOTP tiene 6 dígitos' })
  totpCode: string;
}
