# Motor Aduanero y Logístico — Inteligencia de referencia (2026)

> **Orden Suprema de integración**: cálculo de aduanas, aranceles, transporte
> y costos de nacionalización en tiempo real (estimados con fuente).
> **Fecha**: 2026-08-02. **Estado**: motor implementado (`src/customs/`) con
> referencias versionadas en DB (migración `CommissionsCustomsSchema`).
> Los datos son **ESTIMADOS ORIENTATIVOS**, no cotización vinculante.

---

## 1. Códigos HS/NCM y aranceles por región (seed `customs_hs_codes`)

| Código | Producto | AEC Mercosur | US HTS MFN | EU CCT* |
|---|---|---|---|---|
| 7002.20 / 7002.32 | Varillas / tubos de borosilicato | 4 % | 6 % | 3 % |
| 7003.19 | Vidrio colado/laminado en planchas | 10 % | 3,3 % | 3 % |
| 7004.90 | Vidrio estirado/soplado en hojas | 10 % | 6,4 % | 3 % |
| 7005.29 | Vidrio flotado (float) | 10 % | 3,9 % | 3 % |
| 7006.00 | Vidrio trabajado (biselado/grabado) | 12 % | 4,9 % | 3 % |
| 7007.19 | Vidrio de seguridad templado | 12 % | 5 % | 3 % |
| 7013.91 / 7013.99 | Artículos de adorno y de mesa | 18 % | 7,2 % / 5 % | 3 % |
| 7016.90 | Mosaicos y vidrieras artísticas | 14 % | 6 % | 3 % |
| 7017.20 | Vidrio de laboratorio (boro) | 14 % | 6 % | 3 % |
| 7018.90 | Figurillas trabajadas al soplete | 14 % | 6 % | 3 % |
| 8417.80 | Hornos industriales de proceso térmico | 14 % | 2,6 % | 2,5 % |
| 8514.90 | Partes de hornos eléctricos | 14 % | 2,5 % | 2,5 % |
| 6903.10 | Refractarios sílico-aluminosos | 12 % | 3 % | 2,5 % |

\* EU CCT = derechos de terceros países; la tasa efectiva depende del origen
y acuerdos comerciales (TARIC). Fuentes: NCM/AEC (AFIP), US HTS
(hts.usitc.gov), EU TARIC. **Cuidado US 2026**: overlays temporales —
Section 122 (10 % no-UE), Section 301 (China +25 %), techo 15 % del acuerdo
UE-EE.UU. (jul 2026); IEEPA en retirada (EO 14389). El motor usa MFN base
+ nota; la aduana decide al despacho.

## 2. Impuestos por país de destino (seed `customs_country_params`)

| País | IVA/GST | Arancel | Extras |
|---|---|---|---|
| Argentina | 21 % (10,5 % reducido) | AEC (por HS) | Tasa estadística 3 % (tope ~US$ 2.000) + percepciones IVA adic. (RG 2937, 10 %) y Ganancias (RG 2281, 6 %); PAIS eliminado para importaciones (2025) |
| EE.UU. | — (sin IVA federal) | HTS MFN | MPF 0,3464 % (min $31,67 / max $614,35) + HMF 0,125 % (marítimo) |
| Brasil | ICMS ~18 % | AEC ~14 % (promedio II) | IPI + PIS/COFINS; reforma IBS/CBS en transición |
| México | IVA 16 % | HTS/TLC | DTA ~0,8 % (con tope) |
| UE (DE/FR/IT/ES/NL/BE/PT) | 19-23 % | CCT por HS | — |
| Reino Unido | IVA 20 % | UK Tariff | — |
| Chile | IVA 19 % | 6 % ad valorem | — |
| Uruguay | IVA 22 % | AEC | — |
| Paraguay | IVA 10 % | AEC | — |
| Bolivia | IVA 13 % | ~5 % | — |
| Perú | IGV 18 % | AEC | — |
| Colombia | IVA 19 % | AEC | — |
| Venezuela | IVA 16 % | AEC | — |

Fuentes: Avalara/VATCalc 2026, AFIP (RG 2281/2937), CBP, TARIC.

## 3. Flete internacional 2026 (seed `customs_freight_bands`)

- **Aéreo**: ~US$ 2,50-6,00/kg (Asia→US ~$4,50-6,00; EU→US ~$1,80-5,50;
  recargo combustible ~$0,30-0,80/kg). Peso facturable = max(real, volumen×167).
- **Marítimo LCL**: ~US$ 35-90/m³; **FCL 40ft**: US$ 1.800-7.200 según ruta
  (Asia→US WC $3.000-5.500; EC $4.200-7.200; Europa→US $2.200-4.200).
- Picos de temporada (jul-oct) +20-40 %. Red Sea añade $800-2.000/cont.
- Fuentes: Freightos FBX, Drewry WCI, Suaid Global (Q1-Q3 2026).

## 4. Arquitectura

- `POST /customs/estimate` — desglose transparente (valor + flete + seguro +
  CIF + arancel + IVA + tasas + percepciones + total USD).
- `GET /customs/hs-codes`, `GET /customs/countries`, `GET /customs/meta`.
- El desglose se cableará al checkout cuando se habilite la pasarela
  (Payment_Vault §3.1 — zona de exclusión). Conversión a moneda local/USDT
  es display-only (portada).
- Actualización de tarifas: cambio de datos versionado con fuente (no
  auto-scrapeo). Fase futura: feeds en vivo tras alianzas logísticas.

## 5. Pendientes

- [ ] Confirmar con Jorge los países/regiones prioritarios de lanzamiento
      para ampliar el seed (hoy 19 países).
- [ ] Categorías extra (envases/botellas 7010, cristal de plomo, espejos 7009).
- [ ] Validación E2E de la migración cuando Docker esté operativo.
