import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { BillboardsService } from './billboards.service';
import { CreateAdCampaignDto } from './dto/create-ad-campaign.dto';
import { ListBillboardsQueryDto } from './dto/list-billboards-query.dto';
import { ToggleBillboardDto } from './dto/toggle-billboard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { RequiresElevation, ElevationGuard } from '../common/guards/elevation.guard';
import { GwsRole } from '../common/enums/gws-role.enum';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · BillboardsController — Carteleras publicitarias dinámicas
 * ------------------------------------------------------------
 * Consulta pública (carteleras, disponibilidad, calendario, feed de ads
 * al aire) + reserva del anunciante (crear, listar, cancelar) + pausa de
 * cartelera SOLO admin con elevación ('manage_billboards').
 *
 * El cobro real es del Payment_Vault (§3.1); aquí solo display + estado.
 */
@Controller('billboards')
export class BillboardsController {
  constructor(private billboardsService: BillboardsService) {}

  /** Carteleras por galaxia con estado en vivo (ocupada / próximo hueco). */
  @Get()
  list(@Query() query: ListBillboardsQueryDto) {
    return this.billboardsService.listBillboards(query.galaxy);
  }

  /** Calendario de disponibilidad (60 días) con fila de espera. */
  @Get('availability')
  availability(@Query() query: ListBillboardsQueryDto) {
    return this.billboardsService.availability(query.galaxy);
  }

  /** Feed de lo que está al aire AHORA (lo que muestra cada cartelera). */
  @Get('active')
  activeAds(@Query() query: ListBillboardsQueryDto) {
    return this.billboardsService.activeAds(query.galaxy);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('campaigns')
  createCampaign(@Body() dto: CreateAdCampaignDto, @Req() req: AuthedRequest) {
    return this.billboardsService.createCampaign(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('campaigns')
  myCampaigns(@Req() req: AuthedRequest) {
    return this.billboardsService.myCampaigns(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('campaigns/:id')
  cancelCampaign(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.billboardsService.cancelCampaign(id, req.user.id);
  }

  /** Pausar/reanudar cartelera — SOLO admin + sesión elevada. */
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Roles(GwsRole.ADMIN)
  @RequiresElevation('manage_billboards')
  @UseGuards(JwtAuthGuard, RolesGuard, ElevationGuard)
  @Put(':id/toggle')
  toggleBillboard(
    @Param('id') id: string,
    @Body() dto: ToggleBillboardDto,
    @Req() req: AuthedRequest,
  ) {
    return this.billboardsService.toggleBillboard(id, dto.active, req.user.id, req.ip ?? 'unknown');
  }
}
