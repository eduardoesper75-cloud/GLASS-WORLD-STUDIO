import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { EscrowHold } from './escrow-hold.entity';
import {
  ESCROW_CATEGORIES,
  ESCROW_CATEGORY_LABELS,
  ESCROW_CLAIM_GRACE_HOURS,
  ESCROW_DISPUTE_SLA_HOURS,
  ESCROW_NOTE,
  ESCROW_PACKAGING_STANDARDS,
  ESCROW_RELEASE_HOURS,
  ESCROW_RELEASE_LABELS,
  EscrowReleaseType,
  EscrowStatus,
} from './escrow.const';
import { CreateEscrowHoldDto } from './dto/create-escrow-hold.dto';
import { User } from '../users/user.entity';
import { AuditLog } from '../audit/audit-log.entity';

/**
 * GWS · EscrowService — Escrow Inteligente (máquina de estados endurecida)
 * ------------------------------------------------------------
 * Retención temporal de pagos (USD/USDT) con liberación automatizada:
 *   · Manual instantánea: "OK / Recibido conforme" del comprador → RELEASED.
 *   · Automática: vence la VENTANA DE RECLAMO (holdUntil + gracia de 24 h)
 *     sin reclamo → RELEASED (24h consumibles, 72h frágiles, 7d eléctricos,
 *     10d maquinaria).
 *   · Reclamo explícito → CLAIMED (congela la automática) → la contraparte
 *     puede responder → admin+elevación resuelve (release | refund) dentro
 *     del SLA por categoría; el vencimiento del SLA marca escalamiento
 *     auditable (nunca auto-libera: eso es Payment_Vault + Jorge).
 *
 * ENDURECIMIENTO E1/E2/E3/E8:
 *   - claimableUntil protege al comprador (E3): ventana de gracia post-
 *     vencimiento sin liberación automática.
 *   - @Version (optimistic lock, E2): un save con versión obsoleta se
 *     rechaza — el sweep nunca pisa un reclamo ni doble-libera.
 *   - Evidencias + respuesta del vendedor + SLA de disputa (E1).
 *   - Sweep explícito POST (E8): el GET es read-only; el POST ejecuta con
 *     ADMIN + elevación.
 * El movimiento REAL de fondos es del Payment_Vault (§3.1).
 */
