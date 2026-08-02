import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

export interface JwtPayload {
  sub: string;
  role: string;
  email: string;
  tokenVersion: number;
}

/**
 * GWS · JwtAuthGuard
 * ------------------------------------------------------------
 * Guard mínimo: valida el JWT del header Authorization y adjunta
 * el payload decodificado (id, role, email) a request.user. Este
 * guard NO valida roles (eso es RolesGuard) ni elevación (eso es
 * ElevationGuard) — hace una sola cosa: confirmar que hay una
 * sesión válida.
 *
 * Revocación server-side (gws-security-hardening): además de la
 * firma, se compara tokenVersion y role del payload contra la fila
 * en base de datos. Así un cambio de rol o de 2FA invalida los
 * tokens en circulación DE INMEDIATO (tokenVersion++) en vez de
 * esperar la expiración de 2 h. Costo: un SELECT por request — es
 * el tradeoff correcto para que la revocación sea real.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto');
    }
    const token = authHeader.slice('Bearer '.length);
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'role', 'tokenVersion'],
    });
    if (!user) throw new UnauthorizedException('Cuenta no encontrada');

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException(
        'Sesión revocada: reautentícate para obtener un token nuevo',
      );
    }
    // El rol es fuente de verdad en DB, no en el token: si cambió el rol,
    // el token viejo deja de servir aunque no haya expirado.
    if (user.role !== payload.role) {
      throw new UnauthorizedException(
        'Tu rol cambió desde que iniciaste sesión — reautentícate',
      );
    }

    request.user = { id: payload.sub, role: payload.role, email: payload.email };
    return true;
  }
}
