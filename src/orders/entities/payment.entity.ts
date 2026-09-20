import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from '../../users/user.entity';
import { PaymentStatus } from '../orders.const';
import { DecimalTransformer } from '../../common/transformers/decimal.transformer';

/**
 * GWS · Payment — intención de pago de una orden (checkout P0)
 * ------------------------------------------------------------
 * NO procesa fondos: registra la intención/estado del cobro y delega el
 * movimiento real al Payment_Vault (§3.1 CLAUDE.md, Zona de Exclusión).
 * `status` sigue una mini-máquina (ADR-003): PENDING → CAPTURED | REFUNDED.
 *
 * Idempotencia (ADR-001): `idempotencyKey` UNIQUE por pago — el reintento
 * del cliente no puede crear dos capturas del mismo cargo.
 */
@Entity('payments')
@Index(['orderId'])
@Index(['userId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { onDelete: 'RESTRICT' })
  order: Order;

  @Column()
  orderId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  user: User;

  /** Clave de idempotencia del cliente (ADR-001). UNIQUE index abajo. */
  @Column({ type: 'varchar', length: 64 })
  @Index('IDX_payments_idempotencyKey', { unique: true })
  idempotencyKey: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    transformer: new DecimalTransformer(),
  })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  /** Método declarado: card_usd | usdt_trc20 | usdt_polygon. */
  @Column({ length: 24, default: 'card_usd' })
  paymentMethod: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}