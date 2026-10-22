# GWS · Informe de Situación de la Campaña de Alianzas Estratégicas

> **Corte:** 22-10-2026 · **Elaborado por:** Agente Principal GWS (relevamiento del repositorio).
> **Alcance:** campaña de búsqueda de **inversores, desarrolladores y logística**.
> **Método:** sólo datos reales y trazables (`send-log.jsonl`, `seguimiento.md`, CSV y documentos
> versionados). **Cero métricas estimadas, cero contactos inventados.** Lo que no existe queda
> declarado como tal.

> **Actualizado tras la Fase 1 (22-10-2026):** el registro `docs/outreach/respuestas.jsonl` ya existe
> (30 `sin_novedad`, 0 respuestas reales), los CSV están sincronizados (18 + 12 enviados) y el barrido
> de bandeja está documentado. Ver
> [`GWS_Informe_Continuidad_2026-10-22.md`](./GWS_Informe_Continuidad_2026-10-22.md).

---

## 0. Resumen ejecutivo

La campaña **salió a la calle una vez**: **30 envíos reales el 16-10-2026**, **0 fallos** y
**0 respuestas registradas**. Desde el **17-10** el sistema está en **modo `reposo`** (envío
bloqueado por código) y el foco pasó a **investigación y scouting**. Al corte, la **base de
scouting está vacía** (0 puertas válidas) y la campaña permanece **detenida a la espera de esa base**.

| Indicador | Valor real |
|---|---|
| Envíos SMTP realizados | **30** (18 inversores/industria + 12 logística) |
| Fallos de envío | **0** |
| Respuestas **registradas** | **0 reales** · **30 sin novedad** (barrido 22-10: INBOX + Spam + All Mail) |
| Desarrolladores contactados | **0** (canal manual, aún no iniciado) |
| Reuniones | **0** |
| Alianzas firmadas | **0** |
| Modo operativo | **`reposo`** desde 17-10-2026 |
| Puertas de scouting válidas | **0** (la base sólo tiene encabezado) |
| Bloqueos abiertos | **2** (password institucional · universo SMTP agotado) |

> **Diagnóstico en una línea:** la campaña **funcionó técnicamente** (30/30 sin fallos), el copy de
> las cifras **está corregido** y la Fase 1 **ya midió y sincronizó** (0 respuestas reales, 30 sin
> novedad). Falta **base nueva** (0 puertas): el próximo movimiento es **curar y validar puertas**,
> no enviar más.

---

## 1. Canales oficiales vigentes

Obligatorios en toda comunicación (normalizados el 17-10 en 29 archivos):

| Canal | Dato |
|---|---|
| Página web oficial | <https://www.glassworldstudio.com.ar> |
| Correo institucional (Don Web) | `edu.esper@glassworldstudio.com.ar` |
| Correo personal (respaldo) | `eduardoesper75@gmail.com` |
| Teléfono / WhatsApp directo | `+54 9 385 622-8400` · <https://wa.me/5493856228400> |

> Los canales anteriores (`esper.eduardo@gmail.com` / `+54 9 385 582-6289`) **ya no tienen
> residuales** en los documentos de outreach ni de logística.

---

## 2. Embudo de la campaña

| Pilar | Identificados | Contactados | Respuestas registradas | Reuniones | Alianzas |
|---|---:|---:|---:|---:|---:|
| **Inversores / industria** | 35 organizaciones | **18** | 0 | 0 | 0 |
| **Desarrolladores / arquitectos** | 98 curados (+45 sin curar) | **0** | 0 | 0 | 0 |
| **Logística / cadena de suministro** | 28 organizaciones | **12** | 0 | 0 | 0 |
| **TOTAL** | **161** (+45) | **30** | **0** | **0** | **0** |

**Lectura del embudo:** hay volumen identificado, pero el contacto se concentró en **un solo día** y
en los dos pilares con correo corporativo. **Desarrolladores sigue en 0** porque su canal es manual
(GitHub/LinkedIn) y no se inició.

### 2.1 Inventario de piezas listas

| Fuente | Bloques | Con email | Enviados | Canal manual |
|---|---:|---:|---:|---:|
| `inversores/GWS_Correos_Institucionales.md` | 19 | 18 | **18** | 1 (formulario) |
| `logistica/GWS_Correos_Logistica.md` | 11 | 7 | **7** | 4 (formulario) |
| `logistica/GWS_Correos_Forwarders.md` | 9 | 3 | **3** | 6 (formulario) |
| `logistica/GWS_Correos_Logistica_Cierre.md` | 11 | 2 | **2** | 9 (formulario) |
| `desarrolladores/GWS_Envio_Devs.md` | 99 | 0 | 0 | 99 (GitHub) |
| `desarrolladores/drafts_devs.md` | 67 | — | — | 67 (LinkedIn) |
| `linkedin/drafts.md` | 35 | — | — | 35 (LinkedIn) |
| **Total SMTP** | **50** | **30** | **30** | **20** |

