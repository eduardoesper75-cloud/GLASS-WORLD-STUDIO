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
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  /** Crea la orden de compra (idempotente por idempotencyKey, ADR-001). */
  @Post()
  create(@Body() dto: CreateOrderDto, @Req() req: AuthedRequest) {
    return this.ordersService.create(req.user.id, dto);
  }

  /** Órdenes del comprador autenticado, más recientes primero. */
  @Get()
  myOrders(@Req() req: AuthedRequest) {
    return this.ordersService.findByUser(req.user.id);
  }

  /** Detalle de una orden — solo su dueño (si no es suya: 404, no leak). */
  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: AuthedRequest) {
    return this.ordersService.findById(id, req.user.id);
  }

  /** Cancela la orden PENDING (ADR-003); los pagos PENDING quedan FAILED. */
  @Post(':id/cancel')
  cancel(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: AuthedRequest) {
    return this.ordersService.cancel(id, req.user.id);
  }
}