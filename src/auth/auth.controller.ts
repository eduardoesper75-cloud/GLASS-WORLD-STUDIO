import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ElevateDto,
  SetupTotpInitDto,
  ConfirmTotpSetupDto,
  DisableTotpDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Límite estricto anti fuerza-bruta: 5 intentos por minuto por IP.
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { ttl: 60, limit: 5 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Requiere estar ya autenticado (JwtAuthGuard) con rol admin. Este
   * endpoint es el único punto de entrada para obtener una ElevatedSession
   * — ver CLAUDE.md §3.5 y ElevationGuard.
   */
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @UseGuards(JwtAuthGuard)
  @Post('elevate')
  elevate(@Body() dto: ElevateDto, @Req() req: Request & { user: { id: string } }) {
    const ip = req.ip ?? 'unknown';
    const userAgent = req.headers['user-agent'] ?? null;
    return this.authService.elevate(req.user.id, dto, ip, userAgent);
  }

  /**
   * Setup TOTP — paso 1: genera y devuelve el secreto (base32 + otpauth URL)
   * para escanear con la app de autenticación. El 2FA se activa recién en
   * /totp/confirm. Requiere sesión (JWT) + contraseña (anti-secuestro).
   * Rate limit: rotar el secreto 2FA no debe ser barato.
   */
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @UseGuards(JwtAuthGuard)
  @Post('totp/setup')
  setupTotpInit(@Body() dto: SetupTotpInitDto, @Req() req: Request & { user: { id: string } }) {
    return this.authService.setupTotpInit(req.user.id, dto);
  }

  /**
   * Setup TOTP — paso 2: confirma el código de la app y activa el 2FA.
   * Exige la contraseña de la cuenta (mismo motivo que setup) y rate limit
   * estricto: verificar códigos a ciegas no debe ser barato.
   */
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @UseGuards(JwtAuthGuard)
  @Post('totp/confirm')
  setupTotpConfirm(@Body() dto: ConfirmTotpSetupDto, @Req() req: Request & { user: { id: string } }) {
    return this.authService.setupTotpConfirm(req.user.id, dto);
  }

  /** Desactiva el 2FA — exige contraseña + código vigente (downgrade de
   * seguridad, ver auth.service.ts). */
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @UseGuards(JwtAuthGuard)
  @Post('totp/disable')
  setupTotpDisable(
    @Body() dto: DisableTotpDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    const ip = req.ip ?? 'unknown';
    return this.authService.setupTotpDisable(req.user.id, dto, ip);
  }

  /** Cortar la sesión elevada de forma manual. Rate limit para que un
   * token comprometido no pueda martillar la revocación de terceros. */
  @Throttle({ default: { ttl: 60, limit: 10 } })
  @UseGuards(JwtAuthGuard)
  @Post('elevate/revoke')
  revokeElevation(@Req() req: Request & { user: { id: string } }) {
    return this.authService.revokeElevation(req.user.id);
  }
}
