import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UX_MANIFEST, UxManifest } from './ux.const';

/**
 * GWS · UX — manifiesto de experiencia
 * ------------------------------------------------------------
 * Endpoint público y versionado: los agentes (y el frontend) auditan la
 * experiencia contra este manifiesto en bucle continuo (Orden Suprema),
 * en lugar de decidir por impresión subjetiva. Solo lectura — la política
 * vive en ux.const.ts y se versiona con el código.
 */
@ApiTags('ux')
@Controller('ux')
export class UxController {
  @ApiOperation({ summary: 'Manifiesto UX', description: 'Manifiesto de experiencia versionado (público). Los agentes auditan la UX contra este contrato.' })
  @Get('manifest')
  getManifest(): UxManifest {
    return UX_MANIFEST;
  }
}
