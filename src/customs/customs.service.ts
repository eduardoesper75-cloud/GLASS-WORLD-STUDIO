import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomsHsCode } from './customs-hs-code.entity';
import { CustomsCountryParam } from './customs-country-param.entity';
import { CustomsFreightBand } from './customs-freight-band.entity';
import { EstimateCustomsDto } from './dto/estimate-customs.dto';
import {
  AIR_VOLUMETRIC_DIVISOR,
  CUSTOMS_AS_OF,
  CUSTOMS_DISCLAIMER,
  FREIGHT_MODES,
  HANDLING_USD,
  OCEAN_KG_PER_CBM,
  ORIGIN_REGION_MODIFIER,
  PRODUCT_TYPE_TO_HS,
  STATISTICAL_FEE_CAP_USD,
  SUPPORTED_PRODUCT_TYPES,
} from './customs.const';

/** Arancel regional a usar según la región del país de destino. */
const REGION_DUTY_FIELD: Record<string, 'dutyMercosur' | 'dutyUsMfn' | 'dutyEuCct'> = {
  mercosur: 'dutyMercosur',
  nafta: 'dutyUsMfn',
  eu: 'dutyEuCct',
  latam: 'dutyUsMfn',
};

const FALLBACK_FREIGHT_RATE = { air: 4.5, ocean: 75 };

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * GWS · CustomsService — Motor aduanero/logístico (Orden Suprema 2026-08-02)
 * ------------------------------------------------------------
 * Cotización transparente y ESTIMADA: valor + flete + seguro + arancel +
 * IVA/GST + tasas + percepciones, con desglose en pantalla. Los datos
 * salen de tablas versionadas con fuente/fecha (ver migración y
 * docs/research/). NO es cotización vinculante: la aduana de destino
 * determina la clasificación y los montos finales.
 *
 * El desglose se integra al checkout cuando se habilite la pasarela
 * (Payment_Vault, §3.1); hoy es un servicio de cotización público.
 */
@Injectable()
export class CustomsService {
  constructor(
    @InjectRepository(CustomsHsCode) private hsRepo: Repository<CustomsHsCode>,
    @InjectRepository(CustomsCountryParam) private countryRepo: Repository<CustomsCountryParam>,
    @InjectRepository(CustomsFreightBand) private bandRepo: Repository<CustomsFreightBand>,
  ) {}

  /** Catálogo HS/NCM de referencia. */
  async hsCodes(): Promise<CustomsHsCode[]> {
    return this.hsRepo.find({ order: { code: 'ASC' } });
  }

  /** Parámetros por país de destino. */
  async countries(): Promise<CustomsCountryParam[]> {
    return this.countryRepo.find({ order: { countryCode: 'ASC' } });
  }

  /** Metadatos del motor: fuentes, bandas, tipos soportados, disclaimer. */
  async meta() {
    const bands = await this.bandRepo.find({ order: { bandKey: 'ASC' } });
    return {
      asOf: CUSTOMS_AS_OF,
      disclaimer: CUSTOMS_DISCLAIMER,
      productTypes: SUPPORTED_PRODUCT_TYPES,
      productTypeToHs: PRODUCT_TYPE_TO_HS,
      modes: FREIGHT_MODES,
      freightBands: bands,
      sources: [
        'NCM/AEC Mercosur (AFIP) — aranceles 2017-2022',
        'US HTS 2026 (hts.usitc.gov) — MFN + overlays 2026',
        'EU CCT/TARIC 2026 — derechos de terceros países',
        'IVA/GST: Avalara/VATCalc 2026; AR: AFIP RG 2281/2937',
        'Flete: Freightos FBX / Drewry WCI / Suaid Global, Q1-Q3 2026',
      ],
    };
  }