> **30 destinatarios con correo real; 30 enviados.** No queda primera oleada SMTP sin incorporar
> contactos nuevos y legítimos. Las **20** piezas restantes son de formulario y los **201** borradores
> de devs/LinkedIn son de canal manual.

---

## 3. Resultados reales de los 30 envíos

**Fuente:** `docs/logistica/send-log.jsonl` (30 líneas, 30 empresas únicas).

| Métrica | Valor |
|---|---|
| Ventana de envío | 2026-10-16 · 07:44:20Z → 08:40:04Z |
| Envíos OK | **30** |
| Fallos | **0** |
| *Throttle* | 60 s entre envíos |
| Idempotencia | omite destinatarios ya enviados |

### 3.1 Por segmento

| Segmento | Contactos | Envíos OK | Fallos |
|---|---:|---:|---:|
| industrial (cámaras, asociaciones, fabricantes) | 11 | 11 | 0 |
| fondo (VC / family office) | 5 | 5 | 0 |
| empaque / crating | 4 | 4 | 0 |
| forwarder | 3 | 3 | 0 |
| arte frágil | 3 | 3 | 0 |
| seguro de carga | 2 | 2 | 0 |
| angel (redes de inversores) | 2 | 2 | 0 |
| **Total** | **30** | **30** | **0** |

### 3.2 Respuestas y segundo toque

- **Respuestas registradas: 0 reales.** El barrido de solo lectura del 22-10 (INBOX + Spam + All Mail)
  no encontró respuestas, rebotes ni autorespuestas: **30 contactos quedaron `sin_novedad`**. El
  registro canónico es `docs/outreach/respuestas.jsonl`.
- **Segundo toque:** al 22-10 pasaron **6 días**, por lo que la **ventana de tiempo (≥ 5 días) está
  abierta** y los 30 figuran elegibles. **Pero la Fase 1 prohíbe enviar**: la reactivación es Fase 3,
  sólo con base nueva validada.
- **Máximo:** 3 toques por contacto, nunca dos el mismo día.

---

## 4. Estado por pilar

### 4.1 Inversores y sector industrial

**Lo contactado (18):** 11 organizaciones industriales (ANFEVI, CAVIPLAN, AMEVEC, Assovetro,
Glass Alliance Europe, Glass for Europe, Glass Packaging Institute, Bundesverband Glasindustrie,
ABIVIDRO, Vidrala, Envases del Sur), 5 fondos (Alaya, Family Capital, FORUM, Inveready, Adduntia)
y 2 redes de ángeles (IESE BAN, Red Sudamericana de Inversiones).

**Lo que queda (17 de 35):** sin correo corporativo directo → **formulario web o red cálida**.
La persona decisora (socio/analista) **no está identificada** en la base: es la brecha estructural
del eje, y no existe vía legítima para extraerla a escala.

### 4.2 Desarrolladores y arquitectos

- **98 perfiles curados** en `prospects_devs.csv` (arquitecto 40 · fullstack 25 · b2b 17 ·
  seguridad 8 · multiagente 7 · datos 1), todos en estado `nuevo`.
- **45 perfiles crudos** en `github-tanda5.csv`, **sin curar** (tanda 5 ejecutada, no integrada).
- **0 contactados.** El canal es **manual** (perfil público de GitHub / LinkedIn), prohibido
  automatizar cuentas.
- **Piezas listas:** 99 correos/mensajes + 67 borradores de LinkedIn.
- **Agencias tech:** 11 identificadas, **1 con correo**.

### 4.3 Logística y cadena de suministro

- **28 organizaciones** en la base; **12 con correo corporativo**; **16 por formulario**.
- **12 envíos reales** (3 arte frágil · 4 empaque/crating · 3 forwarders · 2 seguros). El CSV sólo
  marca **7** como `enviado` → **desincronización de registro** (ver §6, O3).
- **0 acuerdos, 0 costos confirmados.** La matriz sigue siendo de **candidatos a evaluar**.
- Prioridad operativa intacta: **arte frágil + empaque técnico** primero; forwarders/aseguradoras
  como soporte.

---

## 5. Modo operativo y pivote a scouting

- **Estado `reposo`** desde el **17-10-2026** (decisión versionada en `GWS_Modo_Operativo.md`).
  El emisor `tools/outreach/send-batch.mjs` **se niega a enviar** con `--execute`; el *dry-run* sigue
  operativo. **No hay procesos en segundo plano.**
- **Motivo declarado:** pausa institucional de fin de semana + pivote a **investigación y scouting de
  puertas de alto valor**.
