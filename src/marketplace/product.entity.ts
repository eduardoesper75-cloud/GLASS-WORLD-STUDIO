import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ProductCategoryTier, UnitOfMeasure } from './marketplace.enums';
import type { ResolvedGwsMediaItem } from '../common/media/gws-media.const';
import { ProductionBatch } from './production-batch.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductReview } from './product-review.entity';
import { ProductCategory } from './product-category.entity';

/**
 * GWS · Product (Galaxia 2 · Marketplace)
 * ------------------------------------------------------------
 * Deliberadamente NO tiene un campo "stock: number" tradicional.
 * Ver ProductionBatch — el inventario industrial es una entidad
 * separada (lote + certificado + unidad de medida), tal como se
 * definió en el brief original de G2: "no puede ser un simple
 * contador de stock".
 *
 * technicalSpecs es JSONB porque cada categoría de producto tiene
 * atributos completamente distintos (un horno no se filtra por los
 * mismos campos que una varilla de vidrio) — un esquema rígido de
 * columnas obligaría a null-ear la mayoría de los campos para
 * cualquier producto dado. Riesgo aceptado: JSONB no tiene
 * validación de esquema a nivel de base de datos; la validación de
 * qué claves son válidas por categoría se hace en el DTO de entrada
 * (ver create-product.dto.ts, a implementar junto con el controller).
 */
@Entity('products')
@Index(['sellerId', 'categoryTier'])
export class Product {
  /** Índice GIN sobre technicalSpecs — se crea en la migración
   * (USING GIN, no btree). synchronize:false evita que TypeORM
   * intente recrearlo como btree en sync/diffs; el real es GIN
   * y su nombre coincide con el de la migración. */
  @Index('IDX_products_technicalSpecs_gin', { synchronize: false })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  seller: User;

  @Column()
  sellerId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: ProductCategoryTier })
  categoryTier: ProductCategoryTier;

  /** Ej: { "color": "transparente", "iso_din": "ISO 3585" } — las claves
   * varían según categoryTier, validadas en el DTO, no en la base. Las
   * claves más usadas para FILTRAR (COE, temperatura de fusión) tienen
   * además columnas tipadas abajo: el filtro técnico va por columna, la
   * flexibilidad por JSONB (patrón del benchmark 2026). */
  @Column({ type: 'jsonb', default: {} })
  technicalSpecs: Record<string, unknown>;

  /** COE — Coeficiente de Expansión Térmica (x10^-7/°C). Es el dato
   * rey del vidrio: decide compatibilidad entre piezas y familias.
   * Tipado y filtrable (coeMin/coeMax) además de vivir en specs. */
  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  coe: number | null;

  /** Temperatura de fusión / trabajo del material en °C. Tipada y
   * filtrable (fusionTempMin/Max) — un horno no se elige sin esto. */
  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  fusionTemperatureC: number | null;

  /** Dimensiones nominales del insumo/obra (ej. { largoMm: 1500,
   * diametroMm: 6, pesoG: 500 }). JSONB: los campos dependen del tipo
   * de producto. NO se filtra por dimensión en la v1 (COE y temp sí). */
  @Column({ type: 'jsonb', nullable: true })
  dimensions: Record<string, unknown> | null;

  /** Categoría jerárquica (product_categories). Nullable: el enum
   * categoryTier sigue siendo obligatorio; la taxonomía fina crece
   * por encima sin romper el catálogo existente. */
  @ManyToOne(() => ProductCategory, { nullable: true, onDelete: 'SET NULL' })
  category: ProductCategory | null;

  @Column({ nullable: true })
  categoryId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'enum', enum: UnitOfMeasure })
  unitOfMeasure: UnitOfMeasure;

  /** Cantidad mínima de compra — usado por el SourcingEngineService
   * (Etapa 2/3) para validar el checkout de clientes industriales. */
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 1 })
  minimumOrderQuantity: number;

  /** Si es true, el checkout debe bloquearse hasta aceptar términos de
   * seguridad industrial (ver brief original: "requires_msds"). La
   * lógica de bloqueo vive en el frontend + validación repetida en el
   * checkout service — no solo acá. */
  @Column({ type: 'boolean', default: false })
  requiresMsds: boolean;

  @Column({ nullable: true })
  msdsUrl: string | null;

  /** Ubicación del vendedor, usada por el ProximityRadarService
   * (Etapa 2) para ordenar resultados: local → región → resto del
   * mundo. País en formato ISO 3166-1 alpha-2 (ej: "AR", "BR", "MX"). */
  @Column({ length: 2 })
  sellerCountryCode: string;

  /** Multimedia industrial del producto (demo de máquina pesada de G5,
   * corte por agua en vivo, explicación de ingenieros). Modelo resuelto
   * por src/common/media — embed YouTube/Vimeo/CDN propio, sin subir
   * archivos al servidor. */
  @Column({ type: 'jsonb', nullable: true })
  media: ResolvedGwsMediaItem[] | null;

  @Column({ nullable: true })
  sellerRegion: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => ProductionBatch, (batch) => batch.product)
  batches: ProductionBatch[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductReview, (review) => review.product)
  reviews: ProductReview[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
