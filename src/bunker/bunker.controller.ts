import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { BunkerService } from './bunker.service';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { QuoteServiceRequestDto } from './dto/quote-service-request.dto';
import { QuoteMembershipDto } from './dto/quote-membership.dto';
import { ListSpecialistsQueryDto } from './dto/list-specialists-query.dto';
import { VerifySpecialistDto } from './dto/verify-specialist.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { RequiresElevation, ElevationGuard } from '../common/guards/elevation.guard';
import { GwsRole } from '../common/enums/gws-role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · BunkerController — Búnker de Ingeniería Especializada
 * ------------------------------------------------------------
 * Directorio público (solo cartera verificada) + tickets técnicos
 * Service On-Demand + membresía pro USD 50/mes con fidelización.
 *
 * La verificación de especialistas es SOLO admin + elevación
 * ('verify_bunker_specialist') — decisión de confianza técnica de Jorge.
 * El cobro real es del Payment_Vault (§3.1); aquí display + estado.
 */
@ApiTags('bunker')
@Controller('bunker')
export class BunkerController {
  constructor(private bunkerService: BunkerService) {}

  /** Reglas del Búnker (tarifa membresía, comisión 0%, descuentos). */
  @ApiOperation({ summary: 'Metadatos del Búnker', description: 'Reglas: tarifa de membresía, comisión 0%, descuentos (público).' })
  @Get('meta')
  meta() {
    return this.bunkerService.meta();
  }

  /** Directorio público de especialistas verificados (filtros región/especialidad). */
  @ApiOperation({ summary: 'Listar especialistas', description: 'Directorio público de especialistas verificados (público).' })
  @Get('specialists')
  listSpecialists(@Query() query: ListSpecialistsQueryDto) {
    return this.bunkerService.listSpecialists(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear especialista', description: 'Alta en el directorio del Búnker (autenticado).' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('specialists')
  createSpecialist(@Body() dto: CreateSpecialistDto, @Req() req: AuthedRequest) {
    return this.bunkerService.createSpecialist(req.user.id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar especialista', description: 'Actualiza el perfil de especialista del usuario autenticado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('specialists')
  updateSpecialist(@Body() dto: UpdateSpecialistDto, @Req() req: AuthedRequest) {
    return this.bunkerService.updateSpecialist(req.user.id, dto);
  }

  /** Sello de cartera élite — SOLO Jorge (admin + sesión elevada). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar especialista', description: 'ADMIN + elevación. Sella la cartera élite (confianza técnica).' })
  @ApiParam({ name: 'id', description: 'UUID del especialista', type: String })
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Roles(GwsRole.ADMIN)
  @RequiresElevation('verify_bunker_specialist')
  @UseGuards(JwtAuthGuard, RolesGuard, ElevationGuard)
  @Put('specialists/:id/verify')
  verifySpecialist(
    @Param('id') id: string,
    @Body() dto: VerifySpecialistDto,
    @Req() req: AuthedRequest,
  ) {
    return this.bunkerService.verifySpecialist(req.user.id, id, dto.verified, req.ip ?? 'unknown');
  }

  /** Ingreso de ticket técnico (Service On-Demand). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear request de servicio', description: 'Ingresa un ticket técnico Service On-Demand.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('requests')
  createRequest(@Body() dto: CreateServiceRequestDto, @Req() req: AuthedRequest) {
    return this.bunkerService.createRequest(req.user.id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis requests', description: 'Tickets del usuario autenticado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('requests')
  listRequests(@Req() req: AuthedRequest) {
    return this.bunkerService.listRequests(req.user.id);
  }

  /** El especialista toma un ticket y fija honorarios (0% comisión). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cotizar request', description: 'El especialista toma el ticket y fija honorarios (0% comisión).' })
  @ApiParam({ name: 'id', description: 'UUID del request', type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('requests/:id/quote')
  quoteRequest(
    @Param('id') id: string,
    @Body() dto: QuoteServiceRequestDto,
    @Req() req: AuthedRequest,
  ) {
    return this.bunkerService.quoteRequest(req.user.id, id, dto.feeUsd);
  }

  /** Cotización transparente de membresía pro (público). */
  @ApiOperation({ summary: 'Cotizar membresía', description: 'Cotización transparente de membresía pro (público).' })
  @Get('memberships/quote')
  quoteMembership(@Query() query: QuoteMembershipDto) {
    return this.bunkerService.quoteMembership(
      query.planMonths,
      query.settlementCurrency,
      query.paymentMethod,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suscribirse a membresía', description: 'Alta de membresía pro (el cobro real es del Payment_Vault).' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('memberships')
  subscribeMembership(@Body() dto: QuoteMembershipDto, @Req() req: AuthedRequest) {
    return this.bunkerService.subscribeMembership(
      req.user.id,
      dto.planMonths,
      dto.settlementCurrency,
      dto.paymentMethod,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis membresías', description: 'Membresías del usuario autenticado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('memberships')
  myMemberships(@Req() req: AuthedRequest) {
    return this.bunkerService.myMemberships(req.user.id);
  }
}
