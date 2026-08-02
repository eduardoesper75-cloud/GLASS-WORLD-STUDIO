import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { G6TechSheetTemplate } from './tech-sheet-template.entity';
import { G6TechSheet } from './tech-sheet.entity';
import {
  G6_MATCH_RULES,
  G6_SUGGEST_LIMIT,
  G6_TECH_FAMILY_LABELS,
  G6_TECH_FAMILIES,
} from './g6-tech-sheets.const';
import { CreateTechSheetDto } from './dto/create-tech-sheet.dto';

/** TTL del catálogo G6 en memoria (ms) — el autopredictor no golpea la DB en
 * cada tecla; basta refrescar cada 60 s o ante cambios de templates. */
const CATALOG_TTL_MS = 60_000;

/**
 * GWS · G6TechSheetsService — Autopredictor técnico + ficha manual
 * ------------------------------------------------------------
 * AUTOPREDICTOR: normaliza el nombre ingresado (minúsculas, sin acentos) y
 * puntúa cada template del catálogo por (nombre × peso, keywords × peso,
 * marcas × peso). Devuelve la ficha técnica OFICIAL precargada para que el
 * comerciante publique su inventario sin redactar especificaciones.
 *
 * FALLBACK MANUAL: si no hay patrón (pieza de autor, herramienta artesanal
 * o desarrollo exótico), el comerciante completa un formulario limpio.
 *
 * El vendedor SIEMPRE puede corregir la ficha antes de publicar (la ficha
 * autocompletada no se publica sola).
 */
@Injectable()
export class G6TechSheetsService {
  constructor(
    @InjectRepository(G6TechSheetTemplate)
    private templateRepo: Repository<G6TechSheetTemplate>,
    @InjectRepository(G6TechSheet)
    private techSheetRepo: Repository<G6TechSheet>,
  ) {}

  /** Cache en memoria del catálogo activo (endurecimiento E6). */
  private catalogCache: { templates: G6TechSheetTemplate[]; at: number } | null = null;

  private async activeTemplates(): Promise<G6TechSheetTemplate[]> {
    if (
      this.catalogCache &&
      Date.now() - this.catalogCache.at < CATALOG_TTL_MS &&
      this.catalogCache.templates.length > 0
    ) {
      return this.catalogCache.templates;
    }
    const templates = await this.templateRepo.find({ where: { isActive: true } });
    this.catalogCache = { templates, at: Date.now() };
    return templates;
  }

  /** Normaliza para matching: minúsculas + sin acentos + trim. */
  private normalize(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private tokenize(input: string): string[] {
    return this.normalize(input)
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= G6_MATCH_RULES.minKeywordLength);
  }

  /**
   * Autopredictor: matchea por patrones de catálogo y devuelve la ficha
   * técnica oficial de las mejores coincidencias.
   */
  async suggest(productName: string) {
    const tokens = this.tokenize(productName);
    const norm = this.normalize(productName);
    if (tokens.length === 0) {
      throw new BadRequestException('Nombre demasiado corto para reconocer una referencia');
    }

    const templates = await this.activeTemplates();
    const scored = templates
      .map((t) => {
        const nameTokens = this.tokenize(t.name);
        const kwTokens = (t.keywords ?? []).map((k) => this.normalize(k));
        const brandTokens = (t.brands ?? []).map((b) => this.normalize(b));

        let score = 0;
        for (const token of tokens) {
          if (nameTokens.some((n) => n.includes(token) || token.includes(n))) {
            score += G6_MATCH_RULES.weightName;
          }
          if (kwTokens.some((k) => k === token || k.includes(token) || token.includes(k))) {
            score += G6_MATCH_RULES.weightKeyword;
          }
          if (brandTokens.some((b) => b === token || b.includes(token))) {
            score += G6_MATCH_RULES.weightBrand;
          }
        }
        if (norm.includes(this.normalize(t.slug.replace(/_/g, ' ')))) {
          score += G6_MATCH_RULES.weightKeyword;
        }
        return { template: t, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, G6_SUGGEST_LIMIT);

    return {
      matched: scored.length > 0,
      query: productName,
      suggestions: scored.map(({ template: t, score }) => ({
        slug: t.slug,
        family: t.family,
        familyLabel: G6_TECH_FAMILY_LABELS[t.family as keyof typeof G6_TECH_FAMILY_LABELS],
        name: t.name,
        score,
        officialSpecs: t.officialSpecs,
        sourceRef: t.sourceRef,
      })),
      note:
        scored.length > 0
          ? 'Ficha técnica oficial precargada — revisá y corregí antes de publicar.'
          : 'No se encontró patrón en el catálogo. Usá la inserción manual para piezas de autor o exóticas.',
    };
  }

  /** Alta de ficha: autocompletada (templateSlug) o manual (manualSpecs). */
  async create(sellerId: string, dto: CreateTechSheetDto) {
    if (!dto.templateSlug && !dto.manualSpecs) {
      throw new BadRequestException(
        'Indicá templateSlug (autocompletar ficha oficial) o manualSpecs (inserción manual).',
      );
    }

    let template: G6TechSheetTemplate | null = null;
    if (dto.templateSlug) {
      template = await this.templateRepo.findOne({
        where: { slug: dto.templateSlug, isActive: true },
      });
      if (!template) {
        throw new NotFoundException(
          `Template '${dto.templateSlug}' no encontrado en el catálogo G6`,
        );
      }
    }

    const family = dto.family ?? template?.family ?? 'pyrometer';
    if (!(G6_TECH_FAMILIES as readonly string[]).includes(family)) {
      throw new BadRequestException(`family debe ser uno de: ${G6_TECH_FAMILIES.join(', ')}`);
    }

    const sheet = this.techSheetRepo.create({
      sellerId,
      productId: dto.productId ?? null,
      family,
      productName: dto.productName,
      source: template ? 'autocomplete' : 'manual',
      templateId: template?.id ?? null,
      specs: template ? template.officialSpecs : (dto.manualSpecs ?? {}),
      status: 'draft',
    });
    const saved = await this.techSheetRepo.save(sheet);

    return {
      ...saved,
      sourceNote: template
        ? 'Ficha autocompletada del catálogo oficial — revisá antes de publicar.'
        : 'Ficha manual — el comerciante la completa libremente.',
    };
  }

  /** Mis fichas técnicas (el comerciante). */
  async mine(sellerId: string) {
    return this.techSheetRepo.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Catálogo de templates disponibles (display público). */
  async catalog() {
    const templates = (await this.activeTemplates())
      .slice()
      .sort((a, b) => (a.family === b.family ? a.name.localeCompare(b.name) : a.family.localeCompare(b.family)));
    return templates.map((t) => ({
      slug: t.slug,
      family: t.family,
      familyLabel: G6_TECH_FAMILY_LABELS[t.family as keyof typeof G6_TECH_FAMILY_LABELS],
      name: t.name,
      brands: t.brands,
      officialSpecs: t.officialSpecs,
      sourceRef: t.sourceRef,
    }));
  }
}
