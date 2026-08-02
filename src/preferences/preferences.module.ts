import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PreferencesController } from './preferences.controller';
import { AuthModule } from '../auth/auth.module';

/**
 * GWS · PreferencesModule — persistencia de sesión (idioma/moneda)
 * ----------------------------------------------------------------
 * Guarda la elección del selector de la Portada en la cuenta
 * (users.preferredLanguage / users.preferredCurrency). Display-only:
 * no toca datos de pago (CLAUDE.md §3.1).
 */
@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [PreferencesController],
})
export class PreferencesModule {}
