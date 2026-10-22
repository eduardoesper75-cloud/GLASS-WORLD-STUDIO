# GWS · Reporte de la Campaña de Alianzas Estratégicas

**Glass World Studio** · informe operativo de la Campaña de Alianzas Estratégicas
(inversores, desarrolladores, sector educativo/científico y logística).

> Este informe **sólo agrega datos reales**: se construye a partir de los corpus de correos
> versionados y del registro de envíos `docs/logistica/send-log.jsonl`. No contiene métricas
> estimadas ni contactos inventados. Las fechas de agenda pendientes quedan como
> `[COMPLETAR: ...]` hasta que existan.

> **Corte:** 17-10-2026. Para el estado medido al 22-10 (30 envíos, 0 respuestas reales,
> 30 sin novedad, CSV sincronizados), ver
> [`GWS_Informe_Continuidad_2026-10-22.md`](./GWS_Informe_Continuidad_2026-10-22.md).

---

## 1. Canales oficiales (obligatorios en toda comunicación)

| Canal | Dato |
| --- | --- |
| Página web oficial | <https://www.glassworldstudio.com.ar> |
| Correo institucional (Don Web) | `edu.esper@glassworldstudio.com.ar` |
| Correo personal (respaldo) | `eduardoesper75@gmail.com` |
| Teléfono / WhatsApp directo | `+54 9 385 622-8400` · <https://wa.me/5493856228400> |

Referencia canónica de las 4 plantillas: `docs/outreach/GWS_Plantillas_Institucionales.md`
(Inversores · Desarrolladores · Educativo/Científico · Logística).

---

## 2. Inventario de lotes de outreach (borradores listos)

| Fuente | Eje | Bloques | Con email (`**Para:**`) | Ya enviados | Sin email (canal manual) |
| --- | --- | --- | --- | --- | --- |
| `docs/outreach/inversores/GWS_Correos_Institucionales.md` | Inversores / capital | 19 | 18 | 18 | 1 |
| `docs/logistica/GWS_Correos_Logistica.md` | Logística | 11 | 7 | 7 | 4 |
| `docs/logistica/GWS_Correos_Forwarders.md` | Logística | 9 | 3 | 3 | 6 |
| `docs/logistica/GWS_Correos_Logistica_Cierre.md` | Logística | 11 | 2 | 2 | 9 |
| `docs/outreach/desarrolladores/GWS_Envio_Devs.md` | Desarrolladores | 99 | 0 | 0 | 99 (GitHub, manual) |
| `docs/outreach/linkedin/drafts.md` | Inversores + Desarrolladores | 35 | — | — | 35 (LinkedIn, manual) |
| `docs/outreach/desarrolladores/drafts_devs.md` | Desarrolladores | 66 | — | — | 66 (LinkedIn, manual) |
| **Total enviable por SMTP** | | **50** | **30** | **30** | **20** |

**Lectura:** el corpus enviable por SMTP son **30 destinatarios con correo real** y los **30 ya
fueron enviados**. Los borradores de desarrolladores (99 + 66) y de LinkedIn (35) son de **canal
manual**: no se automatizan (regla del Manifiesto: *no automatizar cuentas*).

### Bases de prospección (CSV, sin depuración pendiente)

| Base | Filas | Con correo |
| --- | --- | --- |
| `docs/logistica/logistica_aliados.csv` | 28 | 12 |
| `docs/outreach/desarrolladores/prospects_devs.csv` | 98 | 0 (columnas de enlace, no de correo) |
| `docs/outreach/desarrolladores/github-tanda3.csv` | 39 | 0 |
| `docs/outreach/desarrolladores/github-tanda4.csv` | 55 | 0 |
| `docs/outreach/desarrolladores/github-tanda5.csv` | 45 | 0 |
| `docs/outreach/desarrolladores/agencias_tech.csv` | 11 | 1 |
| `docs/outreach/linkedin/prospects.csv` | 35 | 15 (canal LinkedIn: manual) |

---

