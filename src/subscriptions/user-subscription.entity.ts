import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionStatus } from './subscription.enums';

/**
 * GWS · UserSubscription — Suscripción activa de un usuario
 * ------------------------------------------------------------
 * Qué necesita el guard: "¿este usuario tiene membresía de acceso a
 * la galaxia G ahora?". Respuesta = status 'active' Y
 * paidThrough > now(). El vencimiento se evalúa por fecha, no por
 * job — ver subscription.enums.ts.
 *
 * SOLO REGISTRO: esta fila no se crea por pago en este módulo. En
 * producción la crea/renueva el Payment_Vault al confirmar el cobro
 * (zona de exclusión §3.1). Acá existe el endpoint admin de STUB
 * (sin plata) para poder probar la lógica del guard; el pipeline real
 * lo completa Jorge cuando defina el proveedor de pago.
 *
 * UNIQUE(userId, galaxy): una suscripción vigente por galaxia (la
 * renovación actualiza la misma fila, no acumula filas).
 */
@Entity('user_subscriptions')
@Index(['userId', 'galaxy'], { unique: true })
@Index(['galaxy', 'status'])
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({ length: 8 })
  galaxy: string;

  @ManyToOne(() => SubscriptionPlan, { nullable: true, onDelete: 'SET NULL' })
  plan: SubscriptionPlan | null;

  @Column({ nullable: true })
  planId: string | null;

  /** 1, 3, 6 o 12 meses (ver descuentos de fidelización, Orden §3). */
  @Column({ type: 'int' })
  periodMonths: number;

  /** 0 / 10 / 15 / 20 según período (3/6/12 meses). */
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  /** Total pagado por el período ya con descuento (exhibición). */
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  pricePerPeriodUsd: number;

  /** Hasta cuándo es válida la membresía. */
  @Column({ type: 'timestamptz' })
  paidThrough: Date;

  @Column({ type: 'enum', enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
