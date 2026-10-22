# GWS · Informe de Continuidad — Campaña de Alianzas Estratégicas

> **Corte:** 22-10-2026 · **Fase 1 cerrada** · **Fase 2 ejecutada** (20/20 puertas)
> **Fase 2:** ver `docs/outreach/GWS_Informe_Fase2_Puertas_2026-10-22.md`.
> **Alcance:** campaña de búsqueda de inversores, desarrolladores y logística.
> **Método:** sólo datos reales y trazables. Cero métricas estimadas, cero contactos inventados.

---

## 1. Resumen ejecutivo

La **Fase 1 (medición y saneamiento)** quedó cerrada:

- **30 envíos reales** del 16-10-2026, **0 fallos**, **0 respuestas reales**, **0 bounces** y
  **30 contactos sin novedad**.
- El registro canónico de respuestas existe: `docs/outreach/respuestas.jsonl` (30 líneas,
  todas `sin_novedad`).
- Los CSV de prospección quedaron **sincronizados con el registro real**: **18 inversores/industria**
  y **12 logística** marcados como `enviado`.
- El **manifiesto en inglés** quedó corregido (cifras 2025/2033; sin “50 millones de personas”).
- El **acceso a la casilla institucional sigue sin resolverse**, pero la **contingencia está
  documentada** y el barrido de Gmail ya se hizo.
- La campaña **sigue en `reposo`**. **No se envió ningún segundo toque.**

**Estado real:** la campaña está **medida, sincronizada y con base nueva**: **20/20 puertas
validadas** (8 logística, 6 inversores, 6 desarrolladores/arquitectos). La Fase 3 sigue **no
autorizada** y la campaña sigue en `reposo`.

---

## 2. Qué se hizo (evidencia)

| Entregable | Resultado | Evidencia |
|---|---|---|
| Registro de respuestas | 30 eventos `sin_novedad`; 0 respuestas reales | `docs/outreach/respuestas.jsonl` |
| Barrido de bandeja | INBOX 31 leídos · Spam 1 · All Mail 31; **0 eventos de campaña** | `docs/outreach/GWS_Reporte_Bandeja_2026-10-22.md` |
| Estado por contacto | 30 contactos · 30 envíos OK · 0 respuestas · 30 elegibles por tiempo | `docs/logistica/seguimiento.md` |
| Sincronización de CSV | 18 inversores/industria + 12 logística = **30**; 23 filas cambiadas | `tools/outreach/sync-campaign.mjs --apply` |
| Manifiesto inglés | Línea 110 corregida: USD 323.2 B (2025) → USD 450.2 B (2033) | `docs/outreach/manifiesto_convocatoria.md` |
| Acceso institucional | No resuelto; contingencia y procedimiento seguro documentados | `docs/outreach/GWS_Checklist_Salida_Operativa.md` §1 |
| Herramientas | Revisor IMAP y sincronizador idempotente | `tools/outreach/review-inbox.mjs`, `tools/outreach/sync-campaign.mjs` |
| Seguimiento | Distingue respuesta real, pausa y sin novedad | `tools/outreach/followup-status.mjs` |

### 2.1 Detalle del barrido

- Casilla accesible: `eduardoesper75@gmail.com`.
- Carpetas: `INBOX`, `[Gmail]/Spam`, `[Gmail]/Todos` (All Mail).
- Ventana: 2026-10-15 → 2026-10-22.
- **0 respuestas, 0 bounces, 0 autorespuestas, 0 out-of-office, 0 bajas.**
- Los 31 mensajes del INBOX son newsletters/notificaciones, ninguno de los 30 destinatarios.

### 2.2 Límite declarado

- `OUTSEND_MAILBOX_PASSWORD` **no está cargada**: la casilla
  `edu.esper@glassworldstudio.com.ar` **no se pudo medir**.
