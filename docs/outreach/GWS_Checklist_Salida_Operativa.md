# CHECKLIST DE SALIDA OPERATIVA — Glass World Studio

> **Glass World Studio (GWS) busca Alianzas Estratégicas: Inversores, Desarrolladores y Logística.**
> Orden de prioridad: 1) Inversores y capital · 2) Desarrolladores · 3) Logística (pilar operativo).
>
> Pendientes técnicos para dejar la máquina de outreach **lista para enviar** y el sitio
> **publicando el contacto oficial**. Ejecutar en orden.
> Contacto oficial: **Eduardo Esper · edu.esper@glassworldstudio.com.ar · +54 9 385 622-8400**.

---

## 1. Credenciales del emisor (casilla institucional en Don Web/Ferozo)

> La casilla institucional **`edu.esper@glassworldstudio.com.ar`** corre en el hosting
> **Don Web/Ferozo** (SPF del dominio: `include:comp.hostmar.com`), **no en Google**.
> Se autentica con la contraseña de la casilla y el servidor de correo del propio dominio.
> Los secretos viven sólo en tu `.env`, nunca en el repo.

**Datos de conexión del dominio** (verificados por DNS y prueba de puertos):

| Protocolo | Servidor | Puerto | Cifrado |
|---|---|---|---|
| SMTP (saliente) | `mail.glassworldstudio.com.ar` | `465` | SSL/TLS |
| SMTP (saliente, alterno) | `mail.glassworldstudio.com.ar` | `587` | STARTTLS |
| IMAP (entrante) | `mail.glassworldstudio.com.ar` | `993` | SSL/TLS |

- **Usuario:** la dirección completa (`edu.esper@glassworldstudio.com.ar`).
- **Contraseña:** la de la casilla (definida en el panel). Es lo único que falta cargar.
- **Puerto `25`:** no usar. Don Web lo bloquea para conexiones desde IPs dinámicas y no
  está pensado para clientes de correo; usá siempre `465` (SSL) o `587` (STARTTLS).
- Si hace falta reconfirmar los datos: panel → **Mi cuenta → Servicios → Gestionar → Correos →
  Datos de Configuración** (o en Ferozo: **Email → Cuentas → ícono de información**).

> ⚠️ **No** uses `smtp.gmail.com` / `imap.gmail.com` con esta casilla: el dominio institucional
> no es de Google. Si preferís enviar por Gmail, el emisor debe ser el canal secundario
> `eduardoesper75@gmail.com` con una contraseña de aplicación de Google.

### Seteo en el `.env` de OpenOutreach

Archivo (fuera del repo, con secretos reales):

```
C:\Users\eduesper\AppData\Local\gws-tools\openoutreach\.env
```

| Variable | Valor |
|---|---|
| `OUTSEND_MAILBOX_ADDRESS` | `edu.esper@glassworldstudio.com.ar` |
| `OUTSEND_MAILBOX_PASSWORD` | *(contraseña de la casilla en Don Web)* |
| `OUTSEND_SMTP_HOST` | `mail.glassworldstudio.com.ar` |
| `OUTSEND_SMTP_PORT` | `465` (SSL/TLS) |
| `OUTSEND_IMAP_HOST` | `mail.glassworldstudio.com.ar` |
| `OUTSEND_IMAP_PORT` | `993` (SSL/TLS) |

> `OUTSEND_MAILBOX_ADDRESS` y los hosts/puertos ya quedaron fijados; **falta sólo
> `OUTSEND_MAILBOX_PASSWORD`** (la contraseña de la casilla institucional).

### Verificación

```powershell
# desde la carpeta del runner (gws-context)
powershell -NoProfile -ExecutionPolicy Bypass -File gws-context/run.ps1 status
```

Debe reportar la casilla autenticada. Si falla, revisá que la contraseña de la casilla sea
correcta y que el correo esté habilitado en el panel de Don Web.

---

## 2. Redeploy del sitio (publicar el contacto corregido)

- Proyecto Vercel: **`glass-world-studio`** · `projectId prj_N5Jqbk4LKG9TVxVf4fSQgXPN7PH9`
- `rootDirectory = apps/web`. El `buildCommand` ya está en `apps/web/vercel.json`.
- El repo **no tiene remoto Git** → no hay auto-deploy: se publica a mano con el CLI.

```powershell
# 1) desde la raíz del repo
cd "C:\Users\eduesper\Documents\Proyecto predeterminado"

# 2) (una sola vez) vincular el proyecto si no lo está
npx vercel link
#    -> elegir el proyecto: glass-world-studio (org eduardoesper75-4497)

# 3) build + deploy a producción
pnpm install --frozen-lockfile
npx vercel --prod
```

> ⚠️ `vercel --prod` publica el **working tree** (incluye archivos sin commitear). Si no querés
> publicar trabajo en curso, guardalo antes: `git stash push -u` → deploy → `git stash pop`.

### Verificación post-deploy

```powershell
# la home y los anuncios deben mostrar el contacto oficial
curl.exe -s https://glass-world-studio.vercel.app | Select-String "edu.esper@glassworldstudio.com.ar"
curl.exe -s https://glass-world-studio.vercel.app | Select-String "385 622-8400"
```

> Confirmar que el sitio publicado muestre los canales oficiales —`edu.esper@glassworldstudio.com.ar`
> (primario), `eduardoesper75@gmail.com` (secundario), `+54 9 385 622-8400` y
> <https://www.glassworldstudio.com.ar>— y **ninguna** ocurrencia de un correo viejo.
>
> **Dominio oficial público:** <https://www.glassworldstudio.com.ar> (landing: ecosistema, INPI y contacto).
> El deploy de este repo (`glass-world-studio.vercel.app`) sirve además las rutas `/novedades/*`.

---

## 3. Orden recomendado

1. **Password de aplicación** (paso 1) → desbloquea el envío por OpenOutreach.
2. **Redeploy** (paso 2) → publica el contacto correcto.
3. Enviar a mano (ver `docs/outreach/GWS_Reporte_Prospeccion_OpenWeb.md`):
   logística, inversores/institucionales y devs, **máximo 3 toques**.

---

## Guardarraíles

- **Nunca** commitear `.env` ni la contraseña de aplicación. Sólo `.env.example` sin valores.
- Los secretos viven sólo en el `.env` externo del runner.
- Envío **manual**, ritmo humano; nada de automatizar cuentas ni scrapear.