- **Pivote:** de "volumen y lotes" a "**poco y bueno**": puertas verificadas una por una, con fuente
  citada, fundamento concreto y canal corporativo.
- **Base de scouting al corte:** `puertas.csv` **sólo tiene encabezado**; el informe de la corrida
  leyó **3 filas** (todas `EJEMPLO` de la plantilla) → **0 válidas, 3 rechazadas**. La campaña está
  **detenida esperando esa base**.
- **Durante el pivote no se envió nada** (confirmado por el registro: último envío 16-10).

> **Observación:** la pausa prevista para un fin de semana **sigue vigente 5 días después**. No es un
> error —es una decisión auditable—, pero implica que **la campaña está parada** hasta que se cargue
> y cure la base de puertas.

---

## 6. Brechas y bloqueos (actualizado)

| # | Brecha / bloqueo | Estado | Impacto |
|---|---|---|---|
| **B1** | Cifras de mercado: **investigación cerrada y copy en español corregido** | 🟢 Cerrado (residual EN) | 🟡 Bajo |
| **B2** | Esquema de **participación / compensación** (inversores y devs) | 🔴 Sin definir | 🔴 Crítico |
| **B3** | **Stack** de orquestación multi-agente y persistencia | 🔴 Sin definir | 🟠 Alto |
| **B4** | **Modelo de ingresos / monetización** | 🔴 Sin definir | 🟠 Alto |
| **B5** | **Persona decisora** por fondo (socio/analista) | 🔴 Sin identificar | 🟠 Alto |
| **B6** | **Logística sin validar**: 0 acuerdos, 0 costos | 🔴 Sin validar | 🟠 Alto |
| **O1** | **Password casilla institucional** (`OUTSEND_MAILBOX_PASSWORD`, Don Web) | 🔴 Faltante | 🔴 Bloqueante |
| **O2** | **Universo SMTP agotado** (30/30 enviados) | 🔴 Agotado | 🔴 Bloqueante |
| **O3** | **Registro desincronizado** (CSV vs. `send-log.jsonl`) | ✅ Sincronizado (18 + 12) | 🟡 Bajo |
| **O4** | **Sin corte de respuestas** (`respuestas.jsonl`) | ✅ Barrido 22-10 · 0 reales · 30 sin novedad | 🟡 Bajo |
| **B7** | **Base de scouting vacía** (0 puertas válidas) | 🟠 En curso | 🟠 Alto |
| **B8** | **Canales manuales sin iniciar** (99 + 67 + 35) | 🟠 Pendiente | 🟠 Alto |
| **B9** | Tanda 5 de devs **sin curar** (45 crudos) | 🟡 Pendiente | 🟡 Medio |

### 6.1 B1 — resuelto, con un residual

La investigación de fuentes se cerró el 16-10 (`GWS_B1_Fuentes_Cifras_Mercado.md`) y la corrección
**ya se aplicó al copy en español**:

- **USD 450.000 M no es el tamaño actual**: es la **proyección a 2033**. El dato correcto es
  **USD 323.200 M (2025) → USD 450.200 M (2033)**, CAGR 4,3 % (Grand View Research).
- **“+50 millones de personas” se eliminó.** El empleo directo en Europa es de **~128.500**
  (Glass Alliance Europe, 2025).

**Verificado:** el Pitch Deck, el README de inversores, la Carta, los 18 correos institucionales y el
manifiesto en español **ya usan las cifras corregidas**. Los correos de logística no incluyen cifras
de mercado. Por lo tanto, **los 30 envíos del 16-10 no contienen el dato viejo**.

**Residual cerrado el 22-10:** la **versión en inglés** de `manifiesto_convocatoria.md` ya fue
corregida (usa USD 323.2 B / 450.2 B y no menciona los 50 M de personas).

---

## 7. Riesgos

1. **Residual de B1:** la versión **inglesa** del manifiesto conserva la cifra vieja y los 50 M de personas.
2. **Punto ciego de respuestas (O4):** sin corte de bandeja, un 2.º toque podría caer sobre alguien
   que ya respondió.
3. **Tres fuentes de verdad (O3):** CSV, `send-log.jsonl` y `GWS_Log_Envios.md` no coinciden
   (inversores: 0 marcados de 18 enviados; logística: 7 marcados de 12).
4. **Marca del emisor (O1):** sin la password institucional, los envíos salen desde el **Gmail de
   respaldo**, no desde `@glassworldstudio.com.ar`.
5. **Trampa de volumen:** 161 identificados y **0 respuestas medidas**; escalar ahora repetiría el
   error que el pivote buscó corregir.
6. **Documentos superados:** el `GWS_Parte_Situacion_Outreach.md` (16-10) describe “0 envíos” y B1
   abierto; ya no refleja la realidad.

