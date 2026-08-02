import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { EscrowService } from './escrow.service';
import { CreateEscrowHoldDto } from './dto/create-escrow-hold.dto';
import { ClaimEscrowDto } from './dto/claim-escrow.dto';
import { RespondEscrowDto } from './dto/respond-escrow.dto';
import { ResolveEscrowDto } from './dto/resolve-escrow.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { RequiresElevation, ElevationGuard } from '../common/guards/elevation.guard';
import { GwsRole } from '../common/enums/gws-role.enum';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · EscrowController — Blindaje logístico y Escrow Inteligente
 * ------------------------------------------------------------
 * Matriz pública de liberación automática + protocolo de embalaje
 * certificado + retenciones del usuario. La liberación manual instantánea
 * ("OK / Recibido conforme") y el reclamo son del comprador; la resolución
 * de reclamos es SOLO admin + elevación ('manage_escrow_disputes').
 *
 * El movimiento REAL de fondos es del Payment_Vault (§3.1) — este módulo es
 * la máquina de estados (retención, vencimientos, confirmación, reclamo).
 */
@Controller('escrow')
export class EscrowController {
  constructor(private escrowService: EscrowService) {}

  /** Matriz de liberación + estándares de embalaje certificado (público). */
  @Get('release-matrix')
  releaseMatrix() {
    return this.escrowService.releaseMatrix();
  }

  /** Retenciones del usuario (como comprador o vendedor). */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  myEscrows(@Req() req: AuthedRequest) {
    return this.escrowService.listForUser(req.user.id);
  }

  /** Apertura de retención (el comprador retiene el pago). */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  createHold(@Body() dto: CreateEscrowHoldDto, @Req() req: AuthedRequest) {
    return this.escrowService.createHold(req.user.id, dto);
  }

  /** Liberación manual instantánea — "OK / Recibido conforme" (comprador). */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/confirm-receipt')
  confirmReceipt(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.escrowService.confirmReceipt(req.user.id, id);
  }

  /** Reclamo explícito → congela la liberación automática. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/claim')
  claim(@Param('id') id: string, @Body() dto: ClaimEscrowDto, @Req() req: AuthedRequest) {
    return this.escrowService.claim(req.user.id, id, dto.reason, dto.evidenceRefs ?? []);
  }

  /** Respuesta de la contraparte (vendedor) frente al reclamo — E1. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/respond')
  respondClaim(
    @Param('id') id: string,
    @Body() dto: RespondEscrowDto,
    @Req() req: AuthedRequest,
  ) {
    return this.escrowService.respondClaim(req.user.id, id, dto.response);
  }

  /** Resolución de reclamo — SOLO Jorge (admin + elevación). */
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Roles(GwsRole.ADMIN)
  @RequiresElevation('manage_escrow_disputes')
  @UseGuards(JwtAuthGuard, RolesGuard, ElevationGuard)
  @Put(':id/resolve')
  resolveClaim(
    @Param('id') id: string,
    @Body() dto: ResolveEscrowDto,
    @Req() req: AuthedRequest,
  ) {
    return this.escrowService.resolveClaim(
      req.user.id,
      id,
      dto.decision,
      dto.note,
      req.ip ?? 'unknown',
    );
  }

  /** READ-ONLY: retenciones vencidas sin reclamo — no muta la DB (E8). */
  @Roles(GwsRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('pending-releases')
  listPendingAutoReleases() {
    return this.escrowService.listPendingAutoReleases();
  }

  /**
   * SWEEP REAL de liberación automática — ADMIN + elevación. Único punto que
   * persiste la transición HELD → RELEASED por vencimiento (E8). Corrélo en el
   * banco de pruebas de Codespace para validar el mecanismo end-to-end.
   */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Roles(GwsRole.ADMIN)
  @RequiresElevation('manage_escrow_disputes')
  @UseGuards(JwtAuthGuard, RolesGuard, ElevationGuard)
  @Post('pending-releases/process')
  processPendingAutoReleases() {
    return this.escrowService.processPendingAutoReleases();
  }

  /** Disputas (CLAIMED) con SLA de resolución vencido — marcadas escaladas. */
  @Roles(GwsRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('escalated-disputes')
  escalatedDisputes() {
    return this.escrowService.markEscalatedDisputes();
  }
}
