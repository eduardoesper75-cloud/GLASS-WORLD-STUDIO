# GWS · Reporte de bandeja y eventos — Campaña de Alianzas

> **Corte:** 22-10-2026 · **Método:** barrido IMAP de **solo lectura**.
> **Registro canónico:** `docs/outreach/respuestas.jsonl` (local; no se versiona porque contiene
> datos de terceros).
> **Herramienta:** `tools/outreach/review-inbox.mjs`.

---

## 1. Alcance y método

- **Casilla revisada:** `eduardoesper75@gmail.com` (respaldo operativo; única con credenciales IMAP
  en `.env.local`).
- **Carpetas:** `INBOX`, `[Gmail]/Spam`, `[Gmail]/Todos` (All Mail).
- **Ventana:** desde `2026-10-15` (día previo al envío) hasta el `2026-10-22`.
- **Universo:** los **30 destinatarios** con envío OK del `send-log.jsonl`
  (18 inversores/industria + 12 logística).
- **Garantías:** el revisor sólo hace `fetch`. **No envía, no mueve, no marca y no borra** mensajes.
  Tampoco imprime credenciales.

---

## 2. Resultado del barrido

| Carpeta | Mensajes leídos | De la campaña | Eventos nuevos |
|---|---:|---:|---:|
| `INBOX` | 31 | 0 | 0 |
| `[Gmail]/Spam` | 1 | 0 | 0 |
| `[Gmail]/Todos` (All Mail) | 31 | 0 | 0 |
| **Total de barridos** | **63** | **0** | **0** |

> El total suma lecturas por carpeta; **All Mail se superpone con INBOX**, no son 63 mensajes únicos.

**Eventos detectados:**

| Tipo | Cantidad |
|---|---:|
| Respuestas | **0** |
| Bounces | **0** |
| Autorespuestas | **0** |
| Out-of-office | **0** |
| Unsubscribe / bajas | **0** |
| **Sin novedad** | **30** |

Los 31 mensajes del INBOX son newsletters y notificaciones (NVIDIA, Vercel, Google, Wordfence,
Scribd, etc.). **Ninguno proviene de los 30 destinatarios de la campaña.**

---

## 3. Limitación: casilla institucional

- `.env.local` **no tiene** `OUTSEND_MAILBOX_PASSWORD`, por lo que
  `edu.esper@glassworldstudio.com.ar` **no se pudo leer**.
- `send-batch.mjs` cae al respaldo Gmail si falta esa contraseña. El `send-log.jsonl` **no registra
  el emisor** y la carpeta `[Gmail]/Enviados` está vacía (el envío por curl SMTP no guarda copia).
  Por lo tanto, **Gmail es la hipótesis más probable, no un hecho probado por el registro**.
- Si alguno de los 30 correos salió desde la casilla institucional, su eventual respuesta queda
  **no medida**. Esto se declara como límite, no se cuenta como “sin respuesta”.
- **Contingencia documentada** en `docs/outreach/GWS_Checklist_Salida_Operativa.md` §1: definir/rotar
  la contraseña en Don Web, guardarla en el gestor del owner, cargarla sólo en el `.env` de
  OpenOutreach (fuera del repo), verificar con `run.ps1 status` y repetir el barrido.

---

## 4. Eventos por contacto

| Organización | Segmento | Tipo | Clasificación | Estado |
| --- | --- | --- | --- | --- |
| Universal Cargo Argentina | arte_fragil | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Masterpiece International | arte_fragil | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Movart | arte_fragil | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| PalletCo | empaque_crating | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Integral Project | empaque_crating | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Embamat | empaque_crating | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Lumber & Pallets | empaque_crating | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Oceanic Logística | forwarder | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| BAIFF Freight | forwarder | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Atlantic Cargo SRL / Transmodal | forwarder | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Chubb Chile | seguro_carga | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| International Cargo | seguro_carga | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Alaya Capital Partners | fondo | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Red Sudamericana de Inversiones | angel | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| IESE BAN | angel | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| ANFEVI | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| CAVIPLAN | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| AMEVEC | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Vidrala | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Envases del Sur | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Family Capital | fondo | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Adduntia | fondo | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Glass Alliance Europe | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Glass for Europe | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Glass Packaging Institute | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Assovetro | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Bundesverband Glasindustrie e.V. | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Associação Brasileira das Indústrias de Vidro | industrial | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| Inveready | fondo | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |
| FORUM GmbH | fondo | sin_novedad | requiere_seguimiento | SIN_NOVEDAD |

---

## 5. Esquema del registro

Cada línea de `respuestas.jsonl` es un evento:

| Campo | Contenido |
|---|---|
| `ts` | Fecha/hora UTC del evento |
| `campaign` | `alianzas-2026-10` |
| `to` | Destinatario |
| `company` | Organización |
| `segment` | Segmento (`fondo`, `angel`, `industrial`, `forwarder`, …) |
| `tipo` | `respuesta` · `bounce` · `autorespuesta` · `out_of_office` · `unsubscribe` · `sin_novedad` |
| `clasificacion` | `interesado` · `no_interesado` · `requiere_seguimiento` · `no_valido` |
| `estado` | `RESPONDIO` · `BAJA` · `REBOTADO` · `PAUSA` · `SIN_NOVEDAD` |
| `asunto` | Asunto del mensaje (si aplica) |
| `extracto` | Extracto breve del cuerpo |
| `from` | Remitente real |
| `message_id` | Identificador del mensaje o clave de barrido |
| `fuente` | `imap:<carpeta>` o `scan:<fecha>` |

El esquema versionado y un ejemplo están en `docs/outreach/respuestas.template.jsonl`.

---

## 6. Lectura correcta del resultado

- **“0 respuestas registradas” no significa “nadie respondió”.** Significa que **no se detectó
  respuesta en la casilla accesible**; la institucional no se midió.
- Los 30 contactos figuran **elegibles por tiempo** (≥ 5 días). **Pero la Fase 1 prohíbe el segundo
  toque**: la reactivación es Fase 3 y requiere base nueva validada.
- No se registró ningún bounce ni baja: no hay direcciones inválidas confirmadas ni pedidos de
  exclusión en esta ventana.

---

## 7. Próximos pasos

1. **Resolver el acceso institucional** y repetir el barrido sobre esa casilla.
2. Registrar cualquier respuesta manual con
   `node tools/outreach/followup-status.mjs --respondio=<correo> --nota="..."`.
3. **No enviar segundo toque** hasta cerrar la Fase 2 (20 puertas validadas) y la Fase 1.
4. Mantener el registro `respuestas.jsonl` como fuente canónica de eventos.
