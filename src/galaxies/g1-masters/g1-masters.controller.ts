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
} from '@nestjs/common';
import { Request } from 'express';
import { G1MastersService } from './g1-masters.service';
import { CreateMasterDto } from './dto/create-master.dto';
import { UpdateMasterDto } from './dto/update-master.dto';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { RequiresElevation, ElevationGuard } from '../../common/guards/elevation.guard';
import { GwsRole } from '../../common/enums/gws-role.enum';
import { MasterCatalogItemType } from './masters.enums';
import { SetMasterVerificationDto } from './dto/set-master-verification.dto';
import { SetMaestroRoleDto } from './dto/set-maestro-role.dto';

type AuthedRequest = Request & { user: { id: string; role?: string } };

/**
 * GWS · Galaxia 1 — Maestros e Íconos del Vidrio
 * ------------------------------------------------------------
 * Cada maestro gestiona su propio frente de autor: perfil público +
 * catálogo personal (obras de autor, cursos, talleres, líneas
 * exclusivas). Modelo de catálogos independientes por cuenta con rol
 * MAESTRO. Ver CLAUDE.md tabla G1.
 */
@Controller('g1/masters')
export class G1MastersController {
  constructor(private mastersService: G1MastersService) {}

  // ---------- Perfil ----------

  /** Alta de perfil de maestro: cualquier usuario autenticado puede
   * solicitar su frente de autor. El rol MAESTRO se asigna por separado
   * (ver gws-role.enum.ts); el perfil se cuelga de la cuenta del token. */
  @UseGuards(JwtAuthGuard)
  @Post()
  createMaster(@Body() dto: CreateMasterDto, @Req() req: AuthedRequest) {
    return this.mastersService.createMaster(req.user.id, dto);
  }

  /** Listado público de maestros (solo activos). */
  @Get()
  listMasters(
    @Query('tier') tier?: string,
    @Query('countryCode') countryCode?: string,
    @Query('verified') verifiedRaw?: string,
    @Query('search') search?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const page = Math.max(parseInt(pageRaw ?? '1', 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(limitRaw ?? '20', 10) || 20, 1), 100);
    const verified = verifiedRaw === 'true' ? true : verifiedRaw === 'false' ? false : undefined;
    return this.mastersService.listMasters({ tier, countryCode, verified, search }, page, limit);
  }

  /** Perfil propio (incluye inactivos, para reactivar). */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyMasterProfile(@Req() req: AuthedRequest) {
    return this.mastersService.getMyMasterProfile(req.user.id);
  }

  /** Detalle público de un maestro. */
  @Get(':id')
  getMasterById(@Param('id') id: string) {
    return this.mastersService.getMasterById(id);
  }

  /** Edición del perfil — solo el dueño. */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateMaster(@Param('id') id: string, @Body() dto: UpdateMasterDto, @Req() req: AuthedRequest) {
    return this.mastersService.updateMaster(id, req.user.id, dto);
  }

  // ---------- Administración (Jorge — admin + elevación) ----------

  /** Sello "verificado" del perfil. Solo Jorge: admin + sesión elevada
   * (TOTP reciente). No es el rol MAESTRO (ver verifyMaster en el service). */
  @Roles(GwsRole.ADMIN)
  @RequiresElevation('verify_g1_master')
  @UseGuards(JwtAuthGuard, RolesGuard, ElevationGuard)
  @Patch(':id/verification')
  verifyMaster(
    @Param('id') id: string,
    @Body() dto: SetMasterVerificationDto,
    @Req() req: AuthedRequest,
  ) {
    const ip = req.ip ?? 'unknown';
    return this.mastersService.verifyMaster(id, req.user.id, dto.verified, ip);
  }

  /** Otorga/revoca el rol MAESTRO de la cuenta del perfil. Solo Jorge:
   * admin + sesión elevada. Es lo que habilita vender en G1. */
  @Roles(GwsRole.ADMIN)
  @RequiresElevation('grant_maestro_role')
  @UseGuards(JwtAuthGuard, RolesGuard, ElevationGuard)
  @Patch(':id/maestro-role')
  setMaestroRole(
    @Param('id') id: string,
    @Body() dto: SetMaestroRoleDto,
    @Req() req: AuthedRequest,
  ) {
    const ip = req.ip ?? 'unknown';
    return this.mastersService.setMaestroRole(id, req.user.id, dto.granted, ip);
  }

  // ---------- Catálogo de autor ----------

  /** Catálogo público de un maestro (solo ítems activos). */
  @Get(':id/catalog')
  listCatalog(@Param('id') id: string, @Query('itemType') itemType?: MasterCatalogItemType) {
    return this.mastersService.listCatalog(id, itemType);
  }

  /** Alta de ítem en el catálogo de autor — solo el maestro dueño.
   * Requiere rol MAESTRO (cuentas habilitadas para vender en G1). */
  @Roles(GwsRole.MAESTRO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/catalog')
  createCatalogItem(@Param('id') id: string, @Body() dto: CreateCatalogItemDto, @Req() req: AuthedRequest) {
    return this.mastersService.createCatalogItem(id, req.user.id, dto);
  }

  /** Edición de ítem — solo el maestro dueño. */
  @Roles(GwsRole.MAESTRO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/catalog/:itemId')
  updateCatalogItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCatalogItemDto,
    @Req() req: AuthedRequest,
  ) {
    return this.mastersService.updateCatalogItem(id, itemId, req.user.id, dto);
  }

  /** Soft-delete de ítem — solo el maestro dueño. */
  @Roles(GwsRole.MAESTRO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/catalog/:itemId')
  deactivateCatalogItem(@Param('id') id: string, @Param('itemId') itemId: string, @Req() req: AuthedRequest) {
    return this.mastersService.deactivateCatalogItem(id, itemId, req.user.id);
  }
}
