import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { MasterCatalogItem } from './master-catalog-item.entity';
import { MasterTier } from './masters.enums';
import type { ResolvedGwsMediaItem } from '../../common/media/gws-media.const';

/**
 * GWS · Galaxia 1 — Master (perfil del maestro consagrado)
 * ------------------------------------------------------------
 * NO es una cuenta nueva: es un perfil público que se cuelga de una
 * cuenta User existente (un maestro sigue siendo un usuario del
 * sistema, con su auth y sus roles). La relación 1:1 con User evita
 * duplicar la autenticación y mantiene la regla de CLAUDE.md de que
 * las cuentas se gestionan en un solo lugar.
 *
 * Deliberadamente NO guarda aquí el contenido que el maestro vende
 * (cursos, libros, líneas de autor) — eso vive en MasterCatalogItem,
 * relacionado por masterId. El perfil es la identidad; el catálogo
 * es la actividad.
 */
@Entity('g1_masters')
export class Master {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  /** Título de presentación pública (ej: "Maestro vidriero, 40 años en
   * vitrofusión"). Es lo que se muestra junto a su nombre. */
  @Column()
  headline: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  /** País y región de base del maestro — se usa en el radar de
   * proximidad (mismo criterio que G2). ISO 3166-1 alpha-2. */
  @Column({ length: 2 })
  countryCode: string;

  @Column({ nullable: true })
  region: string | null;

  @Column({ type: 'int', nullable: true })
  yearsOfExperience: number | null;

  /** Etiquetas de especialidad (ej: ["vitrofusión", "flamework",
   * "horno"]). JSONB para no fijar una taxonomía rígida prematura. */
  @Column({ type: 'jsonb', default: [] })
  specialties: string[];

  @Column({ type: 'jsonb', default: [] })
  galleryImageUrls: string[];

  /** Multimedia industrial del perfil (canal de YouTube, masterclass en
   * vitrina). Modelo RESUELTO por src/common/media (embedUrl calculada),
   * allowlist soberana — jamás canales de contacto (§3.6). */
  @Column({ type: 'jsonb', nullable: true })
  media: ResolvedGwsMediaItem[] | null;

  /** Nivel de presentación (ver masters.enums.ts). Default MASTER. */
  @Column({ type: 'enum', enum: MasterTier, default: MasterTier.MASTER })
  tier: MasterTier;

  /** Verificación de identidad/obra. Solo Jorge puede marcarla (admin +
   * elevación). Un maestro NO verificado sigue siendo visible y vendible;
   * la verificación es un sello de confianza, no un requisito. */
  @Column({ type: 'boolean', default: false })
  verified: boolean;

  /** Soft-delete del perfil (no borra la cuenta User). */
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => MasterCatalogItem, (item) => item.master)
  catalog: MasterCatalogItem[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
