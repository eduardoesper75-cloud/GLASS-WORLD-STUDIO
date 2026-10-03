import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { VaultService } from './vault.service';
import { CreateVaultDocumentDto } from './dto/create-vault-document.dto';
import { ReviewVaultDocumentDto } from './dto/review-vault-document.dto';
import { ListVaultDocumentsQueryDto } from './dto/list-vault-documents.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { GwsRole } from '../common/enums/gws-role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · VaultController — Bóveda del Conocimiento
 * ------------------------------------------------------------
 * Público (sin sesión):
 *   GET /vault/categories      árbol de la taxonomía.
 *   GET /vault/documents       búsqueda (SOLO publicados).
 *   GET /vault/documents/:id   detalle publicado.
 *   GET /vault/legal           cláusulas safe-harbor es/en.
 *   GET /vault/reference-data  referencias técnicas canónicas (COE, curvas,
 *                              normas) — datos públicos de consulta.
 *
 * Autenticado:
 *   POST /vault/documents      alta (under_review) — limitada a 5/min
 *                              para frenar spam de subidas.
 *   GET  /vault/documents/mine uploads propios.
 *
 * Curador (moderador de cualquier galaxia o admin):
 *   POST /vault/documents/:id/review  publicar o rechazar.
 */
@ApiTags('vault')
@Controller('vault')
export class VaultController {
  constructor(private vaultService: VaultService) {}

  @ApiOperation({ summary: 'Categorías', description: 'Árbol de la taxonomía de la Bóveda (público).' })
  @Get('categories')
  categories() {
    return this.vaultService.listCategories();
  }

  @ApiOperation({ summary: 'Buscar documentos', description: 'Búsqueda de documentos PUBLICADOS con filtros (público).' })
  @Get('documents')
  documents(@Query() query: ListVaultDocumentsQueryDto) {
    return this.vaultService.listDocuments(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis documentos', description: 'Subidas del usuario autenticado (incluye under_review).' })
  @Get('documents/mine')
  @UseGuards(JwtAuthGuard)
  mine(@Req() req: AuthedRequest) {
    return this.vaultService.listMine(req.user.id);
  }

  @ApiOperation({ summary: 'Detalle de documento', description: 'Detalle de un documento publicado.' })
  @ApiParam({ name: 'id', description: 'UUID del documento', type: String })
  @Get('documents/:id')
  document(@Param('id') id: string) {
    return this.vaultService.getDocument(id);
  }

  @ApiOperation({ summary: 'Cláusulas legal', description: 'Cláusulas safe-harbor es/en (público).' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'], description: 'Idioma (default es)' })
  @Get('legal')
  legal(@Query('lang') lang?: string) {
    return this.vaultService.getLegal(lang === 'en' ? 'en' : 'es');
  }

  @ApiOperation({ summary: 'Datos de referencia', description: 'Referencias técnicas canónicas (COE, curvas, normas) — público.' })
  @Get('reference-data')
  referenceData() {
    return this.vaultService.getReferenceData();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subir documento', description: 'Alta de documento (under_review). Limitada a 5/min por IP.' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard)
  @Post('documents')
  upload(@Body() dto: CreateVaultDocumentDto, @Req() req: AuthedRequest) {
    return this.vaultService.upload(req.user.id, dto, req.ip ?? '');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revisar documento', description: 'Curador o admin: publica o rechaza un documento (under_review).' })
  @ApiParam({ name: 'id', description: 'UUID del documento', type: String })
  @Roles(
    GwsRole.MODERATOR_G1,
    GwsRole.MODERATOR_G2,
    GwsRole.MODERATOR_G3,
    GwsRole.MODERATOR_G4,
    GwsRole.MODERATOR_G5,
    GwsRole.MODERATOR_G6,
    GwsRole.ADMIN,
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('documents/:id/review')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewVaultDocumentDto,
    @Req() req: AuthedRequest,
  ) {
    return this.vaultService.review(
      id,
      req.user.id,
      dto.decision,
      dto.rejectReason,
      dto.moderationNote,
      req.ip ?? '',
    );
  }
}