- `send-batch.mjs` cae a Gmail si falta esa contraseña; el `send-log.jsonl` no registra el emisor y
  la carpeta Enviados está vacía. **Gmail es la hipótesis más probable, no un hecho probado.**
- Si algún correo salió desde la casilla institucional, su respuesta queda **no medida**.

---

## 3. Fase 1 — criterios de cierre

| Criterio | Estado |
|---|---|
| `respuestas.jsonl` creado y poblado | ✅ 30 `sin_novedad` |
| Bandeja revisada | ✅ INBOX + Spam + All Mail · ⚠️ institucional no accesible |
| CSV sincronizados con el registro real | ✅ 18 + 12 |
| Manifiesto inglés corregido | ✅ |
| Acceso institucional resuelto o contingencia documentada | ✅ contingencia documentada (no resuelto) |

> La Fase 1 se cierra con el límite institucional **declarado**, no oculto. La medición es completa
> para la casilla accesible y **parcial** para el canal institucional.

---

## 4. Fase 2 — reconstrucción del universo (1–3 semanas)

### 4.1 Objetivo

Curar **al menos 20 puertas válidas**, separadas por segmento y con evidencia verificable.

### 4.2 Cupos propuestos

| Segmento | Cupo mínimo |
|---|---:|
| Logística pesada y frágil | 8 |
| Inversores con tesis compatible | 6 |
| Desarrolladores / arquitectos con obra o experiencia | 6 |
| **Total** | **20** |

### 4.3 Ficha obligatoria por puerta

Usar el esquema de `docs/outreach/scouting/puertas.csv`:

`eje, perfil, organizacion, ambito, rol_decisor, fundamento, fuente, url, canal, email_contacto,
prioridad, estado, notas`

Reglas:

- **Fuente pública citada** (no scraping, no bases compradas).
- **Canal corporativo publicado**; correos gratuitos se marcan y no se usan como primera opción.
- **Rol decisor** identificado o `[COMPLETAR]`.
- **Sin duplicados** contra `send-log.jsonl` y contra los CSV existentes.
- Lo que falta es `[COMPLETAR]`; la fila queda `a validar`, no se inventa.

### 4.4 Validación

Herramienta: `node tools/outreach/scout-curate.mjs` (valida, deduplica y emite la base limpia).
Cada fila debe pasar:

1. Organización real y vigente.
2. Fuente pública que sostenga el vínculo con vidrio, logística, inversión o desarrollo.
3. Canal de contacto verificado.
4. Rol decisor o vía clara hacia él.
5. Sin contacto previo en el registro.

### 4.5 Bloqueos a cerrar antes de reactivar

- **B2 — participación / compensación** (inversores y devs).
- **B4 — modelo de ingresos / monetización**.
- **B5 — persona decisora por fondo** (se completa durante la curación).

### 4.6 Límite diario y exclusión

Regla adoptada para la Fase 3:

- Máximo **5 envíos por día en total** (primeros contactos o seguimientos) y **3 toques por contacto**.
- **5 días hábiles** mínimos entre toques.
- Lista de exclusión: respondió, bounce, unsubscribe, cliente/aliado existente y competidores
  directos.

### 4.7 Estado al corte

**20 / 20 puertas validadas** (22-10-2026): 8 logística pesada/frágil, 6 inversores y 6
desarrolladores/arquitectos. **0 duplicadas, 0 rechazadas.** Detalle y fuentes:
`GWS_Informe_Fase2_Puertas_2026-10-22.md`. La base operativa (`puertas-curadas.csv`) es local y no
se versiona por contener datos de contacto de terceros.

---

## 5. Fase 3 — reactivación controlada (3–6 semanas)

1. **Segundo toque** sólo a contactos que:
   - recibieron el primer envío hace **5 días o más**;
   - **no respondieron**;
   - **no** registran bounce, unsubscribe ni rechazo.
