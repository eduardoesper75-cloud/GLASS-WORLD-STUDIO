import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoundingSlot } from '../founding-slot.entity';
import { FoundingClaim } from '../founding-claim.entity';
import { isReservedGalaxy } from '../galaxies.const';
import { UserSubscription } from '../../subscriptions/user-subscription.entity';
import { SubscriptionStatus } from '../../subscriptions/subscription.enums';

export const GALAXY_ACCESS_KEY = 'gws_galaxy_access';

/**
 * Decorador de ruta: @GalaxyAccess('g4')
 * Aplica la barrera de membresía fundadora de esa galaxia.
 */
export const GalaxyAccess = (galaxy: string) => SetMetadata(GALAXY_ACCESS_KEY, galaxy);

/**
 * GWS · GalaxyAccessGuard — barrera de membresía por galaxia
 * ------------------------------------------------------------
 * Reglas (en orden):
 *
 * 1. System off   : FOUNDATION_GATES_ENABLED !== 'true' → deja pasar.
 *                   Default OFF: la barrera no bloquea a nadie hasta
 *                   que Jorge la encienda por env (feature flag por
 *                   galaxia, CLAUDE.md §3.4).
 * 2. Reservadas   : g4/g5 están reservadas (CLAUDE.md §1) → exigen
 *                   membresía (claim o suscripción) o rol ADMIN,
 *                   salvo override FOUNDATION_GATES_RESERVED=false.
 * 3. Fundación abierta : si la galaxia tiene cupos libres → deja
 *                   pasar (mientras haya cupos gratis, cualquiera
 *                   puede mirar la galaxia antes de decidir fundar).
 * 4. Agotada      : TRANSIción AUTOMÁTICA post-fundación (Orden
 *                   Maestra §1). Cuando los contadores llegan al
 *                   límite, el guard pasa a exigir membresía: claim
 *                   de fundador (acceso vitalicio) O suscripción
 *                   activa (paga) O rol ADMIN. Nada de reinicios:
 *                   la condición se evalúa en cada request.
 *
 * El rol ADMIN siempre pasa: es el camino de recuperación si un
 * flag se configura mal y deja fuera a todos (kill switch humano,
 * no de agente).
 */
@Injectable()
export class GalaxyAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(FoundingSlot) private slotRepo: Repository<FoundingSlot>,
    @InjectRepository(FoundingClaim) private claimRepo: Repository<FoundingClaim>,
    @InjectRepository(UserSubscription) private subRepo: Repository<UserSubscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const galaxy = this.reflector.getAllAndOverride<string>(GALAXY_ACCESS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!galaxy) return true;

    // Regla 1: sistema apagado por defecto.
    if (process.env.FOUNDATION_GATES_ENABLED !== 'true') return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id?: string; role?: string } | undefined;

    // El admin siempre entra (regla de recuperación).
    if (user?.role === 'admin') return true;

    // Regla 2: galaxias reservadas.
    const reserved = isReservedGalaxy(galaxy);
    const reserveGates = process.env.FOUNDATION_GATES_RESERVED !== 'false';
    if (reserved && reserveGates) {
      return this.requireMembershipOrReject(request, galaxy);
    }

    // Regla 3: sin slot configurado o deshabilitado → sin barrera.
    const slot = await this.slotRepo.findOne({ where: { galaxy } });
    if (!slot || !slot.enabled) return true;

    // Regla 4: mientras haya cupos libres, el acceso es público.
    const claimed = await this.claimRepo.count({ where: { galaxy } });
    if (claimed < slot.totalSlots) return true;

    // Cupos agotados: activación automática del umbral de membresía.
    return this.requireMembershipOrReject(request, galaxy);
  }

  /** Membresía = cupo de fundador (claim) O suscripción activa.
   * El claim da acceso vitalicio; la suscripción vence y el guard lo
   * evalúa por fecha en cada request (transición automática §1). */
  private async requireMembershipOrReject(
    request: { user?: { id?: string } },
    galaxy: string,
  ): Promise<boolean> {
    if (!request.user?.id) {
      throw new ForbiddenException(
        `El acceso a ${galaxy} quedó reservado a fundadores y suscriptores — inicia sesión`,
      );
    }
    const userId = request.user.id;

    const claim = await this.claimRepo.findOne({ where: { userId, galaxy } });
    if (claim) return true;

    const sub = await this.subRepo.findOne({
      where: { userId, galaxy, status: SubscriptionStatus.ACTIVE },
    });
    if (sub && sub.paidThrough > new Date()) return true;

    throw new ForbiddenException(
      `Los cupos de fundación de ${galaxy} están agotados. Suscríbete a esta galaxia o toma un cupo de fundación para entrar.`,
    );
  }
}
