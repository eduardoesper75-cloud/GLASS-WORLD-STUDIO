import {
  SetMetadata,
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { ElevatedSession } from '../../auth/elevated-session.entity';
import { ElevatedAction } from '../enums/gws-role.enum';

export const ELEVATION_KEY = 'gws_requires_elevation';
/** Decorador de ruta: @RequiresElevation('edit_liquidation_rules') */
export const RequiresElevation = (action: ElevatedAction) => SetMetadata(ELEVATION_KEY, action);

/**
 * GWS · ElevationGuard
 * ------------------------------------------------------------
 * Implementa CLAUDE.md §3.1/§3.5: tener rol ADMIN NO es suficiente
 * para tocar tarifas, reglas de liquidación, config de Payment_Vault,
 * o borrar cuentas. Se exige además una ElevatedSession activa y no
 * vencida (TOTP reciente). Sin sesión elevada válida, la acción se
 * rechaza aunque el usuario sea admin.
 *
 * Este guard corre DESPUÉS de RolesGuard en la cadena de guards de
 * cada endpoint crítico (ver ejemplo de uso en el controller de
 * liquidation-rules, a implementar en el mes de Marketplace).
 */
@Injectable()
export class ElevationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(ElevatedSession)
    private elevatedSessionRepo: Repository<ElevatedSession>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAction = this.reflector.getAllAndOverride<ElevatedAction>(ELEVATION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredAction) return true; // esta ruta no requiere elevación

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('No autenticado');

    const activeSession = await this.elevatedSessionRepo.findOne({
      where: {
        userId: user.id,
        revokedManually: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!activeSession) {
      throw new ForbiddenException(
        `La acción "${requiredAction}" requiere una sesión elevada activa. ` +
          `Reautenticate con contraseña + TOTP en /auth/elevate.`,
      );
    }

    // La request queda marcada para que el AuditLogService (a inyectar en
    // cada servicio crítico) sepa que esta acción corrió bajo elevación.
    request.gwsElevated = true;
    return true;
  }
}