@Injectable()
export class EscrowService {
  constructor(
    @InjectRepository(EscrowHold)
    private escrowRepo: Repository<EscrowHold>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  /** Matriz pública de liberación + protocolo de embalaje certificado. */
  releaseMatrix() {
    return {
      manualRelease:
        'Liberación manual instantánea: el comprador presiona "OK / Recibido conforme".',
      autoReleaseByCategory: Object.fromEntries(
        ESCROW_CATEGORIES.map((c) => [
          c,
          {
            label: ESCROW_CATEGORY_LABELS[c],
            releaseHours: ESCROW_RELEASE_HOURS[c],
            releaseLabel: ESCROW_RELEASE_LABELS[c],
            claimGraceHours: ESCROW_CLAIM_GRACE_HOURS,
            claimLabel: `${ESCROW_RELEASE_LABELS[c]} + ${ESCROW_CLAIM_GRACE_HOURS} h de gracia para reclamar`,
            disputeSlaHours: ESCROW_DISPUTE_SLA_HOURS[c],
          },
        ]),
      ),
      packagingStandards: ESCROW_PACKAGING_STANDARDS,
      hardeningNote:
        'La liberación automática NO se consume al vencer: se abre una ventana ' +
        `de ${ESCROW_CLAIM_GRACE_HOURS} h para reclamar sin liberación automática. ` +
        'El reclamo permite evidencias y respuesta de la contraparte; la resolución ' +
        'tiene SLA por categoría y el exceso marca escalamiento auditable. ' +
        'Nada se libera solo: la decisión final es del Comando (Payment_Vault §3.1).',
      note: ESCROW_NOTE,
    };
  }

  /** Fecha tope de la ventana de reclamo (holdUntil + gracia), con respaldo
   * para filas creadas antes de la migración de hardening. */
  private computeClaimableUntil(hold: EscrowHold): Date {
    if (hold.claimableUntil) return hold.claimableUntil;
    const base = new Date(hold.holdUntil);
    base.setHours(base.getHours() + ESCROW_CLAIM_GRACE_HOURS);
    return base;
  }

  /** Guarda con optimistic lock; si otro proceso cambió la versión, re-lee el
   * estado vigente y lo devuelve (el que llama decide — nunca se pisa). */
  private async saveWithLock(hold: EscrowHold): Promise<EscrowHold> {
    try {
      return await this.escrowRepo.save(hold);
    } catch (err) {
      if (err instanceof OptimisticLockVersionMismatchError) {
        const fresh = await this.escrowRepo.findOne({ where: { id: hold.id } });
        if (fresh) return fresh;
        throw new NotFoundException('Retención escrow no encontrada');
      }
      throw err;
    }
  }

  /**
   * Deriva el estado en cada lectura (sweep lazy). Endurecido (E3): la
   * liberación automática SOLO ocurre pasada la ventana de reclamo
   * (claimableUntil). Dentro de la gracia el sistema retiene para que el
   * comprador pueda reclamar. Además deriva el escalamiento de disputas (E1).
   */
  private async deriveStatus(hold: EscrowHold): Promise<EscrowHold> {
    if (hold.status === EscrowStatus.HELD) {
      const now = new Date();
      const claimableUntil = this.computeClaimableUntil(hold);
      if (now >= claimableUntil) {
        hold.status = EscrowStatus.RELEASED;
        hold.releaseType = EscrowReleaseType.AUTO;
        hold.releasedAt = now;
        return this.saveWithLock(hold);
      }
      return hold;
    }
    if (hold.status === EscrowStatus.CLAIMED) {
      const now = new Date();
      if (!hold.disputeEscalated && hold.disputeDueAt && now >= new Date(hold.disputeDueAt)) {
        hold.disputeEscalated = true;
        hold.disputeEscalatedAt = now;
        return this.saveWithLock(hold);
      }
      return hold;
    }
    return hold;
  }

  async createHold(buyerId: string, dto: CreateEscrowHoldDto) {
    if (dto.sellerId === buyerId) {
      throw new BadRequestException('No podés retener fondos a vos mismo');
    }
    const seller = await this.userRepo.findOne({ where: { id: dto.sellerId } });
    if (!seller) throw new NotFoundException('Vendedor no encontrado');

    const releaseHours = ESCROW_RELEASE_HOURS[dto.category];
    const holdUntil = new Date(Date.now() + releaseHours * 60 * 60 * 1000);
    const claimableUntil = new Date(holdUntil.getTime() + ESCROW_CLAIM_GRACE_HOURS * 60 * 60 * 1000);

    const hold = this.escrowRepo.create({
      buyerId,
      sellerId: dto.sellerId,
      orderRef: dto.orderRef,
      category: dto.category,
      amount: dto.amount,
      settlementCurrency: dto.settlementCurrency ?? 'USD',
      paymentMethod: dto.paymentMethod ?? 'card_usd',
      holdUntil,
      claimableUntil,
      status: EscrowStatus.HELD,
      releaseType: null,
      releasedAt: null,
      claimReason: null,
      claimedAt: null,
      resolutionNote: null,
      evidenceRefs: [],
    });
    const saved = await this.escrowRepo.save(hold);
    return {
      ...saved,
      autoReleaseLabel: ESCROW_RELEASE_LABELS[dto.category],
      claimUntilLabel:
        `${ESCROW_RELEASE_LABELS[dto.category]} + ${ESCROW_CLAIM_GRACE_HOURS} h de gracia para reclamar`,
      packagingStandard: ESCROW_PACKAGING_STANDARDS[dto.category],
      escrowNote:
        'Retención registrada (máquina de estados). El movimiento real de ' +
        'fondos lo ejecuta Payment_Vault (§3.1).',
    };
  }

  async listForUser(userId: string) {
    const holds = await this.escrowRepo.find({
      where: [{ buyerId: userId }, { sellerId: userId }],
      order: { createdAt: 'DESC' },
    });
    return Promise.all(holds.map((h) => this.deriveStatus(h)));
  }

  /** Liberación manual instantánea — "OK / Recibido conforme" (comprador). */
  async confirmReceipt(buyerId: string, holdId: string) {
    const hold = await this.escrowRepo.findOne({ where: { id: holdId } });
    if (!hold) throw new NotFoundException('Retención escrow no encontrada');
    if (hold.buyerId !== buyerId) {
      throw new ForbiddenException('Solo el comprador puede confirmar la recepción');
    }
    if (hold.status === EscrowStatus.CLAIMED) {
      throw new BadRequestException('Esta retención tiene un reclamo abierto');
    }
    if (hold.status !== EscrowStatus.HELD) {
      throw new BadRequestException('Esta retención ya no está vigente');
    }

    hold.status = EscrowStatus.RELEASED;
    hold.releaseType = EscrowReleaseType.MANUAL;
    hold.releasedAt = new Date();
    const saved = await this.saveWithLock(hold);
    return {
      ...saved,
      releaseNote:
        'Fondos liberados de inmediato al vendedor (Recibido conforme). ' +
        'La transferencia real la ejecuta Payment_Vault (§3.1).',
    };
  }

  /** Reclamo explícito → congela la liberación automática (E1/E3). */
  async claim(buyerId: string, holdId: string, reason: string, evidenceRefs: string[]) {
    const hold = await this.escrowRepo.findOne({ where: { id: holdId } });
    if (!hold) throw new NotFoundException('Retención escrow no encontrada');
    if (hold.buyerId !== buyerId) {
      throw new ForbiddenException('Solo el comprador puede reclamar sobre su retención');
    }
    if (hold.status !== EscrowStatus.HELD) {
      throw new BadRequestException('Solo se puede reclamar una retención vigente');
    }
    const now = new Date();
    const claimableUntil = this.computeClaimableUntil(hold);
    if (now >= claimableUntil) {
      throw new BadRequestException(
        'La ventana de reclamo venció: la liberación automática ya se consumió.',
      );
    }
    const cleanEvidence = (evidenceRefs ?? []).map((url) => this.assertEvidenceUrl(url));

    hold.status = EscrowStatus.CLAIMED;
    hold.claimReason = reason;
    hold.claimedAt = now;
    hold.evidenceRefs = cleanEvidence;
    hold.disputeSlaHours = ESCROW_DISPUTE_SLA_HOURS[hold.category];
    hold.disputeDueAt = new Date(now.getTime() + hold.disputeSlaHours * 60 * 60 * 1000);
    hold.disputeEscalated = false;
    hold.disputeEscalatedAt = null;
    const saved = await this.saveWithLock(hold);
    return {
      ...saved,
      claimNote:
        'Reclamo registrado: la liberación automática queda congelada. ' +
        `SLA de resolución: ${hold.disputeSlaHours} h. Lo resuelve Jorge (admin + elevación).`,
    };
  }

  /** Evidencias del reclamo — solo URLs HTTPS válidas (allowlist soberano). */
  private assertEvidenceUrl(raw: string): string {
    if (typeof raw !== 'string' || raw.length > 2048) {
      throw new BadRequestException('Evidencia inválida: URL demasiado larga');
    }
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      throw new BadRequestException('Evidencia inválida: URL no parseable');
    }
    if (url.protocol !== 'https:') {
      throw new BadRequestException('Evidencia inválida: solo HTTPS');
    }
    if (url.username || url.password || url.hostname.includes('\\')) {
      throw new BadRequestException('Evidencia inválida: URL con credenciales o caracteres no permitidos');
    }
    return url.href;
  }

