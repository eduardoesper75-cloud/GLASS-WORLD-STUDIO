import { Controller, Body, Put, Req, UseGuards, Get } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SUPPORTED_LANGUAGES, SUPPORTED_CURRENCIES } from '../localization/currency.const';

type AuthedRequest = Request & { user: { id: string } };

/**
 * GWS · PreferencesController — persistencia de idioma/moneda
 * ------------------------------------------------------------
 * El selector multilingüe (7 banderas) y el de moneda de la Portada
 * persisten la elección del usuario (PUT /preferences) y la reaplican
 * en cada visita (GET /preferences). Es SOLO preferencia de exhibición:
 * el dato de pago sigue en Payment_Vault (§3.1).
 */
@Controller('preferences')
export class PreferencesController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async get(@Req() req: AuthedRequest): Promise<{
    preferredLanguage: string;
    preferredCurrency: string;
    supportedLanguages: readonly string[];
    supportedCurrencies: readonly string[];
  }> {
    const user = await this.userRepo.findOne({ where: { id: req.user.id } });
    return {
      preferredLanguage: user?.preferredLanguage ?? 'es',
      preferredCurrency: user?.preferredCurrency ?? 'USD',
      supportedLanguages: SUPPORTED_LANGUAGES,
      supportedCurrencies: SUPPORTED_CURRENCIES,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async update(
    @Body() dto: UpdatePreferencesDto,
    @Req() req: AuthedRequest,
  ): Promise<{ preferredLanguage: string; preferredCurrency: string }> {
    const user = await this.userRepo.findOne({ where: { id: req.user.id } });
    if (!user) throw new Error('Usuario inexistente');
    if (dto.preferredLanguage) user.preferredLanguage = dto.preferredLanguage;
    if (dto.preferredCurrency) user.preferredCurrency = dto.preferredCurrency;
    await this.userRepo.save(user);
    return { preferredLanguage: user.preferredLanguage, preferredCurrency: user.preferredCurrency };
  }
}
