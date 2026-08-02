import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

/**
 * GWS · ProductVariant (Galaxia 2 · Marketplace)
 * ------------------------------------------------------------
 * Benchmark de marketplaces multiventor (2026): las variantes NO
 * viven en el JSONB del producto — son una tabla propia con SKU
 * independiente. Un mismo producto base (ej. una varilla de vidrio
 * en "transparente 6mm") tiene N variantes vendibles, cada una con
 * su SKU, atributos y precio propio.
 *
 * Precio efectivo = COALESCE(priceOverride, product.unitPrice):
 * la variante puede pisar el precio base del producto sin perder
 * el valor de referencia (modelo de marketplace, ver benchmark).
 * priceOverride null => se usa el precio del producto.
 */
@Entity('product_variants')
@Index(['productId', 'sku'], { unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  productId: string;

  /** SKU propio de la variante (trazabilidad de inventario). Único
   * por producto — el proveedor define su numeración. */
  @Column()
  sku: string;

  /** Nombre comercial de la variante (ej: "Varilla Borosilicato
   * 6mm x 1.5m", "Copa 500ml — batch premium"). */
  @Column()
  name: string;

  /** Precio efectivo de la variante. null => hereda product.unitPrice.
   * Nunca pisar unitPrice acá: la referencia base vive en el producto. */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  priceOverride: number | null;

  /** Atributos específicos de la variante (color, diámetro, capacidad,
   * acabado) — JSONB, porque las claves varían por categoría (misma
   * filosofía que products.technicalSpecs). */
  @Column({ type: 'jsonb', default: {} })
  attributes: Record<string, unknown>;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
