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
import { Product } from '../../marketplace/product.entity';
import { ProductVariant } from '../../marketplace/product-variant.entity';
import { DecimalTransformer } from '../../common/transformers/decimal.transformer';

/**
 * GWS · OrderItem — línea de la orden (checkout P0)
 * ------------------------------------------------------------
 * Snapshot INMUTABLE del precio al momento de compra: `unitAmount` y
 * `productName` se copian del catálogo al crear la orden. El vendedor
 * puede luego cambiar precios/título del producto, pero la orden guarda
 * lo pactado — es un documento fiscal-histórico, no una vista viva.
 *
 * FKs con ON DELETE RESTRICT (ADR-002): no se puede borrar un producto
 * que ya tiene ventas, ni una orden con ítems asociados (el documento
 * de compra es permanente).
 */
@Entity('order_items')
@Index(['orderId'])
@Index(['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'RESTRICT' })
  order: Order;

  @Column()
  orderId: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT', nullable: true })
  variant: ProductVariant | null;

  @Column({ type: 'uuid', nullable: true })
  variantId: string | null;

  /** Snapshot del nombre en el momento de compra. */
  @Column()
  productName: string;

  /** Precio unitario pactado (variable si usó variante). ADR-004. */
  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    transformer: new DecimalTransformer(),
  })
  unitAmount: number;

  @Column({ type: 'int' })
  quantity: number;

  /** unitAmount * quantity — con precisión decimal (ADR-004). */
  @Column({
    type: 'numeric',
    precision: 19,
    scale: 4,
    transformer: new DecimalTransformer(),
  })
  lineTotal: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}