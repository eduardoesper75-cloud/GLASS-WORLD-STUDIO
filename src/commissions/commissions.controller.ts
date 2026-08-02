import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { CommissionsService } from './commissions.service';
import { UpdateCommissionRulesDto } from './dto/update-commission-rules.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { RequiresElevation, ElevationGuard } from '../common/guards/elevation.guard';
import { GwsRole } from '../common/enums/gws-role.enum';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · CommissionsController
 * ------------------------------------------------------------
 * GET /commissions      — política pública (display).
 * PUT /commissions/rules — edición SOLO ADMIN + elevación
 *                          ('edit_liquidation_rules', §3.1/§3.5).
 */
@Controller('commissions')
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  @Get()
  list() {
    return this.commissionsService.list();
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Roles(GwsRole.ADMIN)
  @RequiresElevation('edit_liquidation_rules')
  @UseGuards(JwtAuthGuard, RolesGuard, ElevationGuard)
  @Put('rules')
  updateRules(@Body() dto: UpdateCommissionRulesDto, @Req() req: AuthedRequest) {
    return this.commissionsService.updateRules(
      dto.rules,
      req.user.id,
      req.ip ?? 'unknown',
    );
  }
}