## 3. Firma de 4 canales — estado de la normalización

Se auditó **todo documento con la casilla institucional** (44 documentos). Se normalizó la firma
al patrón canónico en **todos los corpus de comunicación**:

- **29 archivos** del corpus de comunicación normalizados (se agregó el canal personal
  `eduardoesper75@gmail.com` como respaldo donde faltaba, y el enlace al sitio donde la firma no lo
  traía).
- **37 de 44** documentos con casilla institucional muestran hoy los 4 canales.
- **7 excepciones justificadas** (no son firmas sino referencias técnicas): `tools/imap-mcp/README.md`,
  `tools/imap-mcp/provision-accounts.mjs`, `packages/mail-cleanup/README.md`,
  `tools/outreach/send-batch.mjs`, `docs/security/GWS_S1_Remediacion_Credenciales.md`,
  `docs/outreach/herramientas/GWS_Reporte_Ranking_Correo.md` (fila de tabla de datos) y
  `apps/web/src/lib/announcements.ts` (metadatos `contact`/`site` de las novedades; los 4 canales se
  muestran en la web vía los componentes de contacto del sitio).

También se actualizaron los **generadores** (`generate-correos-institucionales.mjs`,
`generate-envios.mjs`, `generate-drafts.mjs`, `build-tanda5-revision.mjs`, `build-envios-log.mjs`) para
que una regeneración futura conserve los 4 canales.

---

## 4. Envíos reales (registro)

Fuente: `docs/logistica/send-log.jsonl` (archivo de trabajo, ignorado por git).

| Métrica | Valor |
| --- | --- |
| Envíos OK | **30** |
| Fallos | **0** |
| Fecha | 2026-10-16 |
| *Throttle* | 60 s entre envíos |
| Modo | automatizado, idempotente (omite ya enviados) |

### Por segmento (del registro)

| Segmento | Contactos | Envíos OK | Fallos |
| --- | --- | --- | --- |
| industrial | 11 | 11 | 0 |
| fondo | 5 | 5 | 0 |
| empaque_crating | 4 | 4 | 0 |
| forwarder | 3 | 3 | 0 |
| arte_fragil | 3 | 3 | 0 |
| seguro_carga | 2 | 2 | 0 |
| angel | 2 | 2 | 0 |

---

## 5. Seguimiento y respuestas

- **Respuestas registradas: 0.** Al 17-10 el registro (`docs/outreach/respuestas.jsonl`) no tenía
  entradas. El barrido de solo lectura del **22-10** registró **30 contactos sin novedad** y
  **0 respuestas reales** (ver el informe de continuidad).
- **Puerta de la campaña:** medir la respuesta del 1er toque **antes** de un nuevo envío.
- **Elegibles para 2º toque: 0** al 17-10. Al 22-10 los 30 cumplen el criterio de tiempo, pero la
  Fase 1 prohíbe el segundo toque: la reactivación es Fase 3 (ver informe de continuidad).

Herramienta de seguimiento (lee el registro real, no inventa datos):

```bash
node tools/outreach/followup-status.mjs
node tools/outreach/followup-status.mjs --min-days=5
node tools/outreach/followup-status.mjs --respondio=info@empresa.com --nota="pidió el pitch deck"
node tools/outreach/followup-status.mjs --baja=info@empresa.com
node tools/outreach/followup-status.mjs --rebotado=info@empresa.com
```

Produce el informe de trabajo `docs/logistica/seguimiento.md` (ignorado por git: contiene correos de
terceros) con el resumen por segmento, el estado por contacto y la elegibilidad para el 2º toque.

---

## 6. Bloqueos y requisitos abiertos

1. **Contraseña de la casilla institucional.** Falta `OUTSEND_MAILBOX_PASSWORD` (Don Web/Ferozo) en
   `.env.local`. Sin ella, `tools/outreach/send-batch.mjs` cae al **respaldo Gmail**
   (`smtp.gmail.com:587`, canal secundario) en lugar de enviar desde la casilla institucional. El
   emisor previsto ya se informa en la salida del script.
