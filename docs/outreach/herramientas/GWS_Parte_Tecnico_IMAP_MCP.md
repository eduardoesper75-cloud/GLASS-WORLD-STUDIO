# Parte técnico — Auditoría y purga de correo (IMAP / MCP)

> **Estado:** 🟡 **AUDITORÍA PARCIAL EJECUTADA (modo solo lectura).**
> Se auditó **1 de 2** casillas: `eduardoesper75@gmail.com`. La segunda
> (`esper.eduardo@gmail.com`) sigue **pendiente de su contraseña de aplicación**.
> **No se ejecutó ninguna baja ni se movió ningún correo a `Trash`.**
>
> **Generado:** 2026-10-16 (UTC). **Sistema:** Glass World Studio (GWS).
> **Fuente de datos:** `data/mail-cleanup/audit-2026-10-16T05-44-20.json`.
> **Informe de ranking (auto):** `GWS_Reporte_Ranking_Correo.md`.

## Tablero de métricas (estado real)

| Métrica | Valor |
|---|---:|
| Casillas registradas | 2 |
| Casillas auditadas | **1 / 2** |
| Correos analizados | **573** (de 718 en INBOX) |
| Ventana | 2025-12-29 → 2026-10-16 (365 días) |
| Remitentes distintos | **105** |
| Dominios distintos | **63** |
| Remitentes con `List-Unsubscribe` | **41** (250 correos) |
| Remitentes con baja *one-click* (RFC 8058) | **39** |
| Remitentes sin cabecera de baja | **64** (323 correos) |
| Coincidencias de `chatex.ai` | **1** (aviso de Google; ver §2.5) |
| Bajas ejecutadas (`List-Unsubscribe` / RFC 8058) | **0** |
| Correos movidos a `Trash` | **0** |
| Correos eliminados | **0** (borrado permanente no implementado) |
| Errores que requieren intervención manual | **2** (ver §3.4) |

### Distribución por tipo (por mensaje)

| Tipo | Correos |
|---|---:|
| Otro / Notificaciones | 439 |
| Cobros | 48 |
| Boletines | 41 |
| Trial | 35 |
| Suscripción | 10 |
| Spam | 0 |
| **Total** | **573** |

---

## 0. Solicitud formal al operador (bloqueante)

> **PARA:** Eduardo Esper (operador) · **DE:** Agente de auditoría IMAP/MCP
>
> **SOLICITUD:** provisión de la **contraseña de aplicación** de 16 caracteres
> para la casilla **`esper.eduardo@gmail.com`**.
>
> **CÓMO:** iniciar sesión en esa cuenta y crearla en
> <https://myaccount.google.com/apppasswords> (requiere verificación en dos
> pasos). Nombre sugerido: `GWS mail cleanup`.
>
> **DESTINO:** añadirla en `.env.local` como
> `IMAP_MCP_ACCOUNT_ESPER_EDUARDO_IMAP_PASSWORD=<16 caracteres>`.
>
> **MOTIVO:** las contraseñas de aplicación son **por cuenta**; la de
> `eduardoesper75` (`<REDACTED>`) **no es válida** en `esper.eduardo`
> (el servidor responde *Invalid credentials*). Sin esta credencial, la 2ª
> casilla queda **sin auditar** y el pipeline de baja no puede consolidarse.
>
> **ESTADO:** ⛔ pendiente. Ninguna acción destructiva se ejecutará hasta
> recibirla y obtener aprobación explícita (§4).

---

## 1. Inventario de conectividad y sesión

### 1.1 Casillas registradas

Fuente: `%USERPROFILE%\.imap-mcp\accounts.json` (credenciales vacías; se resuelven
por entorno).

| Clave | Casilla | Host / Puerto | TLS | `accountId` |
|---|---|---|---|---|
| `eduardoesper75` | eduardoesper75@gmail.com | imap.gmail.com:993 | ✅ | `63b1ad0e-f946-4d1c-856f-13d4d3da7527` |
| `esper.eduardo` | esper.eduardo@gmail.com | imap.gmail.com:993 | ✅ | `1d81db61-347b-458c-a790-37035827a7d3` |

