# GWS · Reporte de la Campaña de Alianzas Estratégicas

**Glass World Studio** · informe operativo de la Campaña de Alianzas Estratégicas
(inversores, desarrolladores, sector educativo/científico y logística).

> Este informe **sólo agrega datos reales**: se construye a partir de los corpus de correos
> versionados y del registro de envíos `docs/logistica/send-log.jsonl`. No contiene métricas
> estimadas ni contactos inventados. Las fechas de agenda pendientes quedan como
> `[COMPLETAR: ...]` hasta que existan.

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

- **Respuestas registradas: 0.** El registro de respuestas (`docs/logistica/respuestas.jsonl`) todavía
  no tiene entradas: no hay datos de respuesta que reportar.
- **Puerta de la campaña:** medir la respuesta del 1er toque **antes** de un nuevo envío.
- **Elegibles para 2º toque: 0** al día de hoy (la regla exige ≥ 5 días desde el último envío sin
  respuesta, y un máximo de **3 toques** por contacto).

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

| # | Hito | Estado |
| --- | --- | --- |
| 1 | Cargar `OUTSEND_MAILBOX_PASSWORD` y verificar el envío institucional con un correo de prueba propio | `[COMPLETAR: responsable/fecha]` |
| 2 | Medir respuestas del 1er toque (30 envíos, 0 fallos) y registrar altas/bajas/rebotes | `[COMPLETAR: fecha de corte]` |
| 3 | 2º toque a los elegibles (≥ 5 días sin respuesta, máx. 3 toques) | `[COMPLETAR: fecha]` |
| 4 | **Logística especializada (alta prioridad):** coordinación de reunión con los forwarders y operadores de carga frágil/arte ya contactados | `[COMPLETAR: fecha/hora]` |
| 5 | Agenda institucional con inversores (fondos/ángeles) sobre el material de los ejes 1 y 4 | `[COMPLETAR: fecha/hora]` |
| 6 | Revisión del pulso técnico con desarrolladores por canal manual (GitHub / LinkedIn) | `[COMPLETAR: fecha]` |

---

> **Regla de la campaña:** contacto legítimo, profesional y directo. Sin scraping, sin métricas
> inventadas, sin automatizar cuentas de terceros. Los datos que no existen quedan como
> `[COMPLETAR: ...]`.
