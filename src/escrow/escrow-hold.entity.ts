import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { EscrowCategory, EscrowReleaseType, EscrowStatus } from './escrow.const';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

/**
 * GWS · EscrowHold — retención temporal de fondos (Escrow Inteligente)
 * ------------------------------------------------------------
 * Retiene el pago (USD/USDT) entre comprador y vendedor hasta que el
 * comprador confirma "OK / Recibido conforme" (liberación manual inmediata)
 * o hasta que vence holdUntil sin reclamo (liberación automática por
 * categoría: 24h consumibles · 72h frágiles · 7d eléctricos · 10d maquinaria).
 *
 * Máquina de estados: HELD → (manual | auto) RELEASED · HELD → CLAIMED
 * (reclamo) → RELEASED | REFUNDED. El movimiento REAL de fondos es del
 * Payment_Vault (§3.1); aquí estado + vencimientos.
 */
@Entity('escrow_holds')
@Index(['buyerId'])
@Index(['sellerId'])
@Index(['status'])
export class EscrowHold {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Optimistic lock (endurecimiento E2): incrementa en cada UPDATE y evita el
   * lost-update entre el sweep automático y un reclamo concurrente. Un save con
   * versión desactualizada lanza OptimisticLockVersionMismatchError y se rechaza
   * en el service (nunca se pisa un reclamo ni se doble-libera).
   */
  @VersionColumn()
  version: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  buyer: User;

  @Column()
  buyerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  seller: User;

  @Column()
  sellerId: string;

  /** Referencia interna de la orden/transacción dentro de GWS (§3.6). */
  @Column({ length: 120 })
  orderRef: string;

  /** Categoría del bien → define horas de liberación automática y embalaje. */
  @Column({ length: 24 })
  category: EscrowCategory;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  amount: number;

  /** Doble estándar soberano: USD o USDT (paridad 1:1). */
  @Column({ length: 8, default: 'USD' })
  settlementCurrency: string;

  @Column({ length: 24, default: 'card_usd' })
  paymentMethod: string;

  /** Vencimiento de la liberación automática (creación + horas por categoría). */
  @Column({ type: 'timestamptz' })
  holdUntil: Date;

  /**
   * Fin de la ventana de reclamo = holdUntil + ESCROW_CLAIM_GRACE_HOURS.
   * Dentro de [holdUntil, claimableUntil) el sistema NO libera automáticamente
   * y el comprador aún puede reclamar (endurecimiento E3). Nulo para retenciones
   * creadas antes de la migración de hardening (se deriva en el service).
   */
  @Column({ type: 'timestamptz', nullable: true })
  claimableUntil: Date | null;

  /** Respuesta de la contraparte (vendedor) frente al reclamo (E1). */
  @Column({ type: 'text', nullable: true })
  sellerClaimResponse: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  sellerClaimRespondedAt: Date | null;

  /** Evidencias del reclamo (URLs de imagen/video validados — allowlist soberano). */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  evidenceRefs: string[];

  /** SLA de resolución de la disputa (horas por categoría, E1). */
  @Column({ type: 'int', nullable: true })
  disputeSlaHours: number | null;

  /** Vencimiento del SLA de resolución (claimedAt + disputeSlaHours). */
  @Column({ type: 'timestamptz', nullable: true })
  disputeDueAt: Date | null;

  /** Marca auditable de escalamiento cuando el SLA de resolución se excede. */
  @Column({ type: 'boolean', default: false })
  disputeEscalated: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  disputeEscalatedAt: Date | null;

  @Column({ length: 16, default: EscrowStatus.HELD })
  status: EscrowStatus;

  /** Cómo se liberó: 'manual' (Recibido conforme) o 'auto' (vencimiento). */
  @Column({ type: 'varchar', length: 8, nullable: true })
  releaseType: EscrowReleaseType | null;

  @Column({ type: 'timestamptz', nullable: true })
  releasedAt: Date | null;

  /** Motivo del reclamo del comprador (congela la liberación automática). */
  @Column({ type: 'text', nullable: true })
  claimReason: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  claimedAt: Date | null;

  /** Resolución del reclamo por admin + elevación (release | refund). */
  @Column({ type: 'text', nullable: true })
  resolutionNote: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
