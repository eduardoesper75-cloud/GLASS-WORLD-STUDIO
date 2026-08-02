import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Observable, Subject, from, merge, map, switchMap } from 'rxjs';
import { FoundingSlot } from './founding-slot.entity';
import { FoundingClaim } from './founding-claim.entity';

export interface FoundingSlotDto {
  galaxy: string;
  totalSlots: number;
  claimed: number;
  available: number;
  exhausted: boolean;
  enabled: boolean;
}

export interface ClaimResult {
  galaxy: string;
  claimed: number;
  totalSlots: number;
  available: number;
}

/** Payload mínimo de un evento SSE (evita depender del DOM lib en el backend). */
interface SseMessage {
  data: unknown;
}

/**
 * GWS · FoundationService — Cupos de fundación
 * ------------------------------------------------------------
 * getSlots()          : snapshot para el cliente (Portada, contadores).
 * claim()             : toma de cupo con límite DURO y atómico.
 * stream()            : SSE de cambios — la Portada se suscribe y los
 *                       contadores bajan en vivo sin polling.
 * listClaims(userId)  : claims de un usuario (para "mis cupos").
 *
 * El límite duro vive en la transacción, no en un UPDATE condicional
 * suelto: se bloquea la fila de founding_slots con pesimistic_write,
 * se cuenta founding_claims DENTRO de la misma transacción y se
 * recién ahí se decide. Dos claims simultáneos sobre el último cupo
 * no pueden superar el total: el segundo ve el count actualizado.
 *
 * Este claim es la INTENCIÓN de fundar, no el pago. La liquidación
 * va por Payment_Vault (CLAUDE.md §3.1, zona de exclusión) — acá no
 * entra ningún dato de pago ni de moneda.
 */
@Injectable()
export class FoundationService {
  /** Emisor de cambios: cada claim exitoso emite para que el SSE
   * refresque los contadores de todas las galaxias (un claim en g3
   * cambia también el total de cupos tomados visible de la fundación). */
  private readonly updates$ = new Subject<void>();

  constructor(
    @InjectRepository(FoundingSlot) private slotRepo: Repository<FoundingSlot>,
    @InjectRepository(FoundingClaim) private claimRepo: Repository<FoundingClaim>,
    private dataSource: DataSource,
  ) {}

  async getSlots(): Promise<FoundingSlotDto[]> {
    const slots = await this.slotRepo.find({ order: { galaxy: 'ASC' } });
    const counts = await this.claimRepo
      .createQueryBuilder('c')
      .select('c.galaxy', 'galaxy')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.galaxy')
      .getRawMany<{ galaxy: string; count: string }>();

    const claimByGalaxy: Record<string, number> = {};
    for (const row of counts) {
      claimByGalaxy[row.galaxy] = Number(row.count);
    }

    return slots.map((slot) => {
      const claimed = claimByGalaxy[slot.galaxy] ?? 0;
      return {
        galaxy: slot.galaxy,
        totalSlots: slot.totalSlots,
        claimed,
        available: Math.max(slot.totalSlots - claimed, 0),
        exhausted: claimed >= slot.totalSlots,
        enabled: slot.enabled,
      };
    });
  }

  async claim(userId: string, galaxy: string): Promise<ClaimResult> {
    const result = await this.dataSource.transaction(async (manager) => {
      const slot = await manager.findOne(FoundingSlot, {
        where: { galaxy },
        lock: { mode: 'pessimistic_write' },
      });
      if (!slot) throw new NotFoundException('Galaxia no configurada para fundación');

      const claimed = await manager.count(FoundingClaim, { where: { galaxy } });
      if (!slot.enabled) {
        throw new ConflictException('Los cupos de fundación de esta galaxia están pausados');
      }
      if (claimed >= slot.totalSlots) {
        throw new ConflictException(
          `Cupos de fundación agotados en esta galaxia (${claimed}/${slot.totalSlots})`,
        );
      }

      const existing = await manager.findOne(FoundingClaim, { where: { userId, galaxy } });
      if (existing) {
        throw new ConflictException('Ya tomaste tu cupo de fundación en esta galaxia');
      }

      await manager.save(manager.create(FoundingClaim, { userId, galaxy }));
      return {
        galaxy,
        claimed: claimed + 1,
        totalSlots: slot.totalSlots,
        available: slot.totalSlots - (claimed + 1),
      };
    });

    // Solo se notifica a los suscriptores si el claim EXISTE — un
    // conflicto (agotado/duplicado) no debe refrescar los contadores.
    this.updates$.next();
    return result;
  }

  async listClaims(userId: string): Promise<FoundingClaim[]> {
    return this.claimRepo.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }

  /**
   * SSE: emite un snapshot inicial y luego cada cambio. merge() une
   * el snapshot (desde getSlots) con las emisiones del Subject, y
   * switchMap re-carga el estado completo en cada cambio — el
   * cliente siempre recibe el estado entero, no deltas, así un
   * suscriptor nuevo que se conecta a mitad de camino se pone al
   * día sin sincronización extra.
   */
  stream(): Observable<SseMessage> {
    return merge(
      from(this.getSlots()),
      this.updates$.pipe(switchMap(() => from(this.getSlots()))),
    ).pipe(map((slots) => ({ data: slots })));
  }
}
