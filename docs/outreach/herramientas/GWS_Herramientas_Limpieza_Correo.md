# Herramientas de limpieza y purga de correo — Evaluación (Glass World Studio)

> **Objetivo:** encontrar en GitHub repos, agentes MCP, scripts o skills de código abierto
> que se conecten a una casilla (IMAP o Gmail API) para **auditar, clasificar, listar
> suscripciones y purgar** correo (newsletters, notificaciones, spam), con credenciales
> fuera del código.
> **Método:** búsqueda en la **API pública de GitHub** + lectura de READMEs (sin scraping).
> Fecha: 16-10-2026.

---

## 1. Búsqueda ejecutada

Consultas usadas contra `api.github.com/search/repositories` (ordenadas por estrellas):

```
"gmail mcp server"   "email mcp server"   "imap mcp server"
"gmail cleanup"      "unsubscribe automation"   "imap email cleaner"
"list-unsubscribe"   "gmail api nodejs"   "imapflow"
```

Criterios de evaluación aplicados:
1. **Stack:** Node.js / TypeScript (el nuestro) por delante de Python.
2. **Seguridad:** credenciales por `.env` / variables de entorno; sin datos embebidos.
3. **Filtrado:** detección de suscripciones (`List-Unsubscribe`), newsletters, notificaciones, spam.
4. **Purga:** borrado seguro (**mover a Trash**, no solo permanente) y extracción de links de baja.
5. **Salud del repo:** activo, mantenido, licencia clara, no archivado.

---

## 2. Tabla comparativa (finalistas)

| Repo | ★ | Lenguaje | Licencia | Estado | IMAP / Gmail | Purga | Baja (unsubscribe) | Seguridad |
|---|---|---|---|---|---|---|---|---|
| **nikolausm/imap-mcp-server** | 111 | TypeScript | **MIT** | activo 2026-10-14 | IMAP (+Gmail) | ✅ `bulk_delete`, `delete_by_domain`, `delete_spam` | ⚠️ no nativa (analítica de spam) | **AES-256** de credenciales + modo read-only + allowlist |
| **codefuturist/email-mcp** | 128 | TypeScript | **LGPL-3.0** | muy activo 2026-10-16 | IMAP+SMTP (imapflow) | ✅ `delete_email`→Trash, `bulk_action` (100) | ✅ `cleanup_inbox` **sugiere** a quién darse de baja | Keychain / env (`MCP_EMAIL_*`), TLS |
| **kitlangton/mail-control** | 14 | TypeScript | *sin licencia* | activo 2026-10-04 | Gmail OAuth + iCloud | ✅ `mail trash`, `--dry-run` | ✅ `mail unsubscribe` (`List-Unsubscribe`) | `.env`/tokens gitignored |
| **Gururagavendra/gmail-cleaner** | 2119 | Python | MIT | semi-activo | Gmail API (OAuth propio) | ✅ delete by sender → Trash | ✅ **bulk unsubscribe** | OAuth propio, sin datos a terceros |
| **zbowling/gmail-ai-unsub** | 12 | Python | MIT | joven | Gmail API (OAuth propio) | ⚠️ etiqueta/borra | ✅ **RFC 8058 + mailto + navegador** | OAuth propio, `.env` |
| ~~GongRzhe/Gmail-MCP-Server~~ | 1168 | JavaScript | MIT | **ARCHIVADO** | Gmail API | ✅ delete/labels | ❌ | OAuth | 

Referencia de base técnica: **postalsys/imapflow** (★572, TypeScript, cliente IMAP de bajo nivel; licencia a **verificar**, marca `NOASSERTION`).

---

## 3. Análisis de los mejores

### 🥇 nikolausm/imap-mcp-server — mejor base para la purga
- **Servidor MCP en TypeScript**, licencia **MIT**, activo y sin archivar.
- **IMAP puro** → funciona con **contraseña de aplicación de Google** (sin crear proyecto OAuth ni pasar verificación).
- Credenciales **cifradas AES-256-CBC** en `~/.imap-mcp/` (clave separada) y opción de manejarlas
  **solo por variables de entorno** (`IMAP_MCP_ACCOUNT_*`) → alineado con nuestra regla "secretos solo en `.env`".
- Herramientas clave: `imap_search_emails`, `imap_domain_stats`, `imap_check_spam`,
  `imap_list_spam_domains`, `imap_delete_email`, `imap_move_email`, **`imap_bulk_delete`** (con chunking
  y reconexión), `imap_bulk_delete_by_search`, `imap_delete_spam`, `imap_delete_by_domain`.
- **Guardrails listos:** `IMAP_MCP_READ_ONLY=true` (sólo tools seguras) y allowlist `IMAP_MCP_ENABLED_TOOLS`.
- Contra: no resuelve la **baja** automática; hay que leer `List-Unsubscribe` aparte.

### 🥈 codefuturist/email-mcp — mejor para auditar/clasificar (con reparo de licencia)
- MCP en TypeScript, **muy activo**, construido sobre `imapflow` + `nodemailer`, 52 tools / 7 prompts.
- Trae **`cleanup_inbox`**: "sugiere correos para archivar, borrar **o darse de baja**" → es *literalmente* el caso de uso.
- `delete_email` mueve a **Trash**, `bulk_action` (hasta 100), labels *provider-aware*, IDLE en tiempo real,
  reglas estáticas + triage con IA.
