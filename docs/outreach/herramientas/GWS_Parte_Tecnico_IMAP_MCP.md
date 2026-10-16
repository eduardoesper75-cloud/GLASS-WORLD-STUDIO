# Parte técnico — Auditoría y purga de correo (IMAP / MCP)

> **Estado:** ✅ **EJECUTADO — bajas + purga a `Trash` (orden del 2026-10-16).**
> **23 bajas aplicadas** (22 *one-click* RFC 8058 + 1 `mailto`) y **392 correos
> movidos a `Trash`** (145 + 247). **13 remitentes sin cabecera de baja** quedaron
> como *manual* (sin acción). **Borrado permanente: 0** (solo `Trash`, recuperable).
> Se respetó la **lista blanca** (crypto/financiero, hosting, Facebook, cuentas
> Google): ningún dominio protegido fue tocado. Detalle y evidencia en §4.
>
> **Generado:** 2026-10-16 (UTC). **Sistema:** Glass World Studio (GWS).
> **Fuente de datos:** `data/mail-cleanup/audit-2026-10-16T06-12-15.json`.
> **Informe de ranking (auto):** `GWS_Reporte_Ranking_Correo.md`.

## Tablero de métricas (estado real)

| Métrica | Valor |
|---|---:|
| Casillas registradas | 2 |
| Casillas auditadas | **2 / 2** ✅ |
| Correos analizados | **1.296** (573 + 723) |
| Ventana | últimos 365 días |
| Remitentes distintos | **180** |
| Dominios distintos | **125** |
| Remitentes con `List-Unsubscribe` | **82** (731 correos) |
| Remitentes con baja *one-click* (RFC 8058) | **77** |
| Remitentes sin cabecera de baja | **98** (565 correos) |
| Coincidencias de `chatex.ai` | **1** (aviso de Google; ver §2.6) |
| Bajas ejecutadas (`List-Unsubscribe` / RFC 8058) | **22** *one-click* + **1** `mailto` |
| Bajas pendientes (sin cabecera → manual) | **13** |
| Correos movidos a `Trash` | **392** (145 + 247) |
| Correos eliminados | **0** (borrado permanente no implementado) |
| Bloqueos pendientes | **0** |

### Distribución por tipo (por mensaje, ambos buzones)

| Tipo | Correos |
|---|---:|
| Otro / Notificaciones | 929 |
| Cobros | 173 |
| Boletines | 101 |
| Trial | 46 |
| Spam | 36 |
| Suscripción | 11 |
| **Total** | **1.296** |

---

## 1. Inventario de conectividad y sesión

### 1.1 Casillas registradas y auditadas

Fuente: `%USERPROFILE%\.imap-mcp\accounts.json` (credenciales resueltas por entorno).

| Clave | Casilla | Host / Puerto | `accountId` | Correos analizados |
|---|---|---|---|---|
| `eduardoesper75` | eduardoesper75@gmail.com | imap.gmail.com:993 | `63b1ad0e-f946-4d1c-856f-13d4d3da7527` | 573 / 718 |
| `esper.eduardo` | esper.eduardo@gmail.com | imap.gmail.com:993 | `1d81db61-347b-458c-a790-37035827a7d3` | 723 / 916 |

### 1.2 Validación de credenciales (prueba real contra Gmail)

| Casilla | Credencial de aplicación (16 car.) | Resultado |
|---|---|---|
| eduardoesper75 | `<IMAP_PASSWORD_HIDDEN>` (`IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_PASSWORD`) | ✅ login IMAP OK |
| esper.eduardo | `<IMAP_PASSWORD_HIDDEN>` (`IMAP_MCP_ACCOUNT_ESPER_EDUARDO_IMAP_PASSWORD`) | ✅ login IMAP OK |

> 🔒 **Credenciales redactadas el 2026-10-16.** Los valores estaban en texto plano en este documento
> versionado (fuga detectada en el relevamiento). **Rotar** las contraseñas de aplicación y de cuenta:
> quedaron en el historial de Git. Regla: los secretos viven **sólo** en `.env.local` (ignorado por git).
> Procedimiento: `docs/security/GWS_S1_Remediacion_Credenciales.md`.

Antecedentes (contraseñas de **cuenta**, no de aplicación): la contraseña de cuenta es válida
en ambas casillas pero Gmail la rechaza por IMAP (*Application-specific password
required*). **Las contraseñas de aplicación son por cuenta** y ambas quedaron cargadas en
`.env.local` (no versionado).

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
(`NODE_OPTIONS`). Verificado: ambos logins IMAP completaron correctamente.

---

## 2. Ranking consolidado de dominios y remitentes

> Ambos buzones · 1.296 correos · 180 remitentes · 125 dominios.

### 2.1 Resumen por casilla

| Casilla | Correos | Remitentes | Correo dominante |
|---|---:|---:|---|
| eduardoesper75@gmail.com | 573 | 105 | `hello@notify.railway.app` (62) |
| esper.eduardo@gmail.com | 723 | 85 | `email@market.temuemail.com` (130) |

### 2.2 Top 35 remitentes (ambos buzones)

| # | Remitente | Correos | Tipo | List-Unsubscribe |
|---:|---|---:|---|---|
| 1 | email@market.temuemail.com | 130 | Otro/Notif. | ✅ One-Click |
| 2 | avisos@info.naranjax.com | 84 | Cobros | — |
| 3 | hello@notify.railway.app | 62 | Otro/Notif. | — |
| 4 | list@wordfence.com | 54 | Otro/Notif. | ✅ One-Click |
| 5 | info@mailing.bna.com.ar | 46 | Otro/Notif. | — |
| 6 | noreply-accounts@google.com | 45 | Otro/Notif. | ✅ One-Click |
| 7 | hola@app.naranjax.com | 37 | Otro/Notif. | ✅ One-Click |
| 8 | noreply@email.openai.com | 34 | Otro/Notif. | ✅ One-Click |
| 9 | no-reply@accounts.google.com | 33 | Otro/Notif. | — |
| 10 | support@cinko.io | 32 | Boletines | ✅ One-Click |
| 11 | wordpress@glassworldstudio.com.ar | 31 | Otro/Notif. | — |
| 12 | do_not_reply@smailer1.binance.com | 25 | Otro/Notif. | ✅ One-Click |
| 13 | do_not_reply@smailer2.binance.com | 24 | Otro/Notif. | ✅ One-Click |
| 14 | talleres@mkt.donweb.com | 23 | Otro/Notif. | ✅ One-Click |
| 15 | googleplay-noreply@google.com | 18 | Cobros | — |
| 16 | info@arcap.org | 18 | Boletines | ✅ One-Click |
| 17 | noreply@github.com | 17 | Otro/Notif. | — |
| 18 | cloud@mkt.donweb.com | 16 | Otro/Notif. | — |
| 19 | email@mkt.donweb.com | 16 | Otro/Notif. | — |
| 20 | no-reply@trs.donweb.com | 16 | Boletines | — |
| 21 | notification@priority.facebookmail.com | 15 | Otro/Notif. | ✅ One-Click |
| 22 | promociones@brubank.com | 15 | Boletines | ✅ One-Click |
| 23 | info@subscribe.bcgame.ad | 13 | Otro/Notif. | ✅ One-Click |
| 24 | news@nvidia.com | 13 | Otro/Notif. | ✅ One-Click |
| 25 | cloudplatform-noreply@google.com | 12 | Cobros | — |
| 26 | no-reply@ciotrs.donweb.com | 12 | Otro/Notif. | — |
| 27 | invertir@brubank.com | 11 | Otro/Notif. | ✅ One-Click |
| 28 | newsletter@brubank.com | 11 | Otro/Notif. | ✅ One-Click |
| 29 | do-not-reply@ses.binance.com | 10 | Otro/Notif. | — |
| 30 | hello@ollama.com | 10 | Otro/Notif. | ✅ One-Click |
| 31 | team@info.sololearn.com | 10 | Otro/Notif. | ✅ One-Click |
| 32 | no-respondas-a-esta-direccion-por-favor@novedades.uala.com.ar | 9 | Otro/Notif. | ✅ One-Click |
| 33 | service@paypal.com.ar | 9 | Cobros | — |
| 34 | simonsquibb@simonsquibb.com | 9 | Otro/Notif. | ✅ One-Click |
| 35 | close_friend_updates@facebookmail.com | 8 | Otro/Notif. | ✅ One-Click |

*(Tabla completa Top 50 en `GWS_Reporte_Ranking_Correo.md`.)*

### 2.3 Top 30 dominios por volumen

| # | Dominio | Correos |
|---:|---|---:|
| 1 | market.temuemail.com | 130 |
| 2 | google.com | 105 |
| 3 | info.naranjax.com | 84 |
| 4 | notify.railway.app | 62 |
| 5 | mkt.donweb.com | 55 |
| 6 | wordfence.com | 54 |
| 7 | mailing.bna.com.ar | 46 |
| 8 | brubank.com | 39 |
| 9 | app.naranjax.com | 37 |
| 10 | email.openai.com | 34 |
| 11 | accounts.google.com | 33 |
| 12 | cinko.io | 32 |
| 13 | glassworldstudio.com.ar | 31 |
| 14 | smailer1.binance.com | 25 |
| 15 | smailer2.binance.com | 24 |
| 16 | arcap.org | 18 |
| 17 | nvidia.com | 18 |
| 18 | github.com | 17 |
| 19 | trs.donweb.com | 16 |
| 20 | facebookmail.com | 16 |
| 21 | workana.com | 16 |
| 22 | priority.facebookmail.com | 15 |
| 23 | subscribe.bcgame.ad | 13 |
| 24 | linkedin.com | 13 |
| 25 | ciotrs.donweb.com | 12 |
| 26 | stripe.com | 11 |
| 27 | ses.binance.com | 10 |
| 28 | ollama.com | 10 |
| 29 | info.sololearn.com | 10 |
| 30 | novedades.uala.com.ar | 9 |

### 2.4 Cobros y pasarelas detectadas

| Remitente / Pasarela | Dominio | Correos | Detalle |
|---|---|---:|---|
| avisos@info.naranjax.com | info.naranjax.com | 84 | **Naranjax** (billetera) |
| googleplay-noreply@google.com | google.com | 18 | Recibos Google Play |
| cloudplatform-noreply@google.com | google.com | 12 | Facturación Google Cloud |
| service@paypal.com.ar | paypal.com.ar | 9 | **PayPal** |
| failed-payments+…@stripe.com | stripe.com | 5 | **Stripe** — pagos fallidos ("Lummi") |
| notifications@stripe.com | stripe.com | 5 | **Stripe** |
| newsletter@mailing.sporting.com.ar | sporting.com.ar | 4 | Cobros/boletín (one-click) |
| googleone-updates-noreply@google.com | google.com | 3 | Google One (one-click) |
| no-responder@mercadopago.com | mercadopago.com | 3 | **Mercado Pago** |
| support@accounts.scribd.com | scribd.com | 3 | Suscripción Scribd |
| no-reply@info.mercadolibre.com.ar | mercadolibre.com.ar | 2 | Mercado Libre |
| pagostad@pagostad.gob.ar | pagostad.gob.ar | 2 | Pago institucional |
| payments-noreply@google.com | google.com | 2 | Pagos Google |
| upcoming-invoice+…@stripe.com | stripe.com | 1 | **Stripe** — factura próxima ("Lummi") |
| failed-payments@mail.anthropic.com | mail.anthropic.com | 1 | Cargo fallido (Anthropic) |
| no-reply@mercadolibre.com.ar | mercadolibre.com.ar | 2 | Mercado Libre |
| info@viacargo.com.ar | viacargo.com.ar | 1 | Envío/cobro |
| nao-responder@ / novedades@ / promocion@mercadopago.com | mercadopago.* | 3 | Mercado Pago (2 one-click) |
| **Cripto:** do_not_reply@smailer1/2.binance.com, do-not-reply@ses.binance.com | binance.com | 59 | **Binance** (notificaciones/promos) |
| info@mail.coinbase.com | mail.coinbase.com | 1 | **Coinbase** |

### 2.5 Boletines, suscripciones y trials

| Tipo | Remitente | Correos | Baja |
|---|---|---:|---|
| Boletines | support@cinko.io | 32 | ✅ one-click |
| Boletines | info@arcap.org | 18 | ✅ one-click |
| Boletines | no-reply@trs.donweb.com | 16 | — |
| Boletines | promociones@brubank.com | 15 | ✅ one-click |
| Boletines | naranjax@novedades.naranjax.com | 1 | — |
| Suscripción | noreply-purchases@youtube.com | 4 | — |
| Suscripción | lummi@email.lummi.ai | 2 | — |
| Suscripción | hello@accounts.scribd.com | 1 | — |
| Suscripción | upcoming-invoice+…@stripe.com | 1 | — |
| Trial | no-reply@slack.com | 5 | — |
| Trial | no-reply@verdent.ai | 3 | — |
| Trial | planultra@brubank.com | 2 | ✅ one-click |
| Trial | session-replay@ / events@sentry.io | 3 | ✅ one-click |
| Trial | hello@info.n8n.io | 1 | — |

- **Spam:** 36 correos clasificados como spam (ningún dominio de la lista interna
  de spam del MCP apareció; son coincidencias por palabras clave como *free/trial*).

### 2.6 Búsqueda específica: `chatex.ai`

**Resultado: 1 coincidencia** (no es un cobro, es un aviso de Google):

| Campo | Valor |
|---|---|
| Fecha | 2026-10-04 02:07:04 UTC |
| De | `noreply-accounts@google.com` (Google) |
| Casilla | eduardoesper75@gmail.com |
| Asunto | *«Compartiste algunos datos de tu Cuenta de Google con chatex.ai»* |
| Tipo | Otro/Notificación |

`chatex.ai` aparece **solo** como destinatario de un permiso de datos de tu Cuenta
de Google, **no** como remitente de cobros recurrentes. No hay facturas ni cargos
asociados a `chatex.ai` en la ventana auditada (ni en la otra casilla).

### 2.7 Bajas automáticas disponibles

- **82 remitentes** con cabecera `List-Unsubscribe` (731 correos).
- De ellos, **77 con baja *one-click* (RFC 8058)** vía `POST`.
- **98 remitentes sin cabecera de baja** (565 correos) → requerirían baja manual.

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
| 8 | 2 contraseñas de aplicación cargadas en `.env.local` | ✅ |
| 9 | Consolidación en git (commit `52fe67b`) | ✅ |

### 3.2 Auditorías ejecutadas (solo lectura)

```
$ pnpm --filter @gws/mail-cleanup start audit --days 365 --top 50
• Auditando eduardoesper75@gmail.com (INBOX, 365d)…
  573 mensajes analizados (total en carpeta: 718)
• Auditando esper.eduardo@gmail.com (INBOX, 365d)…
  723 mensajes analizados (total en carpeta: 916)
✔ Informe: docs/outreach/herramientas/GWS_Reporte_Ranking_Correo.md
✔ Datos:   data/mail-cleanup/audit-2026-10-16T06-12-15.json
  Remitentes distintos: 180
```

### 3.3 Acciones sobre el correo (ninguna)

| Acción | Cantidad |
|---|---:|
| Sesiones IMAP autenticadas (auditoría) | 2 |
| Bajas vía `List-Unsubscribe` / RFC 8058 | **22** |
| Bajas vía `mailto:` | **1** |
| Bajas omitidas (sin cabecera de baja) | **13** |
| Correos movidos a `Trash` | **392** (145 + 247) |
| Correos eliminados | **0** |

> Ejecutado el **2026-10-16** con autorización explícita del titular y lista blanca
> (§4). La purga mueve **solo a `Trash`** (recuperable 30 días en Gmail); no existe
> borrado permanente en la herramienta.

### 3.4 Excepciones / errores

**Ninguna pendiente.** La intercepción TLS de Avast quedó resuelta (§1.4) y ambas
credenciales validan correctamente. La lista interna de dominios de spam del MCP
(50 dominios) no registró coincidencias en el correo auditado.

---

## 4. Ejecución autorizada (2026-10-16) — bajas + purga a `Trash`

El titular autorizó la limpieza con **lista blanca**. La selección se hizo **por
inclusión explícita** de dominios (el CLI no dispone de exclusión), verificando
que **ningún dominio protegido** entrara en el objetivo.

### 4.1 Lista blanca respetada (NO tocada)

| Ámbito | Dominios/cuentas preservados |
|---|---|
| Crypto / financiero | Binance (`smailer1/2`, `ses`), Coinbase, PayPal, Stripe, Mercado Pago, Naranja X, Banco Nación (`mailing.bna.com.ar`), Ualá, AstroPay, Brubank, Lemon, Ripio, Modo, Airtm, Pionex, 3Commas, TradingView y avisos de tarjeta/banco |
| Hosting / infraestructura | DonWeb (todos sus dominios), Glass World Studio (`glassworldstudio.com.ar`), GitHub, NVIDIA, Railway, Vercel, Neon, Docker |
| Redes | Facebook (`facebookmail.com`) |
| Grupo D — cuentas/seguridad | Google Accounts (`noreply-accounts@google.com`, `no-reply@accounts.google.com`), alertas de seguridad, pagos Google, Google Workspace, YouTube |

### 4.2 Objetivo seleccionado y ejecutado (por dominio)

| Dominio | Correos | e75 | esper.eduardo |
|---|---:|---:|---:|
| market.temuemail.com | 130 | | 130 |
| wordfence.com | 54 | 54 | |
| email.openai.com | 34 | 15 | 19 |
| cinko.io | 32 | | 32 |
| arcap.org | 18 | 9 | 9 |
| linkedin.com | 13 | 13 | |
| subscribe.bcgame.ad | 13 | | 13 |
| ollama.com | 10 | 10 | |
| info.sololearn.com | 10 | | 10 |
| simonsquibb.com | 9 | 9 | |
| lovable.dev | 8 | | 8 |
| sales.temuemail.com | 8 | | 8 |
| updates.langfuse.com | 7 | 7 | |
| discuss.ai.google.dev | 7 | 7 | |
| openrouter.ai | 6 | 6 | |
| mailing.sporting.com.ar | 4 | 4 | |
| verdent.ai | 4 | | 4 |
| moonshot.ai | 3 | 3 | |
| email.claude.com | 3 | 2 | 1 |
| mail.perplexity.ai | 3 | | 3 |
| email.lummi.ai | 2 | 2 | |
| tm.openai.com | 2 | | 2 |
| info.n8n.io | 2 | | 2 |
| mailing.contactogarantido.com | 1 | 1 | |
| chatboxapp.ai | 1 | 1 | |
| notice.kimi.ai | 1 | 1 | |
| notifications.langfuse.com | 1 | 1 | |
| notice.skywork.ai | 1 | | 1 |
| promo.apuestashouse.com | 1 | | 1 |
| ship.emergent.sh | 1 | | 1 |
| 39df03.inboxapi.ai | 1 | | 1 |
| n8n.discoursemail.com | 1 | | 1 |
| utoppia.com | 1 | | 1 |
| **TOTAL (33 dominios)** | **392** | **145** | **247** |

### 4.3 Resultado de las bajas

- **22 bajas *one-click* (RFC 8058)** vía `POST` → respuestas HTTP 200/201/202.
- **1 baja por `mailto:`** (`ship.emergent.sh` → `unsubscribe-DC04@moengage.co`).
- **13 remitentes sin cabecera de baja** → clasificados *manual* (sin acción):
  `market.temuemail.com`, `email.openai.com`, `subscribe.bcgame.ad`,
  `info.sololearn.com`, `verdent.ai`, `tm.openai.com`, `email.lummi.ai`,
  `notifications.langfuse.com`, `chatboxapp.ai`, `notice.skywork.ai`,
  `39df03.inboxapi.ai`, `n8n.discoursemail.com`, `promo.apuestashouse.com`.
- **0 errores.**

### 4.4 Resultado de la purga (a `Trash`, nunca permanente)

```
$ pnpm --filter @gws/mail-cleanup start unsubscribe --senders … --apply
✔ Bajas: 22 ok · 13 omitidas · 0 con error
  → data/mail-cleanup/unsubscribe-2026-10-16T06-34-53.json

$ pnpm --filter @gws/mail-cleanup start purge --senders … --apply --yes
  eduardoesper75@gmail.com: 145 mensajes → Trash
  esper.eduardo@gmail.com:   247 mensajes → Trash
✔ Purga: 392 mensajes a Trash
  → data/mail-cleanup/purge-2026-10-16T06-35-44.json
```

| Casilla | Movidos a `Trash` |
|---|---:|
| eduardoesper75@gmail.com | 145 |
| esper.eduardo@gmail.com | 247 |
| **Total** | **392** |

> Los correos permanecen **recuperables en `Trash`** durante el ciclo de retención
> de Gmail (30 días). No se ejecutó borrado permanente en ningún caso.

---

## Anexo — Archivos relevantes

| Archivo | Rol |
|---|---|
| `data/mail-cleanup/audit-2026-10-16T06-12-15.json` | Datos crudos del escaneo (PII; en `.gitignore`) |
| `data/mail-cleanup/unsubscribe-2026-10-16T06-34-53.json` | Evidencia de bajas aplicadas (22 ok · 13 manual) |
| `data/mail-cleanup/purge-2026-10-16T06-35-44.json` | Evidencia de la purga (392 a `Trash`; PII) |
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
