import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { G6TechSheetsService } from './g6-tech-sheets.service';
import { SuggestTechSheetDto } from './dto/suggest-tech-sheet.dto';
import { CreateTechSheetDto } from './dto/create-tech-sheet.dto';
import { G6_TECH_FAMILIES, G6_TECH_FAMILY_LABELS, G6_TECH_SHEETS_NOTE } from './g6-tech-sheets.const';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · G6TechSheetsController — Autopredictor técnico (Galaxia 6)
 * ------------------------------------------------------------
 * Base de datos inteligente y preconfigurada de fichas técnicas:
 *   · GET /g6/tech-sheets/catalog  → catálogo de templates precargados.
 *   · POST /g6/tech-sheets/suggest → AUTOPREDICTOR (match por patrón, la
 *     ficha técnica oficial se autocompleta).
 *   · POST /g6/tech-sheets         → alta (autocompletada o manual fallback).
 *   · GET  /g6/tech-sheets/mine    → fichas del comerciante.
 */
@ApiTags('g6-tech-sheets')
@Controller('g6/tech-sheets')
export class G6TechSheetsController {
  constructor(private techSheetsService: G6TechSheetsService) {}

  /** Catálogo de fichas técnicas precargadas (público). */
  @ApiOperation({ summary: 'Catálogo de templates', description: 'Fichas técnicas precargadas (público).' })
  @Get('catalog')
  catalog() {
    return this.techSheetsService.catalog();
  }

  /** Meta del módulo: familias + nota de gobernanza. */
  @ApiOperation({ summary: 'Meta del módulo', description: 'Familias técnicas + nota de gobernanza.' })
  @Get('meta')
  meta() {
    return {
      families: [...G6_TECH_FAMILIES],
      familyLabels: G6_TECH_FAMILY_LABELS,
      note: G6_TECH_SHEETS_NOTE,
    };
  }

  /** Autopredictor: autocompleta la ficha oficial por patrón (comerciante). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Autopredictor', description: 'Autocompleta la ficha oficial por patrón (comerciante).' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('suggest')
  suggest(@Body() dto: SuggestTechSheetDto) {
    return this.techSheetsService.suggest(dto.productName);
  }

  /** Alta de ficha técnica (autocompletada o manual). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear ficha técnica', description: 'Alta de ficha técnica (autocompletada o manual).' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateTechSheetDto, @Req() req: AuthedRequest) {
    return this.techSheetsService.create(req.user.id, dto);
  }

  /** Fichas del comerciante autenticado. */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis fichas técnicas', description: 'Fichas del comerciante autenticado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('mine')
  mine(@Req() req: AuthedRequest) {
    return this.techSheetsService.mine(req.user.id);
  }
}
