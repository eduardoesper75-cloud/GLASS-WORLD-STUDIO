import {
  Body,
  Controller,
  Get,
  MethodNotAllowedException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar cuenta', description: 'Crea un usuario (ROLE anónimo hasta elevar). Rate limit: 5/min por IP.' })
  // Límite estricto anti fuerza-bruta: 5 intentos por minuto por IP.
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Iniciar sesión', description: 'Devuelve el par accessToken (JWT) + refreshToken y levanta la sesión HttpOnly.' })
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'GET no soportado', description: 'El login se hace con POST /auth/login. Devuelve 405 para no confundir a scanners.' })
  // GET en /auth/login no está soportado (login es POST). Un handler
  // explícito devuelve 405 Method Not Allowed en vez de 404 — la ruta
  // existe, el método no. Evita que un scanner confunda la ruta con
  // inexistente y fuerza usar el método correcto.
  @Get('login')
  loginMethodNotAllowed() {
    throw new MethodNotAllowedException('El login se hace con POST /auth/login');
  }

  /**
   * Requiere estar ya autenticado (JwtAuthGuard) con rol admin. Este
   * endpoint es el único punto de entrada para obtener una ElevatedSession
   * — ver CLAUDE.md §3.5 y ElevationGuard.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Elevar sesión', description: 'Requiere JWT + rol admin. Emite ElevatedSession (elevationToken) para endpoints que exigen elevación.' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: '2FA setup (paso 1)', description: 'Genera y devuelve el secreto TOTP (base32 + otpauth URL). Requiere JWT + contraseña.' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: '2FA confirmación (paso 2)', description: 'Confirma el código TOTP y activa el 2FA. Requiere JWT + contraseña.' })
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @UseGuards(JwtAuthGuard)
  @Post('totp/confirm')
  setupTotpConfirm(@Body() dto: ConfirmTotpSetupDto, @Req() req: Request & { user: { id: string } }) {
    return this.authService.setupTotpConfirm(req.user.id, dto);
  }

  /** Desactiva el 2FA — exige contraseña + código vigente (downgrade de
   * seguridad, ver auth.service.ts). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar 2FA', description: 'Downgrade de seguridad: exige contraseña + código TOTP vigente.' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revocar elevación', description: 'Corta la ElevatedSession manualmente.' })
  @Throttle({ default: { ttl: 60, limit: 10 } })
  @UseGuards(JwtAuthGuard)
  @Post('elevate/revoke')
  revokeElevation(@Req() req: Request & { user: { id: string } }) {
    return this.authService.revokeElevation(req.user.id);
  }
}
