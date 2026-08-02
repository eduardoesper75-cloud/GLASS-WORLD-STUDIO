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
@Controller('vault')
export class VaultController {
  constructor(private vaultService: VaultService) {}

  @Get('categories')
  categories() {
    return this.vaultService.listCategories();
  }

  @Get('documents')
  documents(@Query() query: ListVaultDocumentsQueryDto) {
    return this.vaultService.listDocuments(query);
  }

  @Get('documents/mine')
  @UseGuards(JwtAuthGuard)
  mine(@Req() req: AuthedRequest) {
    return this.vaultService.listMine(req.user.id);
  }

  @Get('documents/:id')
  document(@Param('id') id: string) {
    return this.vaultService.getDocument(id);
  }

  @Get('legal')
  legal(@Query('lang') lang?: string) {
    return this.vaultService.getLegal(lang === 'en' ? 'en' : 'es');
  }

  @Get('reference-data')
  referenceData() {
    return this.vaultService.getReferenceData();
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard)
  @Post('documents')
  upload(@Body() dto: CreateVaultDocumentDto, @Req() req: AuthedRequest) {
    return this.vaultService.upload(req.user.id, dto, req.ip ?? '');
  }

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
