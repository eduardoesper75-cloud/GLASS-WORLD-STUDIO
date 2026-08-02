# Búnker de Ingeniería Especializada — Inteligencia de referencia (2026)

> **Orden Suprema de integración**: red soberana de servicio técnico global
> para plantas, talleres y fábricas del vidrio (hornos, templado, PLC,
> borosilicato, maquinaria pesada).
> **Fecha**: 2026-08-02. **Estado**: módulo implementado (`src/bunker/`) con
> tickets Service On-Demand, cartera élite verificada y membresía pro
> USD 50/mes (0 % comisión). Este documento es la base técnica de los
> campos del ticket y del criterio de verificación de especialistas.

---

## 1. Fallas reales en maquinaria de vidrio (lo que un ticket describe)

### 1.1 Hornos de templado (flat glass tempering furnaces)

Fallas frecuentes documentadas por fabricantes y consultores:

| Síntoma | Causa típica | Diagnóstico recomendado |
|---|---|---|
| **Ruptura de vidrio** dentro del horno | Calentamiento/enfriado inadecuado → tensión térmica irregular | Revisar perfil de temperatura y tasa de enfriado según espesor/tipo |
| **Distorsiones ópticas / anisotropía** (iridiscencias, franjas) | Calentamiento no uniforme | Inspección de elementos calefactores y sistema de convección |
| **Marcas de rodillos** (permanentes) | Rodillos sucios o dañados | Limpieza y reemplazo de rodillos |
| **Baja productividad** | Fallas mecánicas o configuración incorrecta | Check integral: calefacción, enfriado, control |
| **Concavidad/convexidad/bistable** (vidrio "en silla", "burbuja") | Diferencia de temperatura entre caras o bordes/centro | Balance de aire del chiller, perfil de calefacción, ratio de convección |
| **Fragmento incorrecto** (templado) | Quenching irregular, boquillas obstruidas | Calibración del quenching, limpieza de boquillas |
| **Daño de coating (Low-E)** | Sobrecalentamiento de bordes | Reducir tiempo/temperatura de calentamiento |

Fuente: LandGlass, Glasino (2025), Jaipur Tuff, Mika Eronen / Global Glass
Specialists.

### 1.2 Refractarios y hornos de fusión (línea "caliente")

- Un horno float corre a ~**1.500 °C por 15-20 años sin parada en frío**.
- Fallas típicas de refractario: **agrietamiento (thermal shock), erosión,
  adelgazamiento de paredes, hot spots** → pérdida de calor, mayor consumo de
  combustible y riesgo de **fuga de vidrio (breakout)**.
- Costo: un fallo refractario no planificado puede costar **US$ 50.000-200.000
  por día** de producción perdida; una brecha grave con rebuild ronda los
  **US$ 50-100 millones y 4-6 meses de parada**.
- Detección: termografía continua exterior (LWIR) + interior (NIR) permite
  anticipar hot spots antes del breakout; monitoreo por tendencia de días/
  semanas, no inspecciones puntuales.
- La industria migra de mantenimiento por calendario a **mantenimiento
  predictivo por condición** (telemetría + ML, antelación 2-4 semanas).

Fuente: AMETEK LAND (jul 2026), iFactory (jun 2026), oxmaint (jul 2026),
fusedblocks.com, Sunrise/refractory sector.

### 1.3 Sensores y control (automatización)

- Rango típico de operación del horno: **1.100-1.600 °C** (máx. 1.700-2.000 °C).
- Sensores: **termocuplas** (tipos K, S, R, B — metales nobles para vidrio),
  RTDs (zonas de menor temperatura), **pirómetros ópticos** (sin contacto),
  electrodos de nivel de vidrio.
- Fallas de control más comunes: **calibración errónea del sensor**,
  degradación de termocupla por corrosión, zonas de calefacción fuera de
  calibración, bloqueo de flujo de aire/quenching.
- En el ticket conviene pedir: tipo de sensor, zona que falla, drift de la
  curva térmica (el campo `thermalCurve` del Búnker).