- **Reparos:** licencia **LGPL-3.0-or-later** (usarlo como **proceso MCP separado**; no copiar/incrustar
  código en nuestro repo propietario sin cumplir la licencia), OAuth2 experimental y 65 issues abiertos.

### 🥉 kitlangton/mail-control — referencia para la baja
- CLI en TypeScript (sobre *Effect*) con **`mail unsubscribe`** basado en cabeceras `List-Unsubscribe`
  estándar, `mail trash`, `--dry-run` y salida `--json`.
- **Sin licencia declarada** → sirve **sólo como referencia de diseño**, no para reutilizar código.
- Útil para copiar el *enfoque* (baja estándar + dry-run + JSON) en un script propio.

### Mención: Gururagavendra/gmail-cleaner (★2119, Python)
- Es la herramienta **más completa y enfocada**: *bulk unsubscribe*, borrado por remitente,
  marcar leído, etiquetas, filtros inteligentes. Mueve a **Trash** (recuperable 30 días).
- Pero es **Python + Docker + OAuth propio** y el mantenedor está en pausa → la dejamos como plan B.

---

## 4. Recomendación para nuestro stack (Next.js / Node.js)

> **Estrategia: "IMAP + app password" antes que "Gmail API + OAuth".**
> Ya usamos una **contraseña de aplicación** de Google para el envío (`OUTSEND_MAILBOX_*`).
> Un enfoque IMAP evita crear/verificar una app OAuth en Google Cloud y reutiliza esa misma credencial.

**Opción recomendada (dos piezas + un módulo propio):**

1. **Motor de conexión y purga → `nikolausm/imap-mcp-server`** (MIT, TS, activo, credenciales cifradas).
   Se integra como **servidor MCP** del agente OpenCode; nos da búsqueda, analítica de remitentes/spam
   y borrado masivo **moviendo a Trash**, con modo read-only y allowlist como freno de seguridad.

2. **Auditoría/clasificación (opcional) → `codefuturist/email-mcp`**, ejecutado como **proceso aparte**
   por su licencia LGPL; aporta `cleanup_inbox` (sugerencias de archivar/borrar/baja) y labels.

3. **Módulo de baja → CLI propio en TypeScript** (no hay repo MIT maduro que lo haga bien):
   leer `List-Unsubscribe` y `List-Unsubscribe-Post`; si trae *One-Click*, hacer **POST RFC 8058**;
   si trae `mailto:`, enviar el correo de baja; si no, extraer el link del cuerpo para baja manual.
   Lógica de referencia (a portar, no a copiar): `kitlangton/mail-control` y `zbowling/gmail-ai-unsub`.

**Por qué no las otras:** `GongRzhe/Gmail-MCP-Server` está **archivado**; `gmail-cleaner` y `gmail-ai-unsub`
son **Python + OAuth propio**; `mcp-email-server` y `google_workspace_mcp` son Python.

---

## 5. Plan de puesta en marcha (7 pasos)

1. **Conexión (segura):** dar de alta la casilla con la **contraseña de aplicación** en
   `imap-mcp-server` (`imap.gmail.com:993`), arrancando con `IMAP_MCP_READ_ONLY=true`.
2. **Auditoría:** correr búsquedas de newsletters/notificaciones y `imap_domain_stats` +
   `imap_check_spam` para obtener el **ranking de remitentes** por volumen.
3. **Clasificación:** exportar la lista remitente + conteo; (opcional) triage con IA.
4. **Bajas:** extraer `List-Unsubscribe` de los remitentes top; **one-click (RFC 8058)** o `mailto`;
   registrar el resultado de cada baja.
5. **Purga:** `imap_bulk_delete_by_search` → **mover a Trash** (nunca permanente en la 1ª pasada),
   con chunking y confirmación; vaciar Trash en un paso separado y explícito.
6. **Guardrails:** read-only → allowlist de tools → confirmación humana; credenciales **sólo** por
   `.env`; **nunca** commitear.
7. **Automatización (opcional):** tarea programada semanal (auditoría + digest de bajas).

---

## 6. Guardrails de seguridad y privacidad

- Credenciales **fuera del repo** (`.env` externo del runner / variables `IMAP_MCP_ACCOUNT_*`).
- Arrancar en **read-only** y con **allowlist** de herramientas; habilitar el borrado después de validar.
- Borrado **a Trash** en primera instancia (recuperable); purga permanente sólo con confirmación explícita.
- **Sin scraping ni automatización de LinkedIn**; esta herramienta se usa **sólo sobre nuestra propia casilla**.

---

## 7. Anexo — descartados y por qué

| Repo | Motivo del descarte |
|---|---|
| `GongRzhe/Gmail-MCP-Server` | **Archivado** (no mantenido). |
| `Wh1isper/mcp-email-server` | Python. |
| `taylorwilsdon/google_workspace_mcp` | Python y alcance más amplio que la purga. |
| `Gururagavendra/gmail-cleaner` | Excelente, pero Python + OAuth propio + mantenedor en pausa (plan B). |
| `zbowling/gmail-ai-unsub` | Joven, Python; se usa su **lógica** como referencia. |
| `kitlangton/mail-control` | **Sin licencia**; sólo referencia de diseño. |

---

**Contacto oficial**
Eduardo Esper
Fundador — Glass World Studio
E-mail: esper.eduardo@gmail.com
Teléfono / WhatsApp: +54 9 385 582-6289
Santiago del Estero, República Argentina
