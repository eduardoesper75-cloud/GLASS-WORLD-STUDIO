# Bóveda del Conocimiento — Inteligencia técnica y de mercado (2026)

> **Estado**: síntesis de las búsquedas de investigación del frente paralelo.
> **Fecha de compilación**: 2026-08-02.
> **Regla**: todo dato técnico persistido en la Bóveda debe llevar `sourceRef`
> (fuente) + `effectiveDate`. Las curvas aquí volcadas son las referencias
> canónicas (`GLASS_REFERENCE_DATA` en `src/vault/vault.const.ts`).
> Los precios de mercado son **referencia, no cotización** — varían por región,
> lote, calidad y fecha.

---

## 1. COE y temperaturas características por sistema (verificado)

| Sistema | COE | Strain | Anneal | Softening | Fuente |
|---|---|---|---|---|---|
| Borosilicato 3.3 (lampworking/lab) | 33 | ~510–518 °C | ~560 °C | ~820 °C | ISO 3585 / DIN 12315; Boro Mastery annealing guide |
| Borosilicato Schott 8330 (nominal 3.2) | 32 | — | ~530 °C | — | Schott Borofloat 3.3 / 8330 datasheet |
| Bullseye (fusing) | 90 | ~493 °C | ~532 °C (grosor estándar) | ~677 °C | Bullseye Glass Co. (TechNote / datasheet) |
| System 96 / Spectrum (fusing) | 96 | ~476 ± 6 °C | ~513 ± 6 °C | ~680 °C | Spectrum/System 96; Uroboros 96 anneal ~517 °C |
| Kugler 96 (transparente) | 96 | ~485 °C | ~508 °C | ~694 °C | Kugler Glass datasheet |
| Moretti / Effetre (soplete 104) | 104 | ~448 °C | ~493–498 °C | ~565 °C | Moretti/Effetre ref. |

**Reglas de compatibilidad (crítico para AV-1.2 / LW-2.2):**
- Bullseye (COE 90): ventana de compatibilidad ±5 COE (Bullseye TechNote 3).
- System 96 (COE 96): ventana ±10 COE.
- El COE **no es el único** criterio: importan strain/anneal point, espesor y
  cronograma de recocido. El dato de laboratorio manda sobre el número de catálogo.

**Métodos de ensayo (cómo se miden, para SB-3.4):**
- ASTM C336-71(2020) — fiber elongation (strain/anneal).
- ASTM C598-93(2019) — beam bending (anneal).
- ASTM C338-93(2019) — softening point.
- ISO 3585:1998 — propiedades del borosilicato 3.3.
- DIN 12315 — cristalería de laboratorio.
- EN 572-1 — vidrio float / sodo-cálcico (básico).

---

## 2. Normativa de hornos y seguridad (IN-4.1 / IN-4.2 / SB-3.4)

- **NFPA 86** (edición 2027 vigente): hornos y cámaras de tratamiento
  térmico — equipamiento de seguridad, interbloqueos, alivio de explosión,
  controles de alta temperatura, placa de identificación. Referencias:
  NFPA 70 (NEC), ANSI Z50.1. Aplica a hornos de fusión de vidrio y de
  recocido/lehrs en operaciones industriales (EE.UU.).
- **EN 746** (familia): equipos de proceso térmico industrial (UE) —
  contraparte europea de NFPA 86.
- **Implicación para IN-4.2**: el metadato `nfpaClass` de los quemadores debe
  alinearse con NFPA 86 (2027) + flame supervision (UV/IR). No inventar clases:
  verificar contra la placa y el manual del quemador.

---

## 3. Referencias de precios de mercado (solo contexto, no cotización)

### Vidrio float / crudo (referencia 2025–2026)
- Float glass granel: ~US$ 1,04/kg (Norteamérica), ~US$ 0,97/kg (Europa),
  ~US$ 1,25/kg (Asia NE) — businessanalytiq, jun 2026.
- Por tonelada (imarc, Q3 2025): Alemania ~$648/MT, Francia ~$678/MT,
  Reino Unido ~$872/MT, Turquía ~$494/MT, Corea del Sur ~$427/MT.
- EE.UU. flat glass: exportación ~US$ 12/m², importación ~US$ 17/m² (indexbox, 2024).
- Templado 12 mm B2B: ~$2,00–$44,90/m² según proveedor/calidad (Agregados Alibaba/accio).
- Tendencia: caída de precios del float en H1-2026 respecto de 2025; repunte
  moderado esperado desde el recorte de oferta de proveedores grandes.

### Arena silícea (materia prima)
- Datos de reportes 2026 con **caución de unidad**: los reportes publican
  valores en USD/kg que no son comparables entre sí (rango aparente
  ~USD 32–66). No usar como insumo numérico directo; usar solo la tendencia:
  Asia-Pacífico con el mayor volumen; restricciones de exportación en Vietnam
  (frontera con China) presionan la oferta regional.

### Lectura operativa
- El valor de esta tabla es **contexto de negociación y de pricing interno**,
  no un input transaccional. No alimenta ningún motor de precios automático
  de GWS (política de la Orden: precios display-only hasta habilitación).

---

## 4. Pendientes

- [ ] Curar 3–5 documentos seed con estos datos (curva boro 33, Bullseye 90,
      System 96, NFPA 86 resumen) vía workflow de curación — NO auto-publicar.
- [ ] Confirmar con Jorge si el metadato `nfpaClass` debe ser un enum cerrado
      en IN-4.2 (hoy es texto libre validado solo por rango numérico).
