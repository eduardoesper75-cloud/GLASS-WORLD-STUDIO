import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BunkerSpecialist } from './bunker-specialist.entity';
import { BunkerServiceRequest } from './bunker-service-request.entity';
import { BunkerMembership } from './bunker-membership.entity';
import {
  BunkerMembershipStatus,
  BunkerRequestStatus,
  BUNKER_COMMISSION_PCT,
  BUNKER_FIDELITY_DISCOUNTS,
  BUNKER_MACHINE_TYPES,
  BUNKER_MONTHLY_FEE_USD,
  BUNKER_PLAN_MONTHS,
  BUNKER_SPECIALTIES,
} from './bunker.const';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ListSpecialistsQueryDto } from './dto/list-specialists-query.dto';
import { AuditLog } from '../audit/audit-log.entity';

/**
 * GWS · BunkerService — Búnker de Ingeniería Especializada
 * ------------------------------------------------------------
 * Red soberana que conecta plantas/talleres con ingenieros y técnicos
 * matriculados. MODELO FINANCIERO (rectificación de la Orden): CERO
 * comisiones por intermediación y membresía pro de USD 50/mes con
 * fidelización 3m=10%, 6m=15%, 12m=20%. Cobro real = Payment_Vault (§3.1);
 * aquí solo display + estado de acceso.
 */
@Injectable()
export class BunkerService {
  constructor(
    @InjectRepository(BunkerSpecialist)
    private specialistRepo: Repository<BunkerSpecialist>,
    @InjectRepository(BunkerServiceRequest)
    private requestRepo: Repository<BunkerServiceRequest>,
    @InjectRepository(BunkerMembership)
    private membershipRepo: Repository<BunkerMembership>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private addMonths(dateStr: string, months: number): string {
    const d = new Date(dateStr + 'T00:00:00Z');
    d.setUTCMonth(d.getUTCMonth() + months);
    return d.toISOString().slice(0, 10);
  }

  private validatePlanMonths(planMonths: number): void {
    if (!(BUNKER_PLAN_MONTHS as readonly number[]).includes(planMonths)) {
      throw new BadRequestException(`planMonths debe ser uno de: ${BUNKER_PLAN_MONTHS.join(', ')}`);
    }
  }

  private round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  // ---------- Meta pública ----------

  meta() {
    return {
      monthlyFeeUsd: BUNKER_MONTHLY_FEE_USD,
      commissionPct: BUNKER_COMMISSION_PCT,
      fidelityDiscounts: BUNKER_FIDELITY_DISCOUNTS,
      specialties: [...BUNKER_SPECIALTIES],
      machineTypes: [...BUNKER_MACHINE_TYPES],
      planMonths: [...BUNKER_PLAN_MONTHS],
      settlement: {
        currencies: ['USD', 'USDT'],
        paymentMethods: ['card_usd', 'usdt_trc20', 'usdt_polygon'],
        parityUsdPerUsdt: 1,
        note: 'Membresía pagadera por tarjeta USD o USDT (TRC-20/Polygon) con un clic.',
      },
      policyNote:
        'CERO comisiones por intermediación (rectificación de la Orden). ' +
        'El cobro real se ejecuta por Payment_Vault (§3.1) — este módulo es ' +
        'display + estado, no mueve dinero.',
      verifiedOnly: true,
    };
  }

  // ---------- Directorio público (solo cartera verificada) ----------

  async listSpecialists(filters: ListSpecialistsQueryDto) {
    const qb = this.specialistRepo
      .createQueryBuilder('s')
      .where('s.verified = true')
      .andWhere('s.active = true');
    if (filters.countryCode) {
      qb.andWhere('s.countryCode = :cc', { cc: filters.countryCode.toUpperCase() });
    }
    if (filters.specialty) {
      qb.andWhere('s.specialties @> :spec', { spec: JSON.stringify([filters.specialty]) });
    }
    const rows = await qb.orderBy('s.createdAt', 'ASC').getMany();
    return rows.map((s) => ({
      id: s.id,
      publicName: s.publicName,
      headline: s.headline,
      bio: s.bio,
      specialties: s.specialties,
      supportTypes: s.supportTypes,
      countryCode: s.countryCode,
      region: s.region,
      hourlyRateUsd: s.hourlyRateUsd,
    }));
  }

  // ---------- Perfil de especialista (el propio usuario) ----------

  async createSpecialist(userId: string, dto: CreateSpecialistDto) {
    const existing = await this.specialistRepo.findOne({ where: { userId } });
    if (existing) {
      throw new ConflictException('Ya tenés un perfil de especialista en el Búnker');
    }
    const spec = this.specialistRepo.create({
      userId,
      publicName: dto.publicName,
      fullName: dto.fullName,
      professionalEmail: dto.professionalEmail,
      phoneE164: dto.phoneE164,
      nationality: dto.nationality,
      academicTitle: dto.academicTitle,
      registrationNumber: dto.registrationNumber,
      issuingInstitution: dto.issuingInstitution,
      yearsExperience: dto.yearsExperience,
      headline: dto.headline,
      bio: dto.bio ?? null,
      credentials: dto.credentials,
      specialties: dto.specialties,
      supportTypes: dto.supportTypes,
      countryCode: dto.countryCode.toUpperCase(),
      region: dto.region ?? null,
      hourlyRateUsd: dto.hourlyRateUsd ?? null,
    });
    return this.specialistRepo.save(spec);
  }

  async updateSpecialist(userId: string, dto: UpdateSpecialistDto) {
    const spec = await this.specialistRepo.findOne({ where: { userId } });
    if (!spec) throw new NotFoundException('Perfil de especialista no encontrado');
    Object.assign(spec, dto);
    if (dto.countryCode) spec.countryCode = dto.countryCode.toUpperCase();
    return this.specialistRepo.save(spec);
  }

  async mySpecialist(userId: string) {
    return this.specialistRepo.findOne({ where: { userId } });
  }

  // ---------- Verificación (SOLO admin + elevación) ----------

  async verifySpecialist(
    adminId: string,
    specialistId: string,
    verified: boolean,
    ipAddress: string,
  ) {
    const spec = await this.specialistRepo.findOne({ where: { id: specialistId } });
    if (!spec) throw new NotFoundException('Especialista no encontrado');

    spec.verified = verified;
    const saved = await this.specialistRepo.save(spec);

    await this.auditRepo.save(
      this.auditRepo.create({
        userId: adminId,
        action: verified ? 'bunker_specialist_verified' : 'bunker_specialist_unverified',
        targetResource: `BunkerSpecialist:${specialistId}`,
        metadata: { publicName: spec.publicName },
        ipAddress,
        requiredElevation: true,
      }),
    );
    return saved;
  }

  // ---------- Tickets técnicos (Service On-Demand) ----------

  async createRequest(requesterId: string, dto: CreateServiceRequestDto) {
    const req = this.requestRepo.create({
      requesterId,
      title: dto.title,
      symptom: dto.symptom,
      machineType: dto.machineType,
      errorCodes: dto.errorCodes ?? [],
      thermalCurve: dto.thermalCurve ?? null,
      urgency: dto.urgency ?? 'standard',
      status: BunkerRequestStatus.NEW,
      commissionRatePct: BUNKER_COMMISSION_PCT,
    });
    return this.requestRepo.save(req);
  }

  async listRequests(userId: string) {
    const specialist = await this.specialistRepo.findOne({ where: { userId } });
    const where = specialist
      ? [{ requesterId: userId }, { assignedSpecialistId: specialist.id }]
      : { requesterId: userId };
    return this.requestRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  /** El especialista toma el ticket y fija honorarios transparentes (0% comisión). */
  async quoteRequest(userId: string, requestId: string, feeUsd: number) {
    const specialist = await this.specialistRepo.findOne({ where: { userId } });
    if (!specialist) {
      throw new ForbiddenException('Solo un especialista del Búnker puede cotizar tickets');
    }
    // CUARENTENA OBLIGATORIA (endurecimiento E4): aunque haya abonado la
    // membresía de USD 50/mes, un perfil SIN sello élite NO puede tomar
    // tickets de la red de demanda. La verificación es decisión del Comando.
    if (!specialist.verified) {
      throw new ForbiddenException(
        'Tu perfil está en cuarentena: la verificación de matrícula (sello élite) ' +
          'es requisito para tomar tickets, aunque hayas abonado la membresía.',
      );
    }
    const membership = await this.membershipRepo.findOne({
      where: { specialistId: specialist.id, status: BunkerMembershipStatus.ACTIVE },
      order: { endDate: 'DESC' },
    });
    if (!membership) {
      throw new ForbiddenException(
        'Necesitás membresía pro activa (USD 50/mes) para tomar tickets de demanda.',
      );
    }

    const req = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Ticket no encontrado');
    if (
      req.status === BunkerRequestStatus.RESOLVED ||
      req.status === BunkerRequestStatus.CANCELLED
    ) {
      throw new BadRequestException('Ese ticket ya está cerrado');
    }

    // CAS atómico (endurecimiento E7): solo un especialista puede asignarse el
    // ticket. El UPDATE con condición de estado evita la doble asignación
    // concurrente (read-modify-write) — si affected = 0, otro ya lo tomó.
    const result = await this.requestRepo
      .createQueryBuilder()
      .update(BunkerServiceRequest)
      .set({
        assignedSpecialistId: specialist.id,
        quotedFeeUsd: this.round2(feeUsd),
        commissionRatePct: BUNKER_COMMISSION_PCT,
        status: BunkerRequestStatus.ASSIGNED,
      })
      .where('id = :id', { id: requestId })
      .andWhere('status = :newState', { newState: BunkerRequestStatus.NEW })
      .execute();

    if (result.affected === 0) {
      throw new ConflictException(
        'Ese ticket ya fue tomado por otro especialista — elegí otro ticket.',
      );
    }

    const saved = await this.requestRepo.findOne({ where: { id: requestId } });
    return {
      ...saved,
      commissionUsd: 0,
      policyNote:
        'CERO comisión por intermediación — el honorario es íntegro para el especialista. ' +
        'Cobro real por Payment_Vault (§3.1).',
    };
  }

  // ---------- Membresía pro (USD 50/mes, fidelización, settlement USD/USDT) ----------

  quoteMembership(
    planMonths: number,
    settlementCurrency: 'USD' | 'USDT' = 'USD',
    paymentMethod: 'card_usd' | 'usdt_trc20' | 'usdt_polygon' = 'card_usd',
  ) {
    this.validatePlanMonths(planMonths);
    const discountPct = BUNKER_FIDELITY_DISCOUNTS[planMonths] ?? 0;
    const feeUsd = this.round2(BUNKER_MONTHLY_FEE_USD * planMonths * (1 - discountPct / 100));
    return {
      monthlyFeeUsd: BUNKER_MONTHLY_FEE_USD,
      planMonths,
      discountPct,
      feeUsd,
      // Doble estándar soberano: 1 USDT = 1 USD (paridad de settlement).
      settlementCurrency,
      paymentMethod,
      feeInSettlementCurrency: settlementCurrency === 'USDT' ? feeUsd : null,
      parityNote:
        'Settlement nativo USD + USDT (paridad 1:1). El cobro real es Payment_Vault (§3.1).',
    };
  }

  async subscribeMembership(
    userId: string,
    planMonths: number,
    settlementCurrency: 'USD' | 'USDT' = 'USD',
    paymentMethod: 'card_usd' | 'usdt_trc20' | 'usdt_polygon' = 'card_usd',
  ) {
    const specialist = await this.specialistRepo.findOne({ where: { userId } });
    if (!specialist) {
      throw new BadRequestException('Creá tu perfil de especialista antes de suscribirte');
    }
    this.validatePlanMonths(planMonths);
    // Endurecimiento E4 — sin membresías activas superpuestas: la activa se
    // extiende en vez de duplicar filas y cobrar dos veces en Payment_Vault.
    const active = await this.membershipRepo.findOne({
      where: { specialistId: specialist.id, status: BunkerMembershipStatus.ACTIVE },
      order: { endDate: 'DESC' },
    });
    if (active) {
      throw new ConflictException(
        'Ya tenés una membresía pro activa (vence el ' + active.endDate + '). ' +
          'Para renovar, esperá a su vencimiento o consultá la extensión manual con el Comando.',
      );
    }
    const quote = this.quoteMembership(planMonths, settlementCurrency, paymentMethod);
    const startDate = this.today();
    const endDate = this.addMonths(startDate, planMonths);
    const membership = this.membershipRepo.create({
      specialistId: specialist.id,
      planMonths,
      feeUsd: quote.feeUsd,
      settlementCurrency,
      paymentMethod,
      discountPct: quote.discountPct,
      startDate,
      endDate,
      status: BunkerMembershipStatus.ACTIVE,
    });
    const saved = await this.membershipRepo.save(membership);
    return {
      ...saved,
      billingNote:
        'Membresía registrada (display/estado). El cobro real se ejecuta por ' +
        'Payment_Vault (§3.1) — este módulo no mueve dinero.',
    };
  }

  async myMemberships(userId: string) {
    const specialist = await this.specialistRepo.findOne({ where: { userId } });
    if (!specialist) return [];
    return this.membershipRepo.find({
      where: { specialistId: specialist.id },
      order: { createdAt: 'DESC' },
    });
  }
}
