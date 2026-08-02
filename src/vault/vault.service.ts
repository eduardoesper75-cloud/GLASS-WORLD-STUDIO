import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { createHash } from 'crypto';
import { VaultCategory } from './vault-category.entity';
import { VaultDocument } from './vault-document.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { VaultDocumentStatus } from './vault.enums';
import {
  GLOBAL_REQUIRED_METADATA,
  GLASS_REFERENCE_DATA,
  LEGAL_TERMS_VERSION,
  NUMERIC_METADATA_RANGES,
  REQUIRED_METADATA_BY_CATEGORY,
  VAULT_LEAK_BLOCK_CATEGORIES,
} from './vault.const';
import { LEGAL_NOTICES } from './legal-notices.const';
import { detectContactLeak } from '../community/anti-leak/contact-leak-filter';
import { CreateVaultDocumentDto } from './dto/create-vault-document.dto';
import { ListVaultDocumentsQueryDto } from './dto/list-vault-documents.dto';

/**
 * GWS · VaultService — Bóveda del Conocimiento
 * ------------------------------------------------------------
 * Gobernanza (Orden Suprema §3.5/§3.6):
 *   1. Validación de metadatos POR HOJA: claves globales + las de la
 *      categoría destino. Rechazo por INVALID_METADATA (benchmark
 *      colibri/MODAVIS — sin metadatos mínimos no se publica).
 *   2. Dedup por contenido: doble hash (bruto + normalizado). Rechazo
 *      por DUPLICATE si ya existe (under_review o publicado).
 *   3. Anti-fuga: detector del chat (reutilizado) sobre título+resumen,
 *      SOLO para categorías de canal de contacto (whatsapp/telegram/
 *      instagram/otras redes/intención). Email/teléfono/URL/geo NO
 *      rechazan: en una biblioteca técnica el origen y los datos de
 *      proceso son legítimos. Todo bloqueo queda en el audit log.
 *   4. Curación humana: la subida entra en under_review; publicar/
 *      rechazar es decisión del curador (moderador/admin). Safe-harbor:
 *      GWS es hosting neutral, no editor (ver legal-notices.const.ts).
 *
 * NINGÚN documento se publica automáticamente — la publicación es
 * siempre un acto de moderación con audit trail.
 */
