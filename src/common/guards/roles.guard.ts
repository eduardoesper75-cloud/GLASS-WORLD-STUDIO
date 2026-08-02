import { SetMetadata, CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GwsRole } from '../enums/gws-role.enum';

export const ROLES_KEY = 'gws_roles';
/** Decorador de ruta: @Roles(GwsRole.MODERATOR_G3, GwsRole.ADMIN) */
export const Roles = (...roles: GwsRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * GWS · RolesGuard
 * ------------------------------------------------------------
 * Verifica que el usuario autenticado tenga uno de los roles
 * requeridos por la ruta. Esto es RBAC básico — NO reemplaza al
 * ElevationGuard para acciones críticas (ver enum
 * ACTIONS_REQUIRING_ELEVATION y elevation.guard.ts).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<GwsRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('No autenticado');

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Requiere uno de estos roles: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}
