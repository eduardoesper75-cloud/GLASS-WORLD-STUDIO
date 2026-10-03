import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { GwsRole } from '../common/enums/gws-role.enum';

class PostMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

class HideMessageDto {
  @IsString()
  @MinLength(3)
  reason: string;
}

type AuthedRequest = Request & { user: { id: string; role: GwsRole } };

@ApiTags('community')
@Controller('community')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  /** Cualquier suscriptor autenticado puede postear — no requiere rol
   * especial, por eso no lleva @Roles(). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Postear mensaje', description: 'Publica en un canal de la comunidad (autenticado).' })
  @ApiParam({ name: 'channelId', description: 'UUID del canal', type: String })
  @Post('channels/:channelId/messages')
  postMessage(
    @Param('channelId') channelId: string,
    @Body() dto: PostMessageDto,
    @Req() req: AuthedRequest,
  ) {
    const ip = req.ip ?? 'unknown';
    return this.communityService.postMessage(req.user.id, channelId, dto.content, ip);
  }

  @ApiOperation({ summary: 'Listar mensajes', description: 'Mensajes de un canal (público).' })
  @ApiParam({ name: 'channelId', description: 'UUID del canal', type: String })
  @Get('channels/:channelId/messages')
  listMessages(@Param('channelId') channelId: string, @Query('limit') limit?: string) {
    return this.communityService.listChannelMessages(channelId, limit ? parseInt(limit, 10) : 50);
  }

  /** Moderación: requiere ser moderador de G3 o admin. Ver RolesGuard —
   * esto NO requiere ElevationGuard (moderar contenido no está en
   * ACTIONS_REQUIRING_ELEVATION, ver CLAUDE.md/gws-role.enum.ts). */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ocultar mensaje', description: 'Moderador G3 o admin: oculta un mensaje (moderación).' })
  @ApiParam({ name: 'messageId', description: 'UUID del mensaje', type: String })
  @Roles(GwsRole.MODERATOR_G3, GwsRole.ADMIN)
  @Post('messages/:messageId/hide')
  hideMessage(
    @Param('messageId') messageId: string,
    @Body() dto: HideMessageDto,
    @Req() req: AuthedRequest,
  ) {
    const ip = req.ip ?? 'unknown';
    return this.communityService.hideMessage(messageId, req.user.id, dto.reason, ip);
  }
}
