import { Module } from '@nestjs/common';
import { UxController } from './ux.controller';

/**
 * GWS · UX — módulo de manifiesto de experiencia (solo lectura).
 * Sin entidades ni servicios de negocio: es el contrato versionado que
 * el bucle de auditoría consulta. No toca datos transaccionales.
 */
@Module({
  controllers: [UxController],
})
export class UxModule {}
