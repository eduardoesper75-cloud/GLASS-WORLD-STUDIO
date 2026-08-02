import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BunkerSpecialist } from './bunker-specialist.entity';
import { BunkerMembershipStatus } from './bunker.const';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

/**
 * GWS · BunkerMembership — membresía pro del profesional (USD 50/mes)
 * ------------------------------------------------------------
 * Fidelización por pago anticipado: 3m=10%, 6m=15%, 12m=20%. Estado de
 * acceso (display); el cobro real es del Payment_Vault (§3.1). El acceso
 * a la red de demanda (tomar tickets) exige membresía activa.
 */
@Entity('bunker_memberships')
export class BunkerMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BunkerSpecialist, { onDelete: 'CASCADE' })
  specialist: BunkerSpecialist;

  @Column()
  specialistId: string;

  /** 1, 3, 6 o 12 meses (ver BUNKER_PLAN_MONTHS). */
  @Column({ type: 'int' })
  planMonths: number;

  /** 50 × (1 − descuento/100). */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  feeUsd: number;

  /**
   * Moneda de settlement elegida por el usuario (USD o USDT, paridad 1:1).
   * Doble estándar soberano (Orden Soberanía Financiera). Cobro real =
   * Payment_Vault (§3.1).
   */
  @Column({ length: 8, default: 'USD' })
  settlementCurrency: string;

  /** Método de pago (un clic): card_usd | usdt_trc20 | usdt_polygon. */
  @Column({ length: 24, default: 'card_usd' })
  paymentMethod: string;

  @Column({ type: 'int' })
  discountPct: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ length: 16, default: BunkerMembershipStatus.ACTIVE })
  status: BunkerMembershipStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
