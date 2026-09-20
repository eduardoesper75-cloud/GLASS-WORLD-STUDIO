import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Address } from './address.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { Shipment } from './shipment.entity';
import { OrderStatus } from '../orders.const';
import { DecimalTransformer } from '../../common/transformers/decimal.transformer';

/**
 * GWS · Order — orden de compra (checkout P0)
 * ------------------------------------------------------------
 * Máquina de estados (ADR-003):
 *   PENDING → CONFIRMED → SHIPPED → DELIVERED
 *        ↘ CANCELLED (solo mientras PENDING/CONFIRMED con pago no capturado)
 *
 * La función `transition` del service valida cada salto; la BD solo
 * guarda el status. Los montos son `NUMERIC(19,4)` con DecimalTransformer
 * (ADR-004): nunca `number` desnudo en cálculos financieros.
 *
 * Idempotencia (ADR-001): `idempotencyKey` UNIQUE — un cliente que
 * reintenta el create (timeout, doble click) recupera la MISMA orden en
 * vez de duplicarla. El movimiento real de fondos es del Payment_Vault
 * (§3.1): aquí solo estado, snapshot de precios y referencia al pago.
 */
@Entity('orders')
@Index(['buyerId', 'createdAt'])
@Index(['status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  buyer: User;

  @Column()
  buyerId: string;

  /** Clave de idempotencia del cliente (ADR-001). UNIQUE index abajo. */
  @Column({ type: 'varchar', length: 64 })
  @Index('IDX_orders_idempotencyKey', { unique: true })
  idempotencyKey: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  /** Snapshot del cliente comprador (denormalizado para auditoría). */
  @Column()
  buyerEmail: string;

  @ManyToOne(() => Address, { onDelete: 'RESTRICT', nullable: true })
  address: Address | null;

  @Column({ type: 'uuid', nullable: true })
  addressId: string | null;

  /** Subtotal = Σ unitAmount * quantity (item). ADR-004 NUMERIC(19,4). */
  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    transformer: new DecimalTransformer(),
    default: 0,
  })
  subtotal: number;

  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    transformer: new DecimalTransformer(),
    default: 0,
  })
  shippingTotal: number;

  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    transformer: new DecimalTransformer(),
    default: 0,
  })
  taxTotal: number;

  /** Total = subtotal + shipping + tax. Es lo que cubre el Payment_Vault. */
  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    transformer: new DecimalTransformer(),
    default: 0,
  })
  total: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments?: Payment[];

  @OneToMany(() => Shipment, (shipment) => shipment.order)
  shipments?: Shipment[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}