import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { UserSubscription } from './user-subscription.entity';
import { SubscriptionStatus } from './subscription.enums';
import {
  LOYALTY_DISCOUNTS_PERCENT,
  LOYALTY_PERIODS,
  LoyaltyPeriod,
} from './dto/quote-subscription.dto';

export interface PlanDto {
  galaxy: string;
  monthlyPriceUsd: number;
  currency: string;
}

export interface QuoteDto {
  galaxy: string;
  monthlyPriceUsd: number;
  currency: string;
  months: number;
  discountPercent: number;
  perPeriodTotalUsd: number;
}

export interface PlansCatalogDto {
  currency: string;
  discounts: { months: number; discountPercent: number }[];
  plans: PlanDto[];
  /** Los precios son el tarifario oficial seedado (Orden Maestra §2);
   * cambiarlos exige la acción elevada 'change_subscription_pricing'. */
  editable: false;
}

/**
 * GWS · SubscriptionPricingService — Tarifario y cotización
 * ------------------------------------------------------------
 * Expone el tarifario (planes) y cotiza por período con el descuento
 * de fidelización (Orden Maestra §2/§3). Cálculo de exhibición:
 *     total = mensual × meses × (1 − descuento)
 * SIN contacto con procesadores de pago — el cobro real es del
 * Payment_Vault (§3.1). El guard de acceso usa isActive() para la
 * transición post-fundación.
 */
@Injectable()
export class SubscriptionPricingService {
  constructor(
    @InjectRepository(SubscriptionPlan) private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription) private subRepo: Repository<UserSubscription>,
  ) {}

  async listPlans(): Promise<PlansCatalogDto> {
    const plans = await this.planRepo.find({ where: { active: true }, order: { galaxy: 'ASC' } });
    return {
      currency: 'USD',
      discounts: LOYALTY_PERIODS.map((months) => ({
        months,
        discountPercent: LOYALTY_DISCOUNTS_PERCENT[months],
      })),
      plans: plans.map((p) => ({
        galaxy: p.galaxy,
        monthlyPriceUsd: Number(p.monthlyPriceUsd),
        currency: p.currency,
      })),
      editable: false,
    };
  }

  async quote(galaxy: string, months: number): Promise<QuoteDto> {
    if (!(LOYALTY_PERIODS as readonly number[]).includes(months)) {
      throw new BadRequestException(`Período no soportado: ${months}. Usa 1, 3, 6 o 12 meses.`);
    }
    const plan = await this.planRepo.findOne({ where: { galaxy, active: true } });
    if (!plan) throw new NotFoundException(`No hay plan de suscripción para la galaxia ${galaxy}`);

    const monthly = Number(plan.monthlyPriceUsd);
    const discount = LOYALTY_DISCOUNTS_PERCENT[months] ?? 0;
    const perPeriodTotalUsd = Math.round(monthly * months * (1 - discount / 100) * 100) / 100;

    return {
      galaxy,
      monthlyPriceUsd: monthly,
      currency: plan.currency,
      months: months as LoyaltyPeriod,
      discountPercent: discount,
      perPeriodTotalUsd,
    };
  }

  /** ¿El usuario tiene membresía de acceso a esta galaxia HOY?
   * status 'active' Y paidThrough > ahora. Lo consulta el guard en
   * cada request: la transición post-fundación es automática, sin
   * reinicios (Orden Maestra §1). */
  async isActive(userId: string, galaxy: string): Promise<boolean> {
    const sub = await this.subRepo.findOne({
      where: {
        userId,
        galaxy,
        status: SubscriptionStatus.ACTIVE,
      },
    });
    return !!sub && sub.paidThrough > new Date();
  }

  /** Creación de STUB (sin pago) — solo admin, solo dev. El pipeline
   * real de Payment_Vault reemplaza esto en producción. */
  async createStub(
    userId: string,
    galaxy: string,
    months: number,
    paidThrough: string,
  ): Promise<UserSubscription> {
    const quote = await this.quote(galaxy, months);
    const plan = await this.planRepo.findOne({ where: { galaxy } });
    return this.subRepo.save(
      this.subRepo.create({
        userId,
        galaxy,
        planId: plan?.id ?? null,
        periodMonths: months,
        discountPercent: quote.discountPercent,
        pricePerPeriodUsd: quote.perPeriodTotalUsd,
        paidThrough: new Date(paidThrough),
        status: SubscriptionStatus.ACTIVE,
      }),
    );
  }

  async listMine(userId: string): Promise<UserSubscription[]> {
    return this.subRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