Fuente: Peak Sensors, Process Parameters (Optris), Tempsens, lehigh.edu IMI-NFG.

### 1.4 Lehrs de recocido (annealing)

- Mantienen gradientes de temperatura precisos en bandas de 2-4 m con tensado
  continuo; fallas típicas: drift del perfil de zonas, desalineación de banda,
  falla de motor/tracción → tensión residual en el vidrio (recocido incompleto).

Fuente: iFactory, AMETEK LAND (Annealing Lehr).

## 2. Certificaciones y normativas (para la verificación de especialistas)

La cartera élite se verifica contra credenciales reales. Matriz de referencia:

| Norma / esquema | Alcance | Para qué sirve |
|---|---|---|
| **CE · Machinery Directive 2006/42/EC** + estándares EN armonizados | Comercialización de maquinaria en UE | Presunción de conformidad; importadores obligados a revisar documentación |
| **Implementing Decision (EU) 2026/546** (12-mar-2026) | Actualiza los EN armonizados (modifica 2023/1586) | Revisión de declaraciones de conformidad vigentes al 2026 |
| **UL 2011** (machinery), **NFPA 79** | Seguridad de maquinaria industrial EE.UU. | Instalación eléctrica de máquinas |
| **IEC 60204-1** / **CSA C22.2 No. 301** | Control eléctrico de máquinas (internacional / Canadá) | Referencia global de control eléctrico |
| **NEC NFPA 70 / CEC C22.1** | Instalaciones eléctricas | Obra eléctrica de plantas |
| **UL 61496** (ESPE/AOPD) | Dispositivos electro-sensibles de protección | Seguridad de resguardos ópticos |
| **ISO 9001** | Sistema de gestión de calidad del fabricante | Confiabilidad del proveedor |
| **3C / CCC** | Mercado chino | Exportación de maquinaria CN |
| **HS 8417.80 / 8514.90 / 6903.10** | Clasificación arancelaria de hornos/partes/refractarios | Consistente con el seed aduanero del motor (ver `motor-aduanero-2026.md`) |

Fuente: CambiosLegales (abr 2026), UL Solutions, ANSI Webstore, Vetropack CE
marking (GlassOnline, may 2025), LandGlass specs.

## 3. Implicancias de diseño para el Búnker (ya aplicadas)

- **Taxonomía `machineType`**: flat_glass, borosilicate, crucible_kiln,
  cutting_table, tempering, annealing, lehr, other — mapea 1:1 con las fallas
  de la §1.
- **`urgency`** (standard/urgent/critical): un breakout de refractario o una
  parada de línea caliente es crítico; el SLA del ticket puede priorizarse.
- **`errorCodes` + `thermalCurve`**: alineado a diagnóstico por curva térmica
  y códigos de control (sección 1.3).
- **Especialidades** (hornos_industriales, templado, borosilicato, PLC,
  automatizacion, quemadores...): reflejan las líneas de falla y las
  certificaciones de la §2.
- **Verificación élite (solo Jorge, elevación)**: el sello valida credenciales
  matrícula/homologación/CE-UL-IEC según el rol del especialista — coherente
  con §2. `credentials` (jsonb) es la matriz que Jorge audita.

## 4. SLA propuesto (a confirmar con Jorge — no tocar tarifas sin él, §3.1)

| Urgencia | Ventana objetivo (remoto) | Ventana objetivo (presencial) |
|---|---|---|
| standard | 48 h | 5 días hábiles |
| urgent | 24 h | 72 h |
| critical | 4 h (diag. remoto) | 24 h si hay red local |

> El SLA es política de servicio, no tarifa: los honorarios por ticket los fija
> el especialista con comisión 0 %. La membresía pro (USD 50/mes) habilita a
> tomar tickets de la red de demanda.

## 5. Pendientes

- [ ] Confirmar con Jorge el SLA objetivo (tabla §4) y si entra en el manual.
- [ ] Al ampliar la red, validar especialistas contra la matriz §2 en la
      primera ronda de verificaciones.
- [ ] Validación E2E de la migración `BunkerSchema` cuando Docker esté operativo.