2. **Universo de correo agotado.** El corpus enviable por SMTP tiene 30 destinatarios y los 30 están
   enviados: **no hay primera oleada nueva que enviar** sin incorporar datos de contacto nuevos
   (legítimos, no extraídos por scraping).
3. **Canales manuales.** Los 99 + 66 borradores de desarrolladores y los 35 de LinkedIn son de envío
   manual (GitHub / LinkedIn), con ritmo humano y sin automatizar cuentas.

---

## 7. Próximos hitos

> Reordenados por el **pivote a investigación** del 17-10-2026 (ver §8). El envío queda **bloqueado**
> mientras el modo operativo esté en `reposo`.

| # | Hito | Estado |
| --- | --- | --- |
| 1 | **Pausa institucional:** modo operativo en `reposo` (envío bloqueado, modo consulta) | ✅ vigente desde 17-10-2026 |
| 2 | **Scouting bloque A — logística de carga pesada y frágil** (alta prioridad): puertas verificadas con canal publicado | `[COMPLETAR: N objetivo y fecha]` |
| 3 | **Scouting bloque B — inversores, fondos semilla y mecenas** con perfil tecnológico o industrial | `[COMPLETAR: N objetivo y fecha]` |
| 4 | **Scouting bloque C — arquitectos de ecosistemas digitales avanzados** con obra pública verificable | `[COMPLETAR: N objetivo y fecha]` |
| 5 | Curaduría de la base limpia (`scout-curate.mjs`) y revisión del listado selectivo | continuo |
| 6 | **Medir respuestas del 1er toque** (30 envíos, 0 fallos) y registrar altas/bajas/rebotes | `[COMPLETAR: fecha de corte]` |
| 7 | Cargar `OUTSEND_MAILBOX_PASSWORD` y verificar el envío institucional con un correo de prueba propio | `[COMPLETAR: responsable/fecha]` |
| 8 | Reanudar el envío **selectivo** (sólo con `estado: activo` y tras el corte de medición) | `[COMPLETAR: fecha]` |
| 9 | **Logística especializada (alta prioridad):** coordinación de reunión con los operadores de carga frágil/pesada | `[COMPLETAR: fecha/hora]` |
| 10 | Agenda institucional con inversores sobre el material de los ejes 1 y 4 | `[COMPLETAR: fecha/hora]` |

---

## 8. Pivote a investigación y scouting (17-10-2026)

La campaña **cambia de foco**: deja de escalar volumen y vuelve a **investigar a mano**.

- **Objetivo nuevo:** compilar una **base limpia, orgánica y rigurosa de nuevas puertas
  institucionales** (desarrolladores/arquitectos, inversores y mecenas con perfil tecnológico o
  industrial, y logística especializada de carga pesada/frágil) para **golpear de forma selectiva**.
- **Marco vigente:** [`GWS_Scouting_Puertas_Alto_Valor.md`](./GWS_Scouting_Puertas_Alto_Valor.md)
  (criterios de alto valor, protocolo de verificación y curaduría).
- **Estado operativo:** `reposo` en [`GWS_Modo_Operativo.md`](./GWS_Modo_Operativo.md) — el emisor
  `send-batch.mjs` **se niega a enviar** en ese estado (verificado: `--execute` aborta sin enviar nada).
- **Herramienta nueva:** `tools/outreach/scout-curate.mjs` — valida, deduplica (contra 236
  organizaciones de las bases existentes y los 30 destinatarios ya contactados) y emite la base limpia
  ordenada para contacto selectivo. **No envía nada.**
- **Registros:** resguardados localmente, fuera de git (§5 del playbook).

> No hay dato nuevo que reportar sobre envíos: **no se envió nada** durante el pivote.

---

> **Regla de la campaña:** contacto legítimo, profesional y directo. Sin scraping, sin métricas
> inventadas, sin automatizar cuentas de terceros. Los datos que no existen quedan como
> `[COMPLETAR: ...]`.
