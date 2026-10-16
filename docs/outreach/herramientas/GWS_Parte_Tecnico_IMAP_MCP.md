# Parte técnico — Auditoría y purga de correo (IMAP / MCP)

> **Estado:** ✅ **AUDITORÍA COMPLETA (modo solo lectura) — 2/2 casillas.**
> **No se ejecutó ninguna baja ni se movió ningún correo a `Trash`**
> (0 bajas · 0 movidos · 0 eliminados). Todo queda a la espera de tu
> aprobación explícita (§4).
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
| Bajas ejecutadas (`List-Unsubscribe` / RFC 8058) | **0** |
| Correos movidos a `Trash` | **0** |
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
| eduardoesper75 | `<REDACTED>` | ✅ login IMAP OK |
| esper.eduardo | `<REDACTED>` | ✅ login IMAP OK |

Antecedentes (contraseñas de **cuenta**, no de aplicación): `Esperglass75` es válida
en ambas casillas pero Gmail la rechaza por IMAP (*Application-specific password
required*); `Esperglass.75` es inválida. **Las contraseñas de aplicación son por
cuenta** y ambas quedaron cargadas en `.env.local` (no versionado).

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
| Bajas vía `List-Unsubscribe` / RFC 8058 | **0** |
| Bajas vía `mailto:` | **0** |
| Correos movidos a `Trash` | **0** |
| Correos eliminados | **0** |

> **Ninguna suscripción fue dada de baja y ningún correo fue movido a la Papelera.**
> No se activó `--apply`. Sin aprobación previa no habrá ninguna acción destructiva.

### 3.4 Excepciones / errores

**Ninguna pendiente.** La intercepción TLS de Avast quedó resuelta (§1.4) y ambas
credenciales validan correctamente. La lista interna de dominios de spam del MCP
(50 dominios) no registró coincidencias en el correo auditado.

---

## 4. Revisión y convalidación (Aprobar / Cancelar)

**Nada se ejecutará sin tu aprobación explícita.** Grupos propuestos:

| Grupo | Criterio | Remitentes propuestos |
|---|---|---|
| **A — Boletines/promos** | Ruido informativo, baja *one-click* limpia | `support@cinko.io` (32), `info@arcap.org` (18), `promociones@brubank.com` (15), `newsletter@mailing.sporting.com.ar` (4) |
| **B — Marketing masivo con one-click** | Altísimo volumen no esencial | `email@market.temuemail.com` (130), `list@wordfence.com` (54), `talleres@mkt.donweb.com` (23), Binance (59: `smailer1/2`, `ses`), `info@subscribe.bcgame.ad` (13), `nvidia.com` (13), `facebookmail.com` (16), `linkedin.com` (13), `team@info.sololearn.com` (10), `novedades.uala.com.ar` (9), `brubank.com` (invertir/newsletter, 22) |
| **C — Cobros/financiero (revisar caso por caso)** | Muchos son transaccionales/legítimos | `info.naranjax.com` (84), `mailing.bna.com.ar` (46), `paypal.com.ar` (9), `stripe.com` (11), `mercadopago.com`, `googleplay/cloud/google payments`, `coinbase`, `pagostad.gob.ar` |
| **D — Conservar** | Cuenta propia y servicios activos | `wordpress@glassworldstudio.com.ar` (31), `noreply@github.com` (17), `noreply-accounts@google.com` (45), `no-reply@accounts.google.com` (33) |

Comandos (se ejecutan **solo** tras tu "Permitir"):

```powershell
# Fase 3 · Bajas (dry-run; añadir --apply tras aprobar)
pnpm --filter @gws/mail-cleanup start unsubscribe --senders dominio1.com,dominio2.com

# Fase 4 · Purga a Trash (nunca permanente; exige --apply --yes)
pnpm --filter @gws/mail-cleanup start purge --senders dominio1.com,dominio2.com --apply --yes
```

> Nota: `hello@notify.railway.app` (62) y `workspace@…donweb` son notificaciones
> técnicas; conviene decidir explícitamente si entran en A/B o en D.

---

## Anexo — Archivos relevantes

| Archivo | Rol |
|---|---|
| `data/mail-cleanup/audit-2026-10-16T06-12-15.json` | Datos crudos del escaneo (PII; en `.gitignore`) |
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