  /** La contraparte (vendedor) responde el reclamo (E1) — no cambia el estado. */
  async respondClaim(sellerId: string, holdId: string, response: string) {
    const hold = await this.escrowRepo.findOne({ where: { id: holdId } });
    if (!hold) throw new NotFoundException('Retención escrow no encontrada');
    if (hold.sellerId !== sellerId) {
      throw new ForbiddenException('Solo el vendedor puede responder este reclamo');
    }
    if (hold.status !== EscrowStatus.CLAIMED) {
      throw new BadRequestException('Solo se responde un reclamo abierto');
    }
    hold.sellerClaimResponse = response;
    hold.sellerClaimRespondedAt = new Date();
    const saved = await this.saveWithLock(hold);
    return {
      ...saved,
      respondNote:
        'Tu versión de los hechos quedó registrada para la resolución del Comando.',
    };
  }

  /** Resolución de reclamo — SOLO admin + elevación (release | refund). */
  async resolveClaim(
    adminId: string,
    holdId: string,
    decision: 'release' | 'refund',
    note: string | undefined,
    ipAddress: string,
  ) {
    const hold = await this.escrowRepo.findOne({ where: { id: holdId } });
    if (!hold) throw new NotFoundException('Retención escrow no encontrada');
    if (hold.status !== EscrowStatus.CLAIMED) {
      throw new BadRequestException('Solo se puede resolver una retención con reclamo abierto');
    }

    if (decision === 'release') {
      hold.status = EscrowStatus.RELEASED;
      hold.releaseType = EscrowReleaseType.MANUAL;
      hold.releasedAt = new Date();
    } else {
      hold.status = EscrowStatus.REFUNDED;
      hold.releasedAt = null;
    }
    hold.resolutionNote = note ?? null;
    const saved = await this.saveWithLock(hold);

    await this.auditRepo.save(
      this.auditRepo.create({
        userId: adminId,
        action: 'escrow_claim_resolved',
        targetResource: `EscrowHold:${holdId}`,
        metadata: {
          decision,
          category: hold.category,
          amount: hold.amount,
          settlementCurrency: hold.settlementCurrency,
          claimReason: hold.claimReason,
          sellerClaimResponse: hold.sellerClaimResponse ?? null,
          evidenceRefs: hold.evidenceRefs,
          disputeEscalated: hold.disputeEscalated,
          note: note ?? null,
        },
        ipAddress,
        requiredElevation: true,
      }),
    );
    return {
      ...saved,
      resolutionNote:
        decision === 'release'
          ? 'Reclamo resuelto: fondos liberados al vendedor. Transferencia real por Payment_Vault (§3.1).'
          : 'Reclamo resuelto: fondos devueltos al comprador. Transferencia real por Payment_Vault (§3.1).',
    };
  }