---

## 8. Plan de acción propuesto

### 8.1 Inmediato — 0 a 7 días (medir y corregir) — ✅ cerrado el 22-10

1. ✅ **Crear y poblar `respuestas.jsonl`** y correr `node tools/outreach/followup-status.mjs` para
   producir el **corte real** de los 30 envíos (30 `sin_novedad`, 0 respuestas reales).
2. ✅ **Revisar la bandeja** (IMAP en **solo lectura**: INBOX, Spam y All Mail) y registrar el barrido.
3. ✅ **Cerrar el residual de B1:** versión inglesa del manifiesto corregida (USD 323.2 B / 450.2 B,
   sin “50 million people”).
4. ✅ **Sincronizar estados (O3):** CSV = `send-log.jsonl` (18 inversores/industria + 12 logística).
5. ⏳ **Cargar `OUTSEND_MAILBOX_PASSWORD`** y hacer un envío de prueba a una casilla propia:
   pendiente del owner; contingencia documentada en el checklist.

### 8.2 Corto plazo — 1 a 3 semanas (base limpia y definiciones)

6. **Scouting bloque A — logística pesada/frágil:** cargar y curar puertas verificadas.
7. **Scouting bloque B — inversores/mecenas** con tesis tecnológica o industrial.
8. **Scouting bloque C — arquitectos** con obra pública verificable.
9. **Cerrar B2** (participación/compensación) y **B4** (modelo de ingresos): sin esto no hay
   conversación de fondo con inversores ni con devs.
10. **Reanudar envío selectivo** sólo con `estado: activo` y sobre la base limpia curada.

### 8.3 Medio plazo — 3 a 6 semanas (contacto selectivo)

11. **Iniciar el canal manual de devs** (prioridad: multiagente, b2b, arquitectos con obra).
12. **2.º toque de los 30** — sólo si no respondieron, ≥ 5 días y < 3 toques.
13. **Reuniones:** logística P1 (arte frágil) e inversores sobre los ejes 1 y 4.

---

## 9. KPIs y forma de medición

| KPI | Fórmula | Al 22-10 | Meta 30 días |
|---|---|---:|---:|
| Envíos de 1er toque | filas OK en `send-log.jsonl` | **30** | +20 selectivos |
| Tasa de respuesta | respuestas / enviados | **0 % registrado** | medir real |
| Reuniones | acuerdos de agenda registrados | **0** | 3 |
| Puertas verificadas | filas válidas en `puertas-curadas.csv` | **0** | 20 |
| Acuerdos / pilotos | alianzas firmadas | **0** | 1 piloto logístico |
| Antigüedad del 1er toque | días desde el último envío | **6** | 5–10 |

> **Regla de honestidad:** una respuesta sólo cuenta si está registrada con fecha y correo. Un
> “me contestaron” sin registro **no es un dato**: es una impresión.

---

## 10. Anexo — trazabilidad de las fuentes

| Fuente | Qué aporta | Estado |
|---|---|---|
| `docs/logistica/send-log.jsonl` | 30 envíos, 0 fallos, 16-10 07:44→08:40Z | ✅ real |
| `docs/logistica/seguimiento.md` | resumen por segmento y por contacto (generado 17-10) | ✅ real |
| `docs/outreach/respuestas.jsonl` | 30 `sin_novedad` · 0 respuestas reales (barrido 22-10) | ✅ creado |
| `docs/outreach/GWS_Log_Envios.md` | log legible (actualizado 16-10 15:26) | ✅ real |
| `docs/outreach/scouting/GWS_Scouting_Informe.md` | 3 filas leídas · 0 válidas · 3 rechazadas | ✅ real |
| `docs/outreach/GWS_B1_Fuentes_Cifras_Mercado.md` | fuentes y corrección de cifras | ✅ cerrado |
| `docs/outreach/GWS_Modo_Operativo.md` | `estado: reposo` desde 17-10 | ✅ vigente |
| CSV de prospección | 35 inversores · 98 devs · 28 logística | ✅ sincronizados (18 + 12 enviados) |

---

## En una frase

**La campaña no está rota: está detenida y sin medir.** Hizo 30 envíos perfectos con las cifras ya
corregidas, pero todavía no sabe qué respondieron y no tiene base nueva. El siguiente paso no es
enviar más: es **medir la bandeja, sincronizar el registro y curar 20 puertas buenas** antes de
reanudar.

---

**Contacto oficial**
Eduardo Esper — Fundador, Glass World Studio
Web: <https://www.glassworldstudio.com.ar> · Institucional: `edu.esper@glassworldstudio.com.ar`
Respaldo: `eduardoesper75@gmail.com` · WhatsApp: +54 9 385 622-8400
Santiago del Estero, República Argentina
