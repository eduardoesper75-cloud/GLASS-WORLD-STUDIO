import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Master } from './master.entity';
import { MasterCatalogItemType } from './masters.enums';
import type { ResolvedGwsMediaItem } from '../../common/media/gws-media.const';

/**
 * GWS · Galaxia 1 — MasterCatalogItem (ítem del catálogo del maestro)
 * ------------------------------------------------------------
 * Un maestro vende varios tipos de cosas (cursos, talleres, libros,
 * líneas de autor), cada uno con campos distintos. El patrón es el
 * mismo que Product en G2: columnas comunes (title, price, currency,
 * active) + JSONB details para lo específico del rubro.
 *
 * Ejemplos de details según itemType:
 *   - course:            { level, durationHours, syllabusUrl, modality }
 *   - workshop:          { date, location, capacity, modality }
 *   - book:              { isbn, publisher, year, pages, coverUrl }
 *   - author_tool_line:  { material, measurements, usage }
 *   - author_material:   { composition, recommendedUse, packaging }
 *
 * La validación de qué claves son válidas por tipo se hace en el DTO
 * (create-catalog-item.dto.ts), igual que technicalSpecs en G2.
 */
@Entity('g1_master_catalog_items')
@Index(['masterId', 'itemType'])
export class MasterCatalogItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Master, (master) => master.catalog, { onDelete: 'CASCADE' })
  master: Master;

  @Column()
  masterId: string;

  @Column({ type: 'enum', enum: MasterCatalogItemType })
  itemType: MasterCatalogItemType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Precio en la moneda de currency. Null = "a consultar" (común en
   * líneas de autor con cotización a medida). */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number | null;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'jsonb', default: {} })
  details: Record<string, unknown>;

  /** Video de alto valor del ítem (masterclass, demostración técnica).
   * Modelo resuelto por src/common/media — vitrinas de video sin carga
   * en el servidor (embed YouTube/Vimeo/CDN propio). */
  @Column({ type: 'jsonb', nullable: true })
  media: ResolvedGwsMediaItem[] | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