  /**
   * Lista READ-ONLY de retenciones HELD cuyo vencimiento efectivo (ventana de
   * reclamo) ya pasó — sin efectos de escritura (E8). Para ejecutar la
   * liberación automática real usá processPendingAutoReleases (POST).
   */
  async listPendingAutoReleases(): Promise<EscrowHold[]> {
    const holds = await this.escrowRepo.find({ where: { status: EscrowStatus.HELD } });
    const now = new Date();
    return holds.filter((h) => now >= this.computeClaimableUntil(h));
  }

  /**
   * SWEEP EXPLÍCITO (E8) — procesa la liberación automática de retenciones con
   * ventana de reclamo vencida. ADMIN + elevación. Optimistic lock (E2): un
   * conflicto de versión no rompe el lote ni pisa un reclamo concurrente.
   */
  async processPendingAutoReleases(): Promise<{
    processed: number;
    released: number;
    skipped: number;
  }> {
    const holds = await this.escrowRepo.find({ where: { status: EscrowStatus.HELD } });
    const now = new Date();
    let released = 0;
    let skipped = 0;
    for (const h of holds) {
      if (now >= this.computeClaimableUntil(h)) {
        const derived = await this.deriveStatus(h);
        if (derived.status === EscrowStatus.RELEASED) released += 1;
        else skipped += 1;
      }
    }
    return { processed: holds.length, released, skipped };
  }

  /**
   * Marca como ESCALADAS las disputas (CLAIMED) cuyo SLA de resolución venció
   * (E1). No libera ni reembolsa nada — solo registra el escalamiento auditable
   * para que el Comando priorice. Se invoca en cada lectura de disputas.
   */
  async markEscalatedDisputes(): Promise<EscrowHold[]> {
    const holds = await this.escrowRepo.find({ where: { status: EscrowStatus.CLAIMED } });
    const now = new Date();
    const results: EscrowHold[] = [];
    for (const h of holds) {
      if (!h.disputeEscalated && h.disputeDueAt && now >= new Date(h.disputeDueAt)) {
        results.push(await this.deriveStatus(h));
      }
    }
    return results;
  }
}
