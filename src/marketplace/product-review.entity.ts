import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from '../users/user.entity';

/**
 * GWS · ProductReview (Galaxia 2 · Marketplace)
 * ------------------------------------------------------------
 * Reseña de un comprador sobre un producto. Benchmark 2026: el
 * UNIQUE(buyer_id, product_id) es lo que hace que las reseñas sean
 * legítimas de verdad — un comprador no puede votar dos veces el
 * mismo producto inflando el promedio.
 *
 * verifiedPurchase se setea por el proceso de checkout (cuando la
 * compra exista en el sistema) — nunca por el revisor a mano. El
 * rating es un smallint 1..5 validado en el DTO.
 */
@Entity('product_reviews')
@Index(['buyerId', 'productId'], { unique: true })
@Index(['productId', 'createdAt'])
export class ProductReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  buyer: User;

  @Column()
  buyerId: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  /** Lo setea el checkout, nunca el revisor (integridad del sello). */
  @Column({ type: 'boolean', default: false })
  verifiedPurchase: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
