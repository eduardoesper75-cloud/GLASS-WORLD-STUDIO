import { Controller, Get, Query, Req, Post, Body, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionPricingService } from './subscription-pricing.service';
import { QuoteSubscriptionDto } from './dto/quote-subscription.dto';
import { CreateSubscriptionStubDto } from './dto/create-subscription-stub.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { GwsRole } from '../common/enums/gws-role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · SubscriptionsController — catálogo y membresías
 * ------------------------------------------------------------
 * /plans y /quote son PÚBLICOS: el tarifario se muestra en la
 * Portada a cualquiera (es información de marketing oficial).
 * /mine y el POST de stub exigen sesión (admin para el stub).
 *
 * El POST /subscriptions es un STUB de desarrollo: crea el registro
 * que el GalaxyAccessGuard necesita para probar la transición
 * post-fundación. NO cobra nada y NO debe existir en producción —
 * ahí la fila la crea el Payment_Vault al confirmar el pago (§3.1).
 */
@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private pricing: SubscriptionPricingService) {}

  /** Tarifario completo + descuentos de fidelización (exhibición). */
  @ApiOperation({ summary: 'Tarifario', description: 'Planes y suscripciones con descuentos de fidelización (público).' })
  @Get('plans')
  listPlans() {
    return this.pricing.listPlans();
  }

  /** Cotización: /subscriptions/quote?galaxy=g5&months=12 */
  @ApiOperation({ summary: 'Cotizar', description: 'Cotiza el precio de una suscripción por galaxia y meses (público).' })
  @ApiQuery({ name: 'galaxy', type: String, description: 'ID de la galaxia (g1..g6)', required: true })
  @ApiQuery({ name: 'months', type: Number, description: 'Cantidad de meses', required: false })
  @Get('quote')
  quote(@Query() query: QuoteSubscriptionDto) {
    return this.pricing.quote(query.galaxy, query.months);
  }

  /** Mis suscripciones (autenticado). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis suscripciones', description: 'Suscripciones del usuario autenticado.' })
  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@Req() req: AuthedRequest) {
    return this.pricing.listMine(req.user.id);
  }

  /** STUB de desarrollo: crear membresía sin pago. Solo admin. */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear suscripción (stub dev)', description: 'ADMIN. STUB de desarrollo: crea la membresía sin pago (no debe existir en producción).' })
  @Roles(GwsRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  createStub(@Body() dto: CreateSubscriptionStubDto, @Req() req: AuthedRequest) {
    return this.pricing.createStub(req.user.id, dto.galaxy, dto.months, dto.paidThrough);
  }
}
