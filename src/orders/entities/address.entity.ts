import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';

/**
 * GWS · Address — dirección de envío de una orden (checkout P0)
 * ------------------------------------------------------------
 * Dirección SOLA, desacoplada del usuario para que una orden conserve
 * su snapshot inmutable de destino (la dirección del comprador al
 * momento de comprar, aunque después la cambie). FKs apuntan a orders
 * con ON DELETE RESTRICT (ADR-002): no se puede borrar una orden con
 * direcciones asociadas — el documento de compra es histórico.
 */
@Entity('addresses')
@Index(['userId'])
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Cuenta que registró la dirección. El snapshot se mantiene igual
   * aunque el usuario la edite luego (las órdenes NO re-leen). */
  @Column()
  userId: string;

  @Column()
  fullName: string;

  @Column()
  line1: string;

  @Column({ type: 'varchar', nullable: true })
  line2: string | null;

  @Column()
  city: string;

  @Column({ type: 'varchar', nullable: true })
  region: string | null;

  @Column()
  postalCode: string;

  /** ISO 3166-1 alpha-2 (mismo formato que products.sellerCountryCode). */
  @Column({ length: 2 })
  countryCode: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @OneToMany(() => Order, (order) => order.address)
  orders?: Order[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}