import { Controller, Get, Post, Body, Req, UseGuards, Sse } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { FoundationService } from './foundation.service';
import { ClaimFoundingSlotDto } from './dto/claim-founding-slot.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · FoundationController — Cupos de fundación (Portada)
 * ------------------------------------------------------------
 * /slots y /slots/stream son PÚBLICOS: los contadores de la Portada
 * se muestran a cualquiera (es marketing de lanzamiento, no data
 * sensible — el estado de la fundación es público por diseño).
 *
 * /claims exige sesión: tomar un cupo es una acción de cuenta.
 * La toma está rate-limitada a 5/min/IP para evitar llenar la
 * fundación con bots (ver ThrottlerModule global en app.module).
 */
@ApiTags('foundation')
@Controller('foundation')
export class FoundationController {
  constructor(private foundationService: FoundationService) {}

  /** Snapshot de todos los cupos (galaxia, total, tomados, libres). */
  @ApiOperation({ summary: 'Cupos de fundación', description: 'Snapshot de todos los cupos (galaxia, total, tomados, libres) — público.' })
  @Get('slots')
  getSlots() {
    return this.foundationService.getSlots();
  }

  /** SSE de contadores en vivo — la Portada se suscribe acá. */
  @ApiOperation({ summary: 'Stream de cupos (SSE)', description: 'Contadores en vivo vía Server-Sent Events (público).' })
  @Sse('slots/stream')
  streamSlots(): Observable<{ data: unknown }> {
    return this.foundationService.stream();
  }

  /** Toma de cupo de fundación. Autenticada + limitada. */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tomar cupo de fundación', description: 'Toma de cupo (autenticada, 5/min por IP).' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard)
  @Post('claims')
  claim(@Body() dto: ClaimFoundingSlotDto, @Req() req: AuthedRequest) {
    return this.foundationService.claim(req.user.id, dto.galaxy);
  }

  /** "Mis cupos": los claims del usuario autenticado. */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis cupos', description: 'Claims del usuario autenticado.' })
  @UseGuards(JwtAuthGuard)
  @Get('claims/mine')
  myClaims(@Req() req: AuthedRequest) {
    return this.foundationService.listClaims(req.user.id);
  }
}
