import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { G6TechSheetTemplate } from './tech-sheet-template.entity';
import { G6TechSheet } from './tech-sheet.entity';
import { G6TechSheetsService } from './g6-tech-sheets.service';
import { G6TechSheetsController } from './g6-tech-sheets.controller';

/**
 * GWS · G6TechSheetsModule — Base preconfigurada de fichas técnicas (G6)
 * ------------------------------------------------------------
 * Autopredictor: el comerciante escribe el nombre de un producto masivo y
 * la plataforma autocompleta la ficha técnica oficial precargada (rangos
 * de temperatura, curvas sugeridas, voltaje, materiales compatibles).
 * Fallback manual para piezas de autor/exóticas. El vendedor siempre puede
 * corregir antes de publicar.
 */
@Module({
  imports: [TypeOrmModule.forFeature([G6TechSheetTemplate, G6TechSheet])],
  controllers: [G6TechSheetsController],
  providers: [G6TechSheetsService],
})
export class G6TechSheetsModule {}
