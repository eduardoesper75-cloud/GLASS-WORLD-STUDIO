import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { VaultCategory } from './vault-category.entity';
import { VaultDocumentStatus } from './vault.enums';

/**
 * GWS · VaultDocument — Documento de la Bóveda del Conocimiento
 * -------------------------------------------------------------
 * Gobernanza (Orden Suprema §3.5/§3.6):
 *  · contentSha256 / contentShaNormalized → dedup (hash de contenido +
 *    hash normalizado, benchmark Zenodo). Ambos con índice NO único:
 *    los duplicados se detectan en el service y se rechazan con
 *    'DUPLICATE', pero se conservan en histórico para auditoría.
 *  · metadata (jsonb) → validación por categoría: REQUIRED_METADATA_BY_CATEGORY
 *    exige referencias por hoja (COE, annealing, temperaturas…). No hay
 *    buckets misceláneos.
 *  · status → flujo draft / under_review / published / rejected.
 *  · acceptedTermsVersion → constancia de aceptación de las cláusulas
 *    safe-harbor es+en (garantía de titularidad, indemnización, takedown).
 *  · El contenido vive en `content` (TEXT) para esta fase MVP (sin
 *    object-storage todavía); fileType + sizeBytes anticipan S3.
 */
@Entity('vault_documents')
export class VaultDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => VaultCategory, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category: VaultCategory;

  @Column()
  categoryId: string;

  @Column()
  authorId: string;

  @Column({ length: 120 })
  title: string;

  @Column({ type: 'text' })
  summary: string;

  /** ISO 639-1, uno de los 7 idiomas soportados. */
  @Column({ length: 2 })
  language: string;

  /** Ver VAULT_DOC_KINDS (FIRING_SCHEDULE, TECHNOTE, DATASHEET…). */
  @Column({ length: 32 })
  docKind: string;

  /** Metadatos técnicos por hoja (COE, anneal…). */
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  /** Origen/procedencia (referencia al estándar o fabricante). */
  @Column({ type: 'text', nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  /** Dedup por contenido (crypto sha256 del body normalizado). */
  @Column({ length: 64 })
  contentSha256: string;

  /** Dedup por contenido normalizado (mayúsculas/espacios colapsados). */
  @Column({ length: 64 })
  contentShaNormalized: string;

  @Column({ length: 64, default: 'text/plain' })
  fileType: string;

  @Column({ type: 'bigint', default: 0 })
  sizeBytes: string;

  @Column({
    type: 'enum',
    enum: VaultDocumentStatus,
    default: VaultDocumentStatus.UNDER_REVIEW,
  })
  status: VaultDocumentStatus;

  /** Reason code normalizado si status = rejected. */
  @Column({ length: 32, nullable: true })
  rejectedReason: string | null;

  /** Versión de términos safe-harbor aceptados al subir. */
  @Column({ length: 16 })
  acceptedTermsVersion: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