2. **Canal manual de desarrolladores** por GitHub y LinkedIn.
3. Registrar **toda** interacción en el mismo sistema (`respuestas.jsonl` / `seguimiento.md`).
4. Buscar las primeras **reuniones o respuestas calificadas**.
5. Recién con evidencia de interés, evaluar **nuevos envíos SMTP**.

> Al 22-10 los 30 contactos están **elegibles por tiempo**, pero **no se toca nada**: primero la
> Fase 2 y la definición de B2/B4.

---

## 6. Riesgos y límites

| Riesgo | Estado | Mitigación |
|---|---|---|
| Casilla institucional no medida | 🔴 Abierto | Resolver password y repetir barrido |
| Emisor real no probado por el log | 🟠 Declarado | Verificar en el próximo envío y registrar `from` |
| “0 respuestas” ≠ “nadie respondió” | 🟠 Declarado | Medición parcial explicitada |
| Universo SMTP agotado (30/30) | 🟢 Cerrado | 20 puertas nuevas validadas (Fase 2) |
| Base de scouting (20/20) | 🟢 Cerrado | 20/20 validadas con fuente pública |
| B2/B4 — posición operativa | 🟠 Operativo | Cerrados como posición; términos finales pendientes del titular |
| Riesgo de prometer participación/ingresos sin definir | 🟠 Alto | Política: no se anuncian porcentajes ni ingresos |

---

## 7. Trazabilidad

### 7.1 Fuentes canónicas

| Dato | Fuente |
|---|---|
| Envíos | `docs/logistica/send-log.jsonl` |
| Respuestas / eventos | `docs/outreach/respuestas.jsonl` |
| Seguimiento por contacto | `docs/logistica/seguimiento.md` |
| Puertas de scouting | `docs/outreach/scouting/puertas.csv` |

### 7.2 Política de datos

- `respuestas.jsonl`, `respuestas-scan.json`, los CSV de prospección y `send-log.jsonl` contienen
  datos de terceros y **no se versionan**.
- El esquema y un ejemplo sanitizado sí se versionan: `docs/outreach/respuestas.template.jsonl`.
- El `.env` y las credenciales **nunca** se commitean.

### 7.3 Cambios de esta fase

- **Nuevos:** `GWS_Informe_Continuidad_2026-10-22.md`, `GWS_Reporte_Bandeja_2026-10-22.md`,
  `GWS_Informe_Situacion_Campana.md`, `respuestas.template.jsonl`, `.gitignore`,
  `tools/outreach/review-inbox.mjs`, `tools/outreach/sync-campaign.mjs`.
- **Actualizados:** `GWS_Parte_Situacion_Outreach.md` (aviso de informe superado), `README.md`,
  `GWS_Modo_Operativo.md`, `GWS_Scouting_Puertas_Alto_Valor.md`, `GWS_Reporte_Campana_Alianzas.md`,
  `GWS_Checklist_Salida_Operativa.md`, `manifiesto_convocatoria.md`,
  `tools/outreach/followup-status.mjs`.

---

## 8. Próximos pasos inmediatos

1. **Owner:** definir/rotar la contraseña de la casilla institucional y cargarla en el `.env` de
   OpenOutreach (procedimiento en el checklist). Sin esto, la medición institucional sigue ciega.
2. **Fase 2:** cerrada en su entregable principal (20/20). Ver
   `GWS_Informe_Fase2_Puertas_2026-10-22.md`.
3. **B2/B4:** cerrados como posición operativa; los términos económicos finales requieren
   aprobación del titular antes de cualquier term sheet.
4. **Mantener `reposo`** hasta que la Fase 1 esté cerrada y exista base nueva validada.
5. **Fase 3:** recién entonces, segundo toque controlado y canales manuales.

---

> **Regla de honestidad:** una respuesta sólo cuenta si está registrada con fecha y correo. Un
> “me contestaron” sin registro no es un dato: es una impresión. Del mismo modo, una puerta sólo
> cuenta si tiene fuente y contacto verificables.
