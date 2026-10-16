# CHECKLIST DE SALIDA OPERATIVA — Glass World Studio

> **Glass World Studio (GWS) busca Alianzas Estratégicas: Inversores, Desarrolladores y Logística.**
> Orden de prioridad: 1) Inversores y capital · 2) Desarrolladores · 3) Logística (pilar operativo).
>
> Pendientes técnicos para dejar la máquina de outreach **lista para enviar** y el sitio
> **publicando el contacto oficial**. Ejecutar en orden.
> Contacto oficial: **Eduardo Esper · esper.eduardo@gmail.com · +54 9 385 582-6289**.

---

## 1. Password de aplicación de Google (para `esper.eduardo@gmail.com`)

> Google ya no acepta la contraseña normal para SMTP/IMAP: hay que generar una
> **contraseña de aplicación** (16 caracteres). Vive sólo en tu `.env`, nunca en el repo.

1. Ingresá a la cuenta **esper.eduardo@gmail.com**.
2. Verificá que la **verificación en dos pasos (2FA)** esté activa
   (`https://myaccount.google.com/security`). Sin 2FA no hay contraseñas de aplicación.
3. Creá la contraseña de aplicación: `https://myaccount.google.com/apppasswords`
   - Nombre sugerido: **`GWS OpenOutreach`**
   - Google devuelve un código de **16 letras** (mostrado en 4 grupos). Copialo **sin espacios**.
4. Guardalo en el gestor de contraseñas. No lo pegues en ningún chat ni commit.

### Seteo en el `.env` de OpenOutreach

Archivo (fuera del repo, con secretos reales):

```
C:\Users\eduesper\AppData\Local\gws-tools\openoutreach\.env
```

Variables a completar/actualizar (sólo nombres; **los valores no se versionan**):

| Variable | Valor |
|---|---|
| `OUTSEND_MAILBOX_ADDRESS` | `esper.eduardo@gmail.com` |
| `OUTSEND_MAILBOX_PASSWORD` | *(la contraseña de aplicación del paso 3)* |
| `OUTSEND_SMTP_HOST` | `smtp.gmail.com` |
| `OUTSEND_SMTP_PORT` | `465` |
| `OUTSEND_IMAP_HOST` | `imap.gmail.com` |
| `OUTSEND_IMAP_PORT` | `993` |

> Si el runner espera otro proveedor SMTP/IMAP, ajustá host/puerto según corresponda.
> `OUTSEND_MAILBOX_ADDRESS` ya quedó en `esper.eduardo@gmail.com`; falta la contraseña.

### Verificación

```powershell
# desde la carpeta del runner (gws-context)
powershell -NoProfile -ExecutionPolicy Bypass -File gws-context/run.ps1 status
```

Debe reportar la casilla autenticada. Si falla, revisá que la contraseña de aplicación
no tenga espacios y que el 2FA siga activo.

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
curl.exe -s https://glass-world-studio.vercel.app | Select-String "esper.eduardo@gmail.com"
curl.exe -s https://glass-world-studio.vercel.app | Select-String "385 582-6289"
```

> Confirmar que **no** quede ninguna ocurrencia del correo viejo (`eduesper@gmail.com`)
> en el sitio publicado.
>
> **Dominio oficial público:** <https://glassworldstudio.com.ar> (landing: ecosistema, INPI y contacto).
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