  /** Motor de estimación: devuelve el desglose completo en USD. */
  async estimate(dto: EstimateCustomsDto) {
    const hs = dto.hsCode
      ? await this.hsRepo.findOne({ where: { code: dto.hsCode } })
      : await this.hsRepo.findOne({ where: { productType: dto.productType } });

    if (!hs) {
      throw new BadRequestException(
        dto.hsCode
          ? `Código HS ${dto.hsCode} no soportado por el motor`
          : `productType '${dto.productType}' no tiene código HS por defecto; pasá un hsCode explícito`,
      );
    }

    const dest = await this.countryRepo.findOne({
      where: { countryCode: dto.destinationCountry },
    });
    if (!dest) {
      throw new BadRequestException(
        `País de destino ${dto.destinationCountry} no soportado aún por el motor`,
      );
    }

    // ---- Arancel (override del país o arancel regional por HS) ----------
    const dutyRate = dest.dutyOverride ?? hs[REGION_DUTY_FIELD[dest.regionKey] ?? 'dutyUsMfn'];
    const dutyRateBasis = dest.dutyOverride
      ? `arancel específico ${dest.countryName}`
      : dest.regionKey === 'mercosur'
        ? 'Arancel Externo Común Mercosur (NCM)'
        : dest.regionKey === 'eu'
          ? 'UE — Common Customs Tariff (terceros países)'
          : 'US HTS MFN (genérico de referencia)';

    // ---- Flete (dato o estimado por banda + región) ---------------------
    const freight = dto.freightCostUsd ?? (await this.estimateFreight(dto, dest.regionKey));

    // ---- Seguro ---------------------------------------------------------
    const insurance = round2(dto.customsValueUsd * dest.insuranceRate);

    // ---- CIF -------------------------------------------------------------
    const cif = round2(dto.customsValueUsd + freight + insurance);

    // ---- Arancel (sobre CIF) ---------------------------------------------
    const duty = round2(cif * (dutyRate / 100));

    // ---- Tasa de estadística (con tope) ----------------------------------
    const statFee = round2(
      Math.min(cif * (dest.statisticalFeeRate / 100), STATISTICAL_FEE_CAP_USD),
    );

    // ---- IVA/GST (base = CIF + arancel + tasa) ----------------------------
    const vatBase = round2(cif + duty + statFee);
    const vat = dest.vatRate ? round2(vatBase * (dest.vatRate / 100)) : 0;

    // ---- Percepciones (ej. AR: RG 2937 / RG 2281) -------------------------
    const withholdings = dest.withholdings.map((w) => ({
      label: w.label,
      rate: w.rate,
      note: w.note ?? null,
      amount: round2(vatBase * (w.rate / 100)),
    }));

    // ---- Fees aduaneros (ej. EE.UU.: MPF/HMF) ------------------------------
    const fees = dest.fees.map((f) => {
      let amount = round2(dto.customsValueUsd * (f.rate / 100));
      if (f.min != null) amount = Math.max(amount, f.min);
      if (f.max != null) amount = Math.min(amount, f.max);
      return { label: f.label, rate: f.rate, note: f.note ?? null, amount: round2(amount) };
    });

    const withSum = withholdings.reduce((acc, w) => acc + w.amount, 0);
    const feesSum = fees.reduce((acc, f) => acc + f.amount, 0);

    const totalEstimateUsd = round2(cif + duty + statFee + vat + withSum + feesSum);

    return {
      estimated: true,
      disclaimer: CUSTOMS_DISCLAIMER,
      asOf: CUSTOMS_AS_OF,
      hsCode: hs.code,
      hsDescription: hs.description,
      productType: dto.productType,
      originCountry: dto.originCountry,
      destinationCountry: dto.destinationCountry,
      mode: dto.mode,
      dutyRate,
      dutyRateBasis,
      vatRate: dest.vatRate,
      statisticalFeeRate: dest.statisticalFeeRate,
      insuranceRate: dest.insuranceRate,
      lines: {
        productValueUsd: dto.customsValueUsd,
        freightUsd: freight,
        insuranceUsd: insurance,
        cifUsd: cif,
        dutyUsd: duty,
        statisticalFeeUsd: statFee,
        vatUsd: vat,
        withholdingsUsd: withholdings,
        feesUsd: fees,
        totalEstimateUsd,
      },
      currencyNote:
        'Todos los montos en USD. La conversión a moneda local/USDT es display-only y la resuelve la portada al momento de la cotización.',
    };
  }

  /** Estimación de flete por modo y región (orientativo, 2026). */
  private async estimateFreight(
    dto: EstimateCustomsDto,
    destinationRegion: string,
  ): Promise<number> {
    const bands = await this.bandRepo.find({ where: { mode: dto.mode } });
    const bandFor = (region: string) => bands.find((b) => b.bandKey === `${dto.mode}_${region}`);

    if (dto.mode === 'air') {
      const volKg = (dto.volumeCbm ?? 0) * AIR_VOLUMETRIC_DIVISOR;
      const chargeableKg = Math.max(dto.weightKg, volKg, 1);
      const base = bandFor(destinationRegion)?.rate ?? FALLBACK_FREIGHT_RATE.air;
      const originMod = ORIGIN_REGION_MODIFIER[dto.originCountry] ?? 0;
      return round2(chargeableKg * Math.max(base + originMod, 0.5) + HANDLING_USD.air);
    }

    // ocean — LCL se cotiza por m³.
    const volCbm = dto.volumeCbm ?? Math.max(dto.weightKg / OCEAN_KG_PER_CBM, 0.5);
    const base = bandFor(destinationRegion)?.rate ?? FALLBACK_FREIGHT_RATE.ocean;
    return round2(volCbm * base + HANDLING_USD.ocean);
  }
}