@Injectable()
export class VaultService {
  constructor(
    @InjectRepository(VaultCategory) private categoryRepo: Repository<VaultCategory>,
    @InjectRepository(VaultDocument) private documentRepo: Repository<VaultDocument>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  // ---------------------------------------------------------------------------
  // Lectura pública
  // ---------------------------------------------------------------------------

  /** Árbol de categorías (raíces + hijos), solo activas. */
  async listCategories(): Promise<VaultCategory[]> {
    const all = await this.categoryRepo.find({
      where: { active: true },
      order: { displayOrder: 'ASC' },
    });
    const byId = new Map(all.map((c) => [c.id, c]));
    const roots: VaultCategory[] = [];
    for (const cat of all) {
      (cat as VaultCategory & { children: VaultCategory[] }).children = [];
    }
    for (const cat of all) {
      if (cat.parentId && byId.has(cat.parentId)) {
        const parent = byId.get(cat.parentId) as VaultCategory & {
          children: VaultCategory[];
        };
        parent.children.push(cat);
      } else {
        roots.push(cat);
      }
    }
    return roots;
  }

  /** Búsqueda pública: SOLO publicados, con filtros laxo (fase MVP). */
  async listDocuments(query: ListVaultDocumentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const qb = this.documentRepo
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.category', 'category')
      .where('doc.status = :status', { status: VaultDocumentStatus.PUBLISHED })
      .orderBy('doc.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.category) {
      const category = await this.categoryRepo.findOne({
        where: { code: query.category, active: true },
      });
      if (!category) {
        throw new NotFoundException(`Categoría ${query.category} no encontrada`);
      }
      // Incluye la sub-rama completa (raíz + hijos por prefijo de path ltree).
      const all = await this.categoryRepo.find({ where: { active: true } });
      const branch = all.filter(
        (c) => c.path === category.path || c.path.startsWith(`${category.path}.`),
      );
      qb.andWhere('doc.categoryId IN (:...ids)', {
        ids: branch.map((c) => c.id),
      });
    }

    if (query.language) {
      qb.andWhere('doc.language = :lang', { lang: query.language });
    }
    if (query.search) {
      const needle = `%${query.search.trim()}%`;
      qb.andWhere('(doc.title ILIKE :needle OR doc.summary ILIKE :needle)', { needle });
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((doc) => this.toPublic(doc)),
      page,
      limit,
      total,
    };
  }

  /** Detalle público de un documento publicado. */
  async getDocument(id: string): Promise<VaultDocument> {
    const doc = await this.documentRepo.findOne({
      where: { id, status: VaultDocumentStatus.PUBLISHED },
      relations: ['category'],
    });
    if (!doc) {
      throw new NotFoundException('Documento no publicado o inexistente');
    }
    return doc;
  }

  /** Cláusulas safe-harbor vigentes (es/en). */
  getLegal(lang: 'es' | 'en') {
    return LEGAL_NOTICES[lang === 'en' ? 'en' : 'es'];
  }

  /** Referencias técnicas canónicas (COE/annealing/softening + normas).
   * Son datos públicos de consulta; no generan documentos publicados. */
  getReferenceData() {
    return GLASS_REFERENCE_DATA;
  }

  // ---------------------------------------------------------------------------
  // Alta (con gobernanza)
  // ---------------------------------------------------------------------------

  async upload(
    authorId: string,
    dto: CreateVaultDocumentDto,
    ipAddress: string,
  ): Promise<VaultDocument> {
    const category = await this.categoryRepo.findOne({
      where: { code: dto.categoryCode, active: true },
    });
    if (!category) {
      throw new NotFoundException(`Categoría ${dto.categoryCode} no encontrada o inactiva`);
    }

    // 1. Aceptación de las cláusulas safe-harbor VIGENTES.
    if (dto.acceptedTermsVersion !== LEGAL_TERMS_VERSION) {
      throw new BadRequestException(
        `Términos vencidos: aceptá la versión ${LEGAL_TERMS_VERSION} de las cláusulas safe-harbor`,
      );
    }

    // 2. Anti-fuga sobre título + resumen (solo canales de contacto).
    const leakVerdict = detectContactLeak(`${dto.title}\n${dto.summary}`);
    const leakBlocked = leakVerdict.categories.filter((c) =>
      (VAULT_LEAK_BLOCK_CATEGORIES as readonly string[]).includes(c),
    );
    if (leakBlocked.length > 0) {
      await this.auditRepo.save(
        this.auditRepo.create({
          userId: authorId,
          action: 'vault_document_leak_blocked',
          targetResource: `VaultCategory:${category.id}`,
          metadata: {
            categories: leakBlocked,
            samples: leakVerdict.samples,
            title: dto.title,
          },
          ipAddress,
          requiredElevation: false,
        }),
      );
      throw new BadRequestException({
        message:
          'Documento bloqueado: los metadatos no pueden contener canales de contacto externos (WhatsApp, Telegram, Instagram, otras redes) ni intención de llevar la operación fuera de la plataforma.',
        blockedCategories: leakBlocked,
      });
    }

    // 3. Validación de metadatos por hoja (global + categoría).
    const metadata = dto.metadata ?? {};
    const requiredKeys = [
      ...GLOBAL_REQUIRED_METADATA,
      ...(REQUIRED_METADATA_BY_CATEGORY[category.code] ?? []),
    ];
    const missing = requiredKeys.filter(
      (key) => metadata[key] === undefined || metadata[key] === null || metadata[key] === '',
    );
    if (missing.length > 0) {
      throw new BadRequestException({
        message: `Metadatos incompletos para ${category.code}. Faltan: ${missing.join(', ')}`,
        missing,
      });
    }

    // Verificación numérica de cordura (incoherencia → NUMERIC_INCONSISTENT).
    for (const [key, [min, max]] of Object.entries(NUMERIC_METADATA_RANGES)) {
      if (metadata[key] === undefined) continue;
      const value = Number(metadata[key]);
      if (!Number.isFinite(value) || value < min || value > max) {
        throw new BadRequestException({
          message: `Metadato numérico incoherente para ${category.code}: ${key} = ${metadata[key]} (rango ${min}–${max})`,
          key,
        });
      }
    }

    // 4. Dedup por contenido (hash bruto + normalizado).
    const rawContent = dto.content ?? dto.summary;
    const contentSha256 = createHash('sha256').update(rawContent).digest('hex');
    const contentShaNormalized = createHash('sha256')
      .update(this.normalizeContent(rawContent))
      .digest('hex');

    const existing = await this.documentRepo.findOne({
      where: {
        contentSha256: In([contentSha256]),
        status: In([VaultDocumentStatus.UNDER_REVIEW, VaultDocumentStatus.PUBLISHED]),
      },
    });
    if (existing) {
      throw new ConflictException({
        message:
          'Documento duplicado: ya existe un documento con este contenido en la Bóveda (en revisión o publicado).',
        existingId: existing.id,
      });
    }
    const existingNormalized = await this.documentRepo.findOne({
      where: {
        contentShaNormalized: contentShaNormalized,
        status: In([VaultDocumentStatus.UNDER_REVIEW, VaultDocumentStatus.PUBLISHED]),
      },
    });
    if (existingNormalized) {
      throw new ConflictException({
        message:
          'Documento duplicado (normalizado): el contenido coincide con un documento ya existente salvo por mayúsculas/espacios.',
        existingId: existingNormalized.id,
      });
    }

    // 5. Alta en under_review (la curación decide la publicación).
    const doc = this.documentRepo.create({
      categoryId: category.id,
      authorId,
      title: dto.title.trim(),
      summary: dto.summary.trim(),
      language: dto.language,
      docKind: dto.docKind,
      metadata,
      sourceUrl: dto.sourceUrl ?? null,
      content: dto.content ?? null,
      contentSha256,
      contentShaNormalized,
      fileType: dto.fileType ?? 'text/plain',
      sizeBytes: String(Buffer.byteLength(rawContent, 'utf8')),
      status: VaultDocumentStatus.UNDER_REVIEW,
      acceptedTermsVersion: dto.acceptedTermsVersion,
      version: 1,
    });
    const saved = await this.documentRepo.save(doc);

    await this.auditRepo.save(
      this.auditRepo.create({
        userId: authorId,
        action: 'vault_document_uploaded',
        targetResource: `VaultDocument:${saved.id}`,
        metadata: {
          categoryCode: category.code,
          docKind: dto.docKind,
          language: dto.language,
          sha256: contentSha256.slice(0, 16),
        },
        ipAddress,
        requiredElevation: false,
      }),
    );

    return saved;
  }

  /** Lista de uploads propios (cualquier estado). */
  async listMine(userId: string): Promise<VaultDocument[]> {
    return this.documentRepo.find({
      where: { authorId: userId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  // ---------------------------------------------------------------------------
  // Curación (moderador de cualquier galaxia o admin)
  // ---------------------------------------------------------------------------

  async review(
    documentId: string,
    moderatorId: string,
    decision: 'published' | 'rejected',
    rejectReason: string | undefined,
    moderationNote: string | undefined,
    ipAddress: string,
  ): Promise<VaultDocument> {
    const doc = await this.documentRepo.findOne({
      where: { id: documentId, status: VaultDocumentStatus.UNDER_REVIEW },
      relations: ['category'],
    });
    if (!doc) {
      throw new NotFoundException('Documento en revisión no encontrado');
    }

    if (decision === 'published') {
      doc.status = VaultDocumentStatus.PUBLISHED;
      doc.publishedAt = new Date();
      doc.rejectedReason = null;
    } else {
      if (!rejectReason) {
        throw new BadRequestException(
          'Un rechazo exige reason code: DUPLICATE, INVALID_METADATA, NUMERIC_INCONSISTENT, SPAM o UNVERIFIED_SOURCE',
        );
      }
      doc.status = VaultDocumentStatus.REJECTED;
      doc.rejectedReason = rejectReason;
    }
    const saved = await this.documentRepo.save(doc);

    await this.auditRepo.save(
      this.auditRepo.create({
        userId: moderatorId,
        action: decision === 'published' ? 'vault_document_published' : 'vault_document_rejected',
        targetResource: `VaultDocument:${saved.id}`,
        metadata: {
          categoryCode: doc.category?.code,
          rejectReason: rejectReason ?? null,
          moderationNote: moderationNote ?? null,
        },
        ipAddress,
        requiredElevation: false,
      }),
    );

    return saved;
  }

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------

  /** Hash de contenido normalizado: minúsculas + colapso de espacios/signos. */
  private normalizeContent(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Proyección pública: nunca expone contentSha/hashes ni el body completo. */
  private toPublic(doc: VaultDocument): Partial<VaultDocument> {
    const { contentSha256, contentShaNormalized, sizeBytes, ...rest } = doc;
    return rest;
  }
}
