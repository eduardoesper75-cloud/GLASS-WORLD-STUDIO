import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { MarketplaceService } from './marketplace.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AddBatchDto } from './dto/add-batch.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { IdParamDto } from './dto/id-param.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · MarketplaceController — Galaxia 2 (Marketplace) + Galaxia 3
 * ------------------------------------------------------------
 * Catálogo público (listado, filtrado, detalle, radar) y gestión del
 * vendedor (alta, edición, lotes, desactivación). Validación estricta:
 * TODO lo que entra (body, query, params) pasa por DTOs con
 * class-validator — el ValidationPipe global con whitelist +
 * forbidNonWhitelisted rechaza cualquier campo desconocido.
 */
@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  /** Alta de producto: requiere estar autenticado. Cualquier suscriptor
   * puede vender — no se restringe por rol especial en este mes; si más
   * adelante se decide que solo cuentas "verificadas como comerciante"
   * puedan publicar, eso se agrega como un campo en User + un guard
   * adicional, no rediseñando esto. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('products')
  createProduct(@Body() dto: CreateProductDto, @Req() req: AuthedRequest) {
    return this.marketplaceService.createProduct(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('products/:productId/batches')
  addBatch(
    @Param('productId') productId: string,
    @Body() dto: AddBatchDto,
    @Req() req: AuthedRequest,
  ) {
    return this.marketplaceService.addBatch(productId, req.user.id, dto);
  }

  /**
   * Listado público — no requiere autenticación, cualquiera puede
   * explorar el marketplace antes de crear cuenta. Filtros validados
   * en ListProductsQueryDto (enum, ISO 3166-1, JSON de specs, paginación).
   */
  @Get('products')
  listProducts(@Query() query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return this.marketplaceService.listProducts(
      {
        categoryTier: query.categoryTier,
        countryCode: query.countryCode,
        search: query.search,
        technicalSpecs: query.specs,
        coeMin: query.coeMin,
        coeMax: query.coeMax,
        fusionTempMin: query.fusionTempMin,
        fusionTempMax: query.fusionTempMax,
      },
      page,
      limit,
    );
  }

  /**
   * Productos del vendedor autenticado (incluye inactivos) — para el
   * panel "Mis productos" del vendedor.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('products/mine')
  listMyProducts(@Req() req: AuthedRequest) {
    return this.marketplaceService.listMyProducts(req.user.id);
  }

  /**
   * Radar de Oferta/Demanda: agrupa el catálogo en local/regional/global
   * respecto al país del comprador. buyerCountryCode es OBLIGATORIO acá
   * a propósito — no hay un default silencioso a "AR" en el backend,
   * para no asumir la ubicación de alguien que no la proveyó. La
   * decisión de qué default mostrar si el usuario no compartió su país
   * (¿preguntarle? ¿usar geolocalización del request?) es de producto,
   * pendiente de definir — el frontend es quien decide qué mandar acá.
   *
   * Declarada ANTES de /products/:id para que "radar" no sea capturado
   * como id de producto por el router de Express.
   */
  @Get('products/radar')
  listWithRadar(
    @Query('buyerCountryCode') buyerCountryCode: string,
    @Query() query: ListProductsQueryDto,
  ) {
    if (!buyerCountryCode) {
      throw new BadRequestException('buyerCountryCode es requerido para calcular el radar de proximidad');
    }
    return this.marketplaceService.listProductsWithRadar(
      buyerCountryCode,
      {
        categoryTier: query.categoryTier,
        search: query.search,
        technicalSpecs: query.specs,
        coeMin: query.coeMin,
        coeMax: query.coeMax,
        fusionTempMin: query.fusionTempMin,
        fusionTempMax: query.fusionTempMax,
      },
    );
  }

  /** Detalle público de un producto individual. */
  @Get('products/:id')
  getProductById(@Param() params: IdParamDto) {
    return this.marketplaceService.getProductById(params.id);
  }

  /** Edición parcial del producto (solo el vendedor propietario). */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('products/:id')
  updateProduct(
    @Param() params: IdParamDto,
    @Body() dto: UpdateProductDto,
    @Req() req: AuthedRequest,
  ) {
    return this.marketplaceService.updateProduct(params.id, req.user.id, dto);
  }

  /** Soft-delete del producto (solo el vendedor propietario). */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('products/:id')
  deactivateProduct(@Param() params: IdParamDto, @Req() req: AuthedRequest) {
    return this.marketplaceService.deactivateProduct(params.id, req.user.id);
  }
}
