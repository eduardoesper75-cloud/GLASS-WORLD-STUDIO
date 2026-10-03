import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · OrdersController — Checkout (P0)
 * ------------------------------------------------------------
 * Punto de entrada al checkout: crea la orden PENDING, resuelve precios
 * contra el catálogo y registra la intención de pago (el dinero real es
 * del Payment_Vault §3.1). Todas las rutas exigen JWT: el comprador sale
 * del token, nunca del body. La cancelación respeta la máquina de estados
 * (solo PENDING sin pago capturado).
 */
@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  /** Crea la orden de compra (idempotente por idempotencyKey, ADR-001). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear orden de compra', description: 'Crea la orden en estado PENDING (idempotente vía idempotencyKey). Resuelve precios contra el catálogo. Requiere JWT.' })
  @Post()
  create(@Body() dto: CreateOrderDto, @Req() req: AuthedRequest) {
    return this.ordersService.create(req.user.id, dto);
  }

  /** Órdenes del comprador autenticado, más recientes primero. */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis órdenes', description: 'Órdenes del comprador autenticado, más recientes primero.' })
  @Get()
  myOrders(@Req() req: AuthedRequest) {
    return this.ordersService.findByUser(req.user.id);
  }

  /** Detalle de una orden — solo su dueño (si no es suya: 404, no leak). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalle de orden', description: 'Detalle de una orden. Solo su dueño; si no es suya responde 404 (no leak).' })
  @ApiParam({ name: 'id', description: 'UUID de la orden', type: String })
  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: AuthedRequest) {
    return this.ordersService.findById(id, req.user.id);
  }

  /** Cancela la orden PENDING (ADR-003); los pagos PENDING quedan FAILED. */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar orden', description: 'Cancela una orden PENDING; sus pagos PENDING pasan a FAILED (ADR-003).' })
  @ApiParam({ name: 'id', description: 'UUID de la orden', type: String })
  @Post(':id/cancel')
  cancel(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: AuthedRequest) {
    return this.ordersService.cancel(id, req.user.id);
  }
}