import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductionBatch } from './production-batch.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddBatchDto } from './dto/add-batch.dto';
import { ProductCategoryTier } from './marketplace.enums';
import { ProximityRadarService, RadarGroupedResults } from './proximity-radar.service';
import { resolveGwsMediaOrThrow } from '../common/media/gws-media.validate';

/**
 * Especificaciones técnicas mínimas esperadas por categoría. No es
 * exhaustivo — es el piso de lo que hace útil al filtro técnico
 * (ver brief original: "el vidrio debe filtrarse por COE, color, y
 * temperatura de fusión"). Si un producto de INSUMOS_CRITICOS no
 * trae "coe", el filtro técnico de esa categoría queda roto para ese
 * producto — por eso se valida acá, antes de guardar, no después.
 */
const REQUIRED_SPECS_BY_TIER: Record<ProductCategoryTier, string[]> = {
  [ProductCategoryTier.INSUMOS_CRITICOS]: ['coe'],
  [ProductCategoryTier.PRO_TOOLS_MACHINERY]: ['voltaje'],
  [ProductCategoryTier.SERVICIOS_INDUSTRIALES]: [],
  [ProductCategoryTier.OBRAS_TERMINADAS]: [],
};

export interface ProductListFilters {
  categoryTier?: ProductCategoryTier;
  countryCode?: string;
  search?: string;
  technicalSpecs?: Record<string, unknown>;
  coeMin?: number;
  coeMax?: number;
  fusionTempMin?: number;
  fusionTempMax?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductionBatch) private batchRepo: Repository<ProductionBatch>,
    private radarService: ProximityRadarService,
  ) {}

  async createProduct(sellerId: string, dto: CreateProductDto): Promise<Product> {
    const requiredKeys = REQUIRED_SPECS_BY_TIER[dto.categoryTier];
    const missing = requiredKeys.filter((key) => !(key in dto.technicalSpecs));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Para la categoría ${dto.categoryTier} faltan especificaciones técnicas obligatorias: ${missing.join(', ')}`,
      );
    }
    if (dto.requiresMsds && !dto.msdsUrl) {
      throw new BadRequestException('Este producto requiere Ficha de Seguridad (MSDS) — falta msdsUrl');
    }

    const product = this.productRepo.create({
      ...dto,
      sellerId,
      minimumOrderQuantity: dto.minimumOrderQuantity ?? 1,
      media: dto.media !== undefined ? resolveGwsMediaOrThrow(dto.media) : null,
    });
    return this.productRepo.save(product);
  }

  async updateProduct(
    productId: string,
    sellerId: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Solo el vendedor propietario puede editar este producto');
    }

    // Si cambia la categoría o las specs, revalidar los mínimos de la
    // categoría resultante — un cambio no puede dejar al producto sin
    // los campos técnicos obligatorios de su categoría.
    const nextCategoryTier = dto.categoryTier ?? product.categoryTier;
    const nextSpecs = dto.technicalSpecs ?? product.technicalSpecs;
    const requiredKeys = REQUIRED_SPECS_BY_TIER[nextCategoryTier];
    const missing = requiredKeys.filter((key) => !(key in nextSpecs));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Para la categoría ${nextCategoryTier} faltan especificaciones técnicas obligatorias: ${missing.join(', ')}`,
      );
    }

    const media = dto.media !== undefined ? resolveGwsMediaOrThrow(dto.media) : product.media;
    Object.assign(product, { ...dto, media });
    return this.productRepo.save(product);
  }

  /** Soft-delete: no borra la fila, la marca inactiva para que salga del
   * catálogo público pero conserve su historial (lotes, pedidos futuros). */
  async deactivateProduct(productId: string, sellerId: string): Promise<{ deactivated: true }> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Solo el vendedor propietario puede desactivar este producto');
    }
    await this.productRepo.update(productId, { active: false });
    return { deactivated: true };
  }

  async addBatch(
    productId: string,
    sellerId: string,
    dto: AddBatchDto,
  ): Promise<ProductionBatch> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.sellerId !== sellerId) {
      throw new BadRequestException('Solo el vendedor propietario puede agregar lotes a este producto');
    }

    const batch = this.batchRepo.create({ ...dto, productId } as Partial<ProductionBatch>);
    return this.batchRepo.save(batch);
  }

  /**
   * Listado base del catálogo, con filtros y paginación. Filtro simple por
   * categoría, país del vendedor, búsqueda por texto y specs técnicas.
   */
  async listProducts(
    filters: ProductListFilters,
    page: number = DEFAULT_PAGE,
    limit: number = DEFAULT_LIMIT,
  ): Promise<Paginated<Product>> {
    const clampedLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const qb = this.buildFilteredQuery(filters);
    qb.orderBy('product.createdAt', 'DESC');
    qb.skip((page - 1) * clampedLimit).take(clampedLimit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      limit: clampedLimit,
      hasMore: page * clampedLimit < total,
    };
  }

  /** Detalle público de un producto. Requiere que esté activo. */
  async getProductById(productId: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id: productId, active: true } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  /** Productos de un vendedor (incluye inactivos: el vendedor necesita
   * ver qué desactivó y reactivar si quiere). */
  async listMyProducts(sellerId: string): Promise<Product[]> {
    return this.productRepo.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Listado agrupado por proximidad de mercado respecto al comprador
   * (ver ProximityRadarService y region-map.const.ts). Este es el
   * endpoint real que va a consumir el frontend de G2 — el radar no
   * es un filtro más, es el orden por defecto en el que un comprador
   * ve el marketplace.
   */
  async listProductsWithRadar(
    buyerCountryCode: string,
    filters: ProductListFilters,
  ): Promise<RadarGroupedResults> {
    const qb = this.buildFilteredQuery(filters);
    const products = await qb.orderBy('product.createdAt', 'DESC').getMany();
    return this.radarService.groupByRegion(products, buyerCountryCode);
  }

  /**
   * Filtro técnico dinámico sobre el JSONB de especificaciones. Usa el
   * operador de contención @> de PostgreSQL: technicalSpecs debe
   * CONTENER las claves/valores pedidos, no coincidir exactamente. Así
   * un filtro { coe: 96 } encuentra cualquier producto cuyo
   * technicalSpecs incluya "coe": 96, sin importar qué otras claves
   * tenga. Esto es lo que hace posible que un horno y una varilla de
   * vidrio, con specs completamente distintas, convivan en la misma
   * tabla y sigan siendo filtrables (ver brief original de G2).
   */
  private buildFilteredQuery(filters: ProductListFilters) {
    const qb = this.productRepo.createQueryBuilder('product').where('product.active = true');

    if (filters.categoryTier) {
      qb.andWhere('product.categoryTier = :tier', { tier: filters.categoryTier });
    }
    if (filters.countryCode) {
      qb.andWhere('product.sellerCountryCode = :cc', { cc: filters.countryCode });
    }
    if (filters.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    if (filters.technicalSpecs && Object.keys(filters.technicalSpecs).length > 0) {
      qb.andWhere('product.technicalSpecs @> :specs', {
        specs: JSON.stringify(filters.technicalSpecs),
      });
    }
    // Rangos técnicos sobre columnas tipadas (COE, temp de fusión).
    // Un producto sin el dato (null) NO matchea un rango: es honesto
    // con el comprador — no listar un vidrio del que no se conoce el COE.
    if (filters.coeMin !== undefined) {
      qb.andWhere('product.coe >= :coeMin', { coeMin: filters.coeMin });
    }
    if (filters.coeMax !== undefined) {
      qb.andWhere('product.coe <= :coeMax', { coeMax: filters.coeMax });
    }
    if (filters.fusionTempMin !== undefined) {
      qb.andWhere('product.fusionTemperatureC >= :fusionTempMin', {
        fusionTempMin: filters.fusionTempMin,
      });
    }
    if (filters.fusionTempMax !== undefined) {
      qb.andWhere('product.fusionTemperatureC <= :fusionTempMax', {
        fusionTempMax: filters.fusionTempMax,
      });
    }
    return qb;
  }
}