### 1.2 Validación de credenciales (prueba real contra Gmail)

| Casilla | Credencial | Resultado | `serverResponseCode` |
|---|---|---|---|
| eduardoesper75 | contraseña de cuenta `Esperglass75` | *Application-specific password required* | `ALERT` |
| eduardoesper75 | contraseña de cuenta `Esperglass.75` | *Invalid credentials* | `AUTHENTICATIONFAILED` |
| eduardoesper75 | **app password `<REDACTED>`** | ✅ **Conexión y login OK** | — |
| esper.eduardo | contraseña de cuenta `Esperglass75` | *Application-specific password required* | `ALERT` |
| esper.eduardo | contraseña de cuenta `Esperglass.75` | *Invalid credentials* | `AUTHENTICATIONFAILED` |
| esper.eduardo | app password `<REDACTED>` | ❌ *Invalid credentials* | `AUTHENTICATIONFAILED` |

**Conclusiones:**

- La contraseña de **cuenta** `Esperglass75` es válida para **ambas** casillas, pero
  Gmail exige app password por IMAP (verificación en dos pasos). `Esperglass.75`
  es inválida.
- La app password `<REDACTED>` **solo funciona en `eduardoesper75`**: las
  contraseñas de aplicación son **por cuenta**. **Falta la de `esper.eduardo`.**
- Estado en `.env.local` (no versionado):

  ```dotenv
  IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_PASSWORD=********  ✅ cargada
  IMAP_MCP_ACCOUNT_ESPER_EDUARDO_IMAP_PASSWORD=           ⛔ pendiente
  ```

### 1.3 Flags de seguridad vigentes

| Control | Estado | Evidencia |
|---|---|---|
| `IMAP_MCP_READ_ONLY` | **`true`** (por defecto del launcher) | 16 tools MCP, todas de lectura |
| CLI `@gws/mail-cleanup` | Bajas y purga en **dry-run** por defecto | `--apply` (+ `--yes` en purga) |
| Borrado permanente | **No implementado** | Solo `messageMove` → `Trash` |

Tools MCP expuestas (16, ninguna destructiva): `imap_check_spam`, `imap_connect`,
`imap_disconnect`, `imap_domain_stats`, `imap_download_attachment`,
`imap_find_email_by_message_id`, `imap_find_thread_messages`, `imap_folder_status`,
`imap_get_email`, `imap_get_latest_emails`, `imap_get_unread_count`,
`imap_list_accounts`, `imap_list_folders`, `imap_list_spam_domains`,
`imap_search_emails`, `imap_test_account`.

### 1.4 Intercepción TLS (Avast) — resuelta

Avast Mail Shield firma el TLS de `imap.gmail.com:993` con su propio CA
(`issuer: Avast Web/Mail Shield Root`), que Node no confía por defecto
(`self-signed certificate in certificate chain`). **Corregido** con
`--use-system-ca` en el CLI (`package.json`) y en el launcher MCP
(`NODE_OPTIONS`). Verificado: el login IMAP completó correctamente tras el ajuste.

---

## 2. Ranking real de dominios y remitentes

> Casilla: `eduardoesper75@gmail.com` · 573 correos · 105 remitentes · 63 dominios.

### 2.1 Top 30 remitentes por volumen

| # | Remitente | Correos | Tipo | List-Unsubscribe |
|---:|---|---:|---|---|
| 1 | hello@notify.railway.app | 62 | Otro/Notif. | — |
| 2 | list@wordfence.com | 54 | Otro/Notif. | ✅ One-Click |
| 3 | wordpress@glassworldstudio.com.ar | 31 | Otro/Notif. | — |
| 4 | noreply-accounts@google.com | 26 | Otro/Notif. | ✅ One-Click |
| 5 | talleres@mkt.donweb.com | 23 | Otro/Notif. | ✅ One-Click |
| 6 | noreply@github.com | 17 | Otro/Notif. | — |
| 7 | cloud@mkt.donweb.com | 16 | Otro/Notif. | — |
| 8 | email@mkt.donweb.com | 16 | Otro/Notif. | — |
| 9 | googleplay-noreply@google.com | 16 | Cobros | — |
| 10 | no-reply@trs.donweb.com | 16 | Boletines | — |
| 11 | no-reply@accounts.google.com | 15 | Otro/Notif. | — |
| 12 | noreply@email.openai.com | 15 | Otro/Notif. | ✅ One-Click |
| 13 | news@nvidia.com | 13 | Otro/Notif. | ✅ One-Click |
| 14 | cloudplatform-noreply@google.com | 12 | Cobros | — |
| 15 | no-reply@ciotrs.donweb.com | 12 | Otro/Notif. | — |
| 16 | hello@ollama.com | 10 | Otro/Notif. | ✅ One-Click |
| 17 | info@arcap.org | 9 | Boletines | ✅ One-Click |
| 18 | simonsquibb@simonsquibb.com | 9 | Otro/Notif. | ✅ One-Click |
| 19 | close_friend_updates@facebookmail.com | 8 | Otro/Notif. | ✅ One-Click |
| 20 | googleone-noreply@google.com | 8 | Otro/Notif. | ✅ One-Click |
| 21 | theaccelerator@workana.com | 8 | Otro/Notif. | — |
| 22 | hello@news.railway.app | 7 | Otro/Notif. | — |
| 23 | marc@updates.langfuse.com | 7 | Otro/Notif. | ✅ One-Click |
| 24 | messages-noreply@linkedin.com | 7 | Otro/Notif. | ✅ One-Click |
| 25 | notifications@discuss.ai.google.dev | 7 | Otro/Notif. | ✅ One-Click |
| 26 | ofertas@r.mercadolibre.com.ar | 7 | Otro/Notif. | ✅ One-Click |
| 27 | academy@workana.com | 6 | Otro/Notif. | — |
| 28 | azamil@linkedin.com | 5 | Otro/Notif. | — |
| 29 | failed-payments+acct_1q2ptje7tv1tcgir@stripe.com | 5 | Cobros | — |
| 30 | changelog@neon.tech | 4 | Otro/Notif. | ✅ One-Click |

*(Tabla completa Top 50 en `GWS_Reporte_Ranking_Correo.md`.)*

### 2.2 Top dominios por volumen

| # | Dominio | Correos |
|---:|---|---:|
| 1 | google.com | 81 |
| 2 | notify.railway.app | 62 |
| 3 | mkt.donweb.com | 55 |
| 4 | wordfence.com | 54 |
| 5 | glassworldstudio.com.ar | 31 |
| 6 | github.com | 17 |
| 7 | nvidia.com | 17 |
| 8 | trs.donweb.com | 16 |
| 9 | workana.com | 16 |
| 10 | accounts.google.com | 15 |
| 11 | email.openai.com | 15 |
| 12 | linkedin.com | 13 |
| 13 | ciotrs.donweb.com | 12 |
| 14 | ollama.com | 10 |
| 15 | facebookmail.com | 10 |
| 16 | arcap.org | 9 |
| 17 | simonsquibb.com | 9 |
| 18 | news.railway.app | 7 |
| 19 | updates.langfuse.com | 7 |
| 20 | discuss.ai.google.dev | 7 |
| 21 | r.mercadolibre.com.ar | 7 |
| 22 | neon.tech | 7 |
| 23 | stripe.com | 6 |
| 24 | youtube.com | 6 |
| 25 | openrouter.ai | 6 |

### 2.3 Cobros y pasarelas detectadas

| Remitente / Pasarela | Dominio | Correos | Detalle |
|---|---|---:|---|
| googleplay-noreply@google.com | google.com | 16 | Recibos Google Play |
| cloudplatform-noreply@google.com | google.com | 12 | Facturación Google Cloud |
| failed-payments+…@stripe.com | stripe.com | 5 | **Stripe** — pagos fallidos (servicio "Lummi") |
| newsletter@mailing.sporting.com.ar | sporting.com.ar | 4 | Cobros/boletín (one-click) |
| googleone-updates-noreply@google.com | google.com | 3 | Google One (one-click) |
| no-responder@mercadopago.com | mercadopago.com | 3 | **Mercado Pago** |
| support@accounts.scribd.com | scribd.com | 3 | Suscripción Scribd |
| no-reply@info.mercadolibre.com.ar | mercadolibre.com.ar | 2 | Mercado Libre |
| upcoming-invoice+…@stripe.com | stripe.com | 1 | **Stripe** — factura próxima ("Lummi") |
| nao-responder@ / novedades@ / promocion@mercadopago.com | mercadopago.* | 3 | Mercado Pago (2 one-click) |
| payments-noreply@google.com | google.com | 1 | Pagos Google |
| info@mail.coinbase.com | mail.coinbase.com | 1 | **Coinbase** |

### 2.4 Boletines, suscripciones y trials

| Tipo | Remitente | Correos | Baja |
|---|---|---:|---|
| Boletines | no-reply@trs.donweb.com | 16 | — |
| Boletines | info@arcap.org | 9 | ✅ one-click |
| Suscripción | noreply-purchases@youtube.com | 4 | — |
| Suscripción | lummi@email.lummi.ai | 2 | — |
| Suscripción | hello@accounts.scribd.com | 1 | — |
| Trial | session-replay@sentry.io | 2 | ✅ one-click |
| Trial | events@sentry.io | 1 | ✅ one-click |

- **Spam: 0** (ninguna coincidencia con casillas/dominios de spam conocidos).
- Dominios de spam en la lista interna del MCP: 50 (tempmail, mailinator, yopmail,
  `secure-login-verify.com`, etc.) — **ninguno** apareció en el correo auditado.

### 2.5 Búsqueda específica: `chatex.ai`

**Resultado: 1 coincidencia** (no es un cobro, es un aviso de Google):

| Campo | Valor |
|---|---|
| Fecha | 2026-10-04 02:07:04 UTC |
| De | `noreply-accounts@google.com` (Google) |
| Asunto | *«Compartiste algunos datos de tu Cuenta de Google con chatex.ai»* |
| Tipo detectado | Otro/Notificación |
| Baja | Sí (`one-click`) |

Interpretación: `chatex.ai` aparece **solo como destinatario de un permiso/uso de
datos de tu Cuenta de Google** (notificación de seguridad de Google), **no** como
remitente de cobros recurrentes. No hay correos de cobro, factura ni pasarela
asociados a `chatex.ai` en la ventana auditada.

### 2.6 Bajas automáticas disponibles

- **41 remitentes** con cabecera `List-Unsubscribe` (250 correos).
- De ellos, **39 con baja *one-click* (RFC 8058)** vía `POST`.
- **64 remitentes sin cabecera de baja** (323 correos) → requerirían baja manual.

---

## 3. Bitácora de acciones ejecutadas

### 3.1 Infraestructura (completado)

| # | Acción | Resultado |
|---:|---|---|
| 1 | Instalación `imap-mcp-server@2.2.0` (fuera del repo) | ✅ |
| 2 | Registro MCP `imap` en `.opencode/opencode.json` | ✅ |
| 3 | Alta de 2 casillas en `~/.imap-mcp/accounts.json` | ✅ |
| 4 | Launcher `tools/imap-mcp/launch.mjs` + READ-ONLY | ✅ |
| 5 | CLI `packages/mail-cleanup` (4 subcomandos) | ✅ |
| 6 | Build + **9/9 tests** | ✅ |
| 7 | Corrección TLS `--use-system-ca` (CLI + MCP) | ✅ |
| 8 | Credencial de `eduardoesper75` cargada en `.env.local` | ✅ |

### 3.2 Auditoría ejecutada (solo lectura)

```
$ pnpm --filter @gws/mail-cleanup start audit --days 365 --top 50
⚠ Sin contraseña en el entorno para: ESPER_EDUARDO
• Auditando eduardoesper75@gmail.com (INBOX, 365d)…
  573 mensajes analizados (total en carpeta: 718)
✔ Informe: docs/outreach/herramientas/GWS_Reporte_Ranking_Correo.md
✔ Datos:   data/mail-cleanup/audit-2026-10-16T05-44-20.json
  Remitentes distintos: 105
```

### 3.3 Acciones sobre el correo (ninguna)

| Acción | Cantidad |
|---|---:|
| Sesiones IMAP autenticadas (auditoría) | 1 (eduardoesper75) |
| Bajas vía `List-Unsubscribe` / RFC 8058 | **0** |
| Bajas vía `mailto:` | **0** |
| Correos movidos a `Trash` | **0** |
| Correos eliminados | **0** |

> **Ninguna suscripción fue dada de baja y ningún correo fue movido a la Papelera.**
> No se activó `--apply`; sin aprobación previa no habrá ninguna acción destructiva.

### 3.4 Excepciones / errores que requieren intervención manual

| # | Excepción | Impacto | Acción requerida |
|---:|---|---|---|
| 1 | Falta app password de `esper.eduardo` | Su INBOX (2ª casilla) queda sin auditar | Crear app password en esa cuenta y añadirla a `.env.local` |
| 2 | Avast Mail Shield intercepta TLS | Requiere `--use-system-ca` para conectar | Ya aplicado; alternativa: excluir `node.exe` del escaneo |

---

## 4. Revisión y convalidación (Aprobar / Cancelar)

**Nada se ejecutará sin tu aprobación explícita.** Selección propuesta para revisar:

| Grupo | Criterio | Remitentes |
|---|---|---|
| A — Boletines con baja *one-click* | Ruido recurrente, baja limpia por RFC 8058 | `info@arcap.org`, `no-reply@trs.donweb.com` |
| B — Notificaciones técnicas con one-click | Muy frecuentes | `list@wordfence.com` (54), `talleres@mkt.donweb.com` (23), `nvidia.com`, `linkedin.com`, `simonsquibb.com`, `neon.tech`, `openrouter.ai`, `moonshot.ai`, `facebookmail.com`, `langfuse.com` |
| C — Cobros/pasarelas | **Revisar caso por caso** (varios son transaccionales/legítimos) | `googleplay-noreply@google.com`, `cloudplatform-noreply@google.com`, `stripe.com` (Lummi), `mercadopago.com` |
| D — Conservar | Cuenta propia y servicios activos | `wordpress@glassworldstudio.com.ar`, `noreply@github.com`, `noreply-accounts@google.com` |

Comandos (se ejecutan **solo** tras tu "Permitir"):

```powershell
# Fase 3 · Bajas (dry-run; añadir --apply tras aprobar)
pnpm --filter @gws/mail-cleanup start unsubscribe --senders dominio1.com,dominio2.com

# Fase 4 · Purga a Trash (nunca permanente; exige --apply --yes)
pnpm --filter @gws/mail-cleanup start purge --senders dominio1.com,dominio2.com --apply --yes
```

### Pasos para completar la 2ª casilla

1. Crear app password en <https://myaccount.google.com/apppasswords> **dentro de
   `esper.eduardo@gmail.com`** (las de aplicación son por cuenta).
2. Añadirla a `.env.local` en `IMAP_MCP_ACCOUNT_ESPER_EDUARDO_IMAP_PASSWORD`.
3. Re-ejecutar `audit --days 365 --top 50` para auditar ambas casillas.

---

## Anexo — Archivos relevantes

| Archivo | Rol |
|---|---|
| `data/mail-cleanup/audit-2026-10-16T05-44-20.json` | Datos crudos de la auditoría (PII; en `.gitignore`) |
| `docs/outreach/herramientas/GWS_Reporte_Ranking_Correo.md` | Ranking auto-generado (Top 50) |
| `tools/imap-mcp/launch.mjs` | Launcher MCP (env + READ-ONLY + TLS del sistema) |
| `.opencode/opencode.json` | Registro del MCP `imap` |
| `packages/mail-cleanup/src/*` | CLI (auditoría, bajas, purga) |
| `~/.imap-mcp/accounts.json` | Casillas (sin secretos) |

---

**Contacto oficial**
Eduardo Esper
Fundador — Glass World Studio
E-mail: esper.eduardo@gmail.com
Teléfono / WhatsApp: +54 9 385 582-6289
Santiago del Estero, República Argentina
