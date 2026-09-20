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
import { ShipmentStatus } from '../orders.const';

/**
 * GWS · Shipment — despacho/entrega de una orden (checkout P0)
 * ------------------------------------------------------------
 * Mini-máquina de estados (ADR-003): PENDING → SHIPPED → DELIVERED.
 * trackingNumber/carrier se completan cuando el vendedor anuncia el
 * envío real; el estado DELIVERED habilita la liberación manual del
 * escrow ("Recibido conforme") del comprador.
 */
@Entity('shipments')
@Index(['orderId'])
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.shipments, { onDelete: 'RESTRICT' })
  order: Order;

  @Column()
  orderId: string;

  @Column({ type: 'varchar', nullable: true })
  carrier: string | null;

  @Column({ type: 'varchar', nullable: true })
  trackingNumber: string | null;

  @Column({ type: 'varchar', default: 'pending' })
  status: ShipmentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  shippedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}