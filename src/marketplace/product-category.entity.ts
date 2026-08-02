import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { ProductCategoryTier } from './marketplace.enums';

/**
 * GWS · ProductCategory (Galaxia 2 · Marketplace)
 * ------------------------------------------------------------
 * Taxonomía jerárquica real (benchmark 2026): las categorías no son
 * un enum plano — son una tabla con padre + path ltree. El enum
 * ProductCategoryTier sigue existiendo como el NIVEL RAÍZ (los 4
 * tiers se seedan acá como roots); las subcategorías crecen debajo
 * (ej. INSUMOS_CRITICOS > "Varillas" > "Borosilicato 3.3").
 *
 * `path` (ltree) permite consultas de subárbol eficientes:
 *   ... WHERE path <@ 'insumos_criticos'  (todo el subárbol)
 *   ... WHERE path ~ '*.varillas.*'       (descendientes de varillas)
 */
@Entity('product_categories')
@Index(['slug'], { unique: true })
@Index(['tier'])
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  /** Identificador URL-friendly (ej. "varillas-borosilicato"). Único. */
  @Column()
  slug: string;

  /** Categoría padre. null => es una raíz (uno de los 4 tiers). */
  @ManyToOne(() => ProductCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: ProductCategory | null;

  @Column({ nullable: true })
  parentId: string | null;

  /** Ruta ltree: "insumos_criticos.varillas.borosilicato". Se mantiene
   * por el código al crear/mover categorías (ver migración seed). */
  @Column({ type: 'ltree' })
  path: string;

  /** Tier raíz al que pertenece la categoría (para filtrar junto al
   * enum que ya usa products.categoryTier). */
  @Column({ type: 'enum', enum: ProductCategoryTier })
  tier: ProductCategoryTier;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
