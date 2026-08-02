import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { AdBillboard } from './ad-billboard.entity';
import { AdBillingStatus, AdCampaignStatus } from './billboards.const';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

/**
 * GWS · AdCampaign — campaña publicitaria sobre una cartelera
 * ------------------------------------------------------------
 * Ocupa un rango de fechas [startDate..endDate] en UNA cartelera
 * (una campaña a la vez por cartelera). Si la fecha pedida está ocupada,
 * el motor la encola (status=queued) y notifica la fecha exacta en que
 * entra al aire (nextAvailableStart, calculado en el service).
 *
 * SOBERANÍA: `targetUrl` es SIEMPRE una ruta interna de GWS (empieza con
 * '/'). El clic de la cartelera cierra la brecha oferta-demanda DENTRO de
 * la plataforma — jamás deriva el contacto fuera (§3.6).
 *
 * Billing: display + estado. El cobro real es del Payment_Vault (§3.1);
 * billingStatus="paid" solo se marca cuando Payment_Vault confirme.
 */
@Entity('ad_campaigns')
@Index(['billboardId'])
@Index(['advertiserId'])
export class AdCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AdBillboard, { onDelete: 'CASCADE' })
  billboard: AdBillboard;

  @Column()
  billboardId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  advertiser: User;

  @Column()
  advertiserId: string;

  @Column({ length: 120 })
  title: string;

  @Column({ length: 500 })
  targetUrl: string;

  /** Día de entrada al aire (YYYY-MM-DD, UTC). */
  @Column({ type: 'date' })
  startDate: string;

  /** Último día al aire (inclusive). */
  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'int' })
  daysActive: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  costUsd: number;

  /**
   * Moneda de settlement elegida por el anunciante (USD o USDT, paridad 1:1).
   * Regla: USD 1,00 o 1 USDT por día activo (Orden Soberanía Financiera).
   * Cobro real = Payment_Vault (§3.1).
   */
  @Column({ length: 8, default: 'USD' })
  settlementCurrency: string;

  /** Método de pago (un clic): card_usd | usdt_trc20 | usdt_polygon. */
  @Column({ length: 24, default: 'card_usd' })
  paymentMethod: string;

  @Column({ length: 16, default: AdCampaignStatus.SCHEDULED })
  status: AdCampaignStatus;

  @Column({ length: 8, default: AdBillingStatus.DUE })
  billingStatus: AdBillingStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
