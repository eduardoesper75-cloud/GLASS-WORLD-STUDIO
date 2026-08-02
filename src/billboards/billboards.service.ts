import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AdBillboard } from './ad-billboard.entity';
import { AdCampaign } from './ad-campaign.entity';
import { AdBillingStatus, AdCampaignStatus, AD_AVAILABILITY_HORIZON_DAYS } from './billboards.const';
import { CreateAdCampaignDto } from './dto/create-ad-campaign.dto';
import { AuditLog } from '../audit/audit-log.entity';

interface Range {
  startDate: string;
  endDate: string;
}

@Injectable()
export class BillboardsService {
  constructor(
    @InjectRepository(AdBillboard) private billboardRepo: Repository<AdBillboard>,
    @InjectRepository(AdCampaign) private campaignRepo: Repository<AdCampaign>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  // ---------- Utilidades de fecha (UTC, comparación lexicográfica) ----------

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private addDays(dateStr: string, n: number): string {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }

  private isValidDate(dateStr: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const d = new Date(dateStr + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
  }

  // ---------- Ocupación ----------

  private async occupiedRanges(billboardId: string): Promise<AdCampaign[]> {
    return this.campaignRepo.find({
      where: {
        billboardId,
        status: In([
          AdCampaignStatus.SCHEDULED,
          AdCampaignStatus.ACTIVE,
          AdCampaignStatus.QUEUED,
        ]),
      },
    });
  }

  private overlaps(a: Range, others: Range[]): boolean {
    return others.some((o) => a.startDate <= o.endDate && a.endDate >= o.startDate);
  }

  /** Estado derivado de la realidad (las fechas mandan): promueve fila de
   * espera, activa, completa y cancela. La fila se encola por createdAt. */
  private deriveStatus(campaign: AdCampaign, occ: AdCampaign[], today: string): AdCampaignStatus {
    if (campaign.status === AdCampaignStatus.CANCELLED) return AdCampaignStatus.CANCELLED;
    if (campaign.status === AdCampaignStatus.COMPLETED) return AdCampaignStatus.COMPLETED;

    if (campaign.status === AdCampaignStatus.QUEUED) {
      const others = occ.filter((o) => o.id !== campaign.id);
      if (!this.overlaps({ startDate: campaign.startDate, endDate: campaign.endDate }, others)) {
        return campaign.startDate <= today ? AdCampaignStatus.ACTIVE : AdCampaignStatus.SCHEDULED;
      }
      return AdCampaignStatus.QUEUED;
    }

    if (campaign.endDate < today) return AdCampaignStatus.COMPLETED;
    if (campaign.startDate <= today) return AdCampaignStatus.ACTIVE;
    return AdCampaignStatus.SCHEDULED;
  }

  /** Persiste las promociones de estado detectadas (fila → al aire, etc.). */
  private async refreshBillboard(billboardId: string): Promise<void> {
    const occ = await this.occupiedRanges(billboardId);
    const today = this.today();
    for (const c of occ) {
      const derived = this.deriveStatus(c, occ, today);
      if (derived !== c.status) {
        c.status = derived;
        await this.campaignRepo.save(c);
      }
    }
  }

  /** Primer hueco libre de `days` días consecutivos desde `from`. */
  private async nextFreeStart(
    billboardId: string,
    days: number,
    from: string,
  ): Promise<string> {
    const occ = await this.occupiedRanges(billboardId);
    let cursor = from;
    for (let i = 0; i < 366; i++) {
      const end = this.addDays(cursor, days - 1);
      if (!this.overlaps({ startDate: cursor, endDate: end }, occ)) return cursor;
      cursor = this.addDays(cursor, 1);
    }
    return cursor;
  }

  private async queuePosition(billboardId: string, campaignId: string): Promise<number> {
    const queued = await this.campaignRepo.find({
      where: { billboardId, status: AdCampaignStatus.QUEUED },
      order: { createdAt: 'ASC' },
    });
    return queued.findIndex((c) => c.id === campaignId) + 1;
  }

  // ---------- Consultas públicas ----------

  /** Lista de carteleras con estado en vivo (ocupada ahora / próximo hueco). */
  async listBillboards(galaxy?: string) {
    const where = galaxy ? { galaxy } : {};
    const billboards = await this.billboardRepo.find({ where, order: { galaxy: 'ASC' } });
    const out = [];
    for (const b of billboards) {
      await this.refreshBillboard(b.id);
      const occ = await this.occupiedRanges(b.id);
      const today = this.today();
      const activeNow = occ.find((c) => c.startDate <= today && c.endDate >= today) ?? null;
      const nextFree = await this.nextFreeStart(b.id, 1, today);
      out.push({
        id: b.id,
        galaxy: b.galaxy,
        slotKey: b.slotKey,
        label: b.label,
        baseRatePerDayUsd: b.baseRatePerDayUsd,
        active: b.active,
        occupiedNow: !!activeNow,
        currentCampaign: activeNow
          ? { title: activeNow.title, targetUrl: activeNow.targetUrl }
          : null,
        nextAvailableStart: nextFree,
      });
    }
    return out;
  }

  /** Calendario de disponibilidad: rangos ocupados por cartelera. */
  async availability(galaxy?: string) {
    const where = galaxy ? { galaxy } : {};
    const billboards = await this.billboardRepo.find({ where, order: { galaxy: 'ASC' } });
    const today = this.today();
    const horizon = this.addDays(today, AD_AVAILABILITY_HORIZON_DAYS);
    const out = [];
    for (const b of billboards) {
      await this.refreshBillboard(b.id);
      const occ = await this.occupiedRanges(b.id);
      const ranges = occ
        .filter((c) => c.endDate >= today)
        .map((c) => ({ start: c.startDate, end: c.endDate, title: c.title }));
      out.push({
        billboardId: b.id,
        galaxy: b.galaxy,
        label: b.label,
        baseRatePerDayUsd: b.baseRatePerDayUsd,
        nextAvailableStart: await this.nextFreeStart(b.id, 1, today),
        horizon,
        occupiedRanges: ranges,
      });
    }
    return out;
  }

  /** Feed de campañas AL AIRE ahora mismo (lo que muestran las carteleras). */
  async activeAds(galaxy?: string) {
    const today = this.today();
    const qb = this.campaignRepo
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.billboard', 'b')
      .where('c.status IN (:...statuses)', {
        statuses: [AdCampaignStatus.ACTIVE, AdCampaignStatus.SCHEDULED],
      })
      .andWhere('c.startDate <= :today', { today })
      .andWhere('c.endDate >= :today', { today });
    if (galaxy) qb.andWhere('b.galaxy = :galaxy', { galaxy });
    const campaigns = await qb.orderBy('b.galaxy', 'ASC').getMany();
    return campaigns.map((c) => ({
      id: c.id,
      billboardId: c.billboardId,
      galaxy: c.billboard.galaxy,
      label: c.billboard.label,
      title: c.title,
      targetUrl: c.targetUrl,
      advertiserId: c.advertiserId,
      endsOn: c.endDate,
    }));
  }

  // ---------- Gestión de campañas (anunciante autenticado) ----------

  async createCampaign(advertiserId: string, dto: CreateAdCampaignDto) {
    const billboard = await this.billboardRepo.findOne({ where: { id: dto.billboardId } });
    if (!billboard) throw new NotFoundException('Cartelera no encontrada');
    if (!billboard.active) throw new BadRequestException('Esa cartelera está pausada');
    if (!this.isValidDate(dto.startDate)) {
      throw new BadRequestException('startDate no es una fecha válida');
    }

    await this.refreshBillboard(billboard.id);
    const days = dto.daysActive;
    const requestedEnd = this.addDays(dto.startDate, days - 1);
    const occ = await this.occupiedRanges(billboard.id);
    const requestedRange: Range = { startDate: dto.startDate, endDate: requestedEnd };

    const free = !this.overlaps(requestedRange, occ);

    let status: AdCampaignStatus = AdCampaignStatus.SCHEDULED;
    let effectiveStart = dto.startDate;
    let nextAvailableStart: string | null = null;

    if (!free) {
      status = AdCampaignStatus.QUEUED;
      nextAvailableStart = await this.nextFreeStart(billboard.id, days, this.today());
    }

    const today = this.today();
    if (status !== AdCampaignStatus.QUEUED && dto.startDate <= today) {
      status = AdCampaignStatus.ACTIVE;
    }

    const costUsd = Math.round(days * billboard.baseRatePerDayUsd * 100) / 100;

    const campaign = this.campaignRepo.create({
      billboardId: billboard.id,
      advertiserId,
      title: dto.title,
      targetUrl: dto.targetUrl,
      startDate: effectiveStart,
      endDate: this.addDays(effectiveStart, days - 1),
      daysActive: days,
      costUsd,
      settlementCurrency: dto.settlementCurrency ?? 'USD',
      paymentMethod: dto.paymentMethod ?? 'card_usd',
      status,
      billingStatus: AdBillingStatus.DUE,
    });
    const saved = await this.campaignRepo.save(campaign);

    return {
      ...saved,
      // Settlement nativo: USD 1,00 o 1 USDT por día activo (paridad 1:1).
      costInSettlementCurrency:
        saved.settlementCurrency === 'USDT' ? saved.costUsd : null,
      queuePosition: status === AdCampaignStatus.QUEUED
        ? await this.queuePosition(billboard.id, saved.id)
        : null,
      nextAvailableStart,
      requestedStart: dto.startDate,
      wasQueued: status === AdCampaignStatus.QUEUED,
      goLiveAt: effectiveStart,
      billingNote:
        'Reserva registrada (display/estado). El cobro real se ejecuta por ' +
        'Payment_Vault (§3.1) — este módulo no mueve dinero.',
    };
  }

  async myCampaigns(advertiserId: string) {
    await Promise.all((await this.billboardRepo.find()).map((b) => this.refreshBillboard(b.id)));
    const campaigns = await this.campaignRepo.find({
      where: { advertiserId },
      order: { createdAt: 'DESC' },
    });
    const today = this.today();
    return Promise.all(
      campaigns.map(async (c) => {
        const occ = await this.occupiedRanges(c.billboardId);
        const status = this.deriveStatus(c, occ, today);
        return {
          ...c,
          status,
          queuePosition: status === AdCampaignStatus.QUEUED
            ? await this.queuePosition(c.billboardId, c.id)
            : null,
          billingNote:
            'Cobro por Payment_Vault (§3.1) — reserva de estado, no mueve dinero.',
        };
      }),
    );
  }

  async cancelCampaign(campaignId: string, advertiserId: string) {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaña no encontrada');
    if (campaign.advertiserId !== advertiserId) {
      throw new ForbiddenException('Solo el anunciante puede cancelar su campaña');
    }
    if (campaign.status === AdCampaignStatus.COMPLETED) {
      throw new BadRequestException('Una campaña completada no se puede cancelar');
    }
    campaign.status = AdCampaignStatus.CANCELLED;
    await this.campaignRepo.save(campaign);
    await this.refreshBillboard(campaign.billboardId);
    return { cancelled: true };
  }

  // ---------- Administración (Jorge — admin + elevación) ----------

  async toggleBillboard(billboardId: string, active: boolean, adminId: string, ipAddress: string) {
    const billboard = await this.billboardRepo.findOne({ where: { id: billboardId } });
    if (!billboard) throw new NotFoundException('Cartelera no encontrada');

    billboard.active = active;
    const saved = await this.billboardRepo.save(billboard);

    await this.auditRepo.save(
      this.auditRepo.create({
        userId: adminId,
        action: active ? 'billboard_enabled' : 'billboard_paused',
        targetResource: `AdBillboard:${billboardId}`,
        metadata: { galaxy: billboard.galaxy, slotKey: billboard.slotKey },
        ipAddress,
        requiredElevation: true,
      }),
    );
    return saved;
  }
}
