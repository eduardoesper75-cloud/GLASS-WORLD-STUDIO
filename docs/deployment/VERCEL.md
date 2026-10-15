# Despliegue público — Glass World Studio (Vercel)

> Última verificación: 15-10-2026 · `main` @ `be6f612` · Next.js 15.5.27 · pnpm 9 workspace

---

## 1. Configuración de proyecto en Vercel

| Parámetro | Valor | Por qué |
|---|---|---|
| **Root Directory** | `apps/web` | Es donde vive el proyecto Next.js. Vercel detecta el `pnpm-workspace.yaml` de la raíz y enlaza `@gws/schemas` y `@gws/taxonomy`. |
| **Framework** | Next.js (auto / `apps/web/vercel.json`) | Detectado por `next.config.mjs`. |
| **Package Manager** | `pnpm` (por el `packageManager` de la raíz) | `pnpm install --frozen-lockfile`. |
| **Node** | ≥ 20 (declarado en `engines`) | Vercel lo respeta. |
| **Install Command** | `pnpm install --frozen-lockfile` | Explícito en `apps/web/vercel.json`. |
| **Build Command** | `pnpm --filter @gws/schemas build && pnpm --filter @gws/taxonomy build && next build` | **Obligatorio.** Ver §2. |

### ⚠️ Por qué el build no es solo `next build`

`apps/web/next.config.mjs` declara `serverExternalPackages: ['@gws/schemas', '@gws/taxonomy']`.
Esos paquetes exportan `./dist/index.js` y `dist/` está en `.gitignore`, así que **no existen en el
repo**. Si `next build` corre sin compilarlos, la recopilación de datos de páginas falla al
resolver el motor. Por eso el build compila primero el motor (en orden topológico: `schemas`
antes que `taxonomy`, porque `taxonomy` depende de `schemas`).

Localmente el equivalente exacto del build de Vercel es:

```powershell
pnpm --filter @gws/schemas build
pnpm --filter @gws/taxonomy build
pnpm --filter @gws/web build
```

---

## 2. Variables de entorno (auditoría antes de desplegar)

### Hallazgo: el frontend no lee NINGUNA variable

- No existe **ningún** `process.env.*` en `apps/web`.
- No hay rutas de API (`src/app/**/route.ts` no existe) → la app es 100 % estática.
- Por lo tanto **no se requiere ninguna clave en Vercel hoy.**

Verificado con: `grep -r "process\.env" apps/` → sin coincidencias.

### 🔒 Las claves de OpenOutreach NO van al hosting

| Clave | Dónde vive realmente |
|---|---|
| `OPENOUTFIND_LLM_API_KEY` | `C:\Users\eduesper\AppData\Local\gws-tools\openoutreach\.env` |
| `OPENOUTFIND_BETTERCONTACT_API_KEY` | ídem |
| `OPENOUTFIND_APOLLO_API_KEY` | ídem |
| `OUTSEND_MAILBOX_PASSWORD` | ídem |
| `OUTSEND_SMTP_*` / `OUTSEND_IMAP_*` | ídem |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `YOUTUBE_API_KEY` | `.env` local en la raíz |

Motivos para mantenerlas **fuera** de Vercel:

1. **Nadie las leería.** OpenOutreach es una CLI de Python que corre en esta máquina; el sitio
   no tiene servidor que las consuma.
2. **Exposición de secretos.** El panel del hosting tiene un ámbito de acceso mucho más amplio
   que este equipo, y cualquier `NEXT_PUBLIC_*` viaja al navegador.
3. **Regla propia del proyecto:** *secretos sólo en `.env`, nunca en cliente y nunca en reposo.*

Plantilla auditable versionada: [`.env.production.example`](../../.env.production.example).
`.env.production` y `.vercel/` están ignorados por git.

---

## 3. Cabeceras de seguridad y caché

Se definen en **`apps/web/next.config.mjs` → `headers()`**, no en `vercel.json`, porque así se
aplican en cualquier hosting y son verificables localmente con `next start`:

| Cabecera | Valor |
|---|---|
| `Content-Security-Policy` | `default-src 'self'` + `script-src`/`style-src` con `'unsafe-inline'` (requerido por App Router), `object-src 'none'`, `frame-ancestors 'none'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` (sólo producción) |
| `Cache-Control` | `/_next/static/*` → `immutable, 1 año`; imágenes → `1 día` con `stale-while-revalidate` |

Vercel ya sirve `/_next/static` como inmutable; `headers()` lo hace explícito y portable.

---

## 4. Redirecciones de idioma — NO APLICA (y por qué)

**No hay redirecciones de idioma que configurar.** El sitio no segmenta el idioma por URL:
no existen `/es/...`, `/en/...`, etc. El idioma se aplica **en cliente** con un selector en
`localStorage` que sincroniza el `lang` y el título del documento, y persiste al navegar.

Configurar redirects de idioma (p. ej. `/` → `/es/`) rompería este modelo y duplicaría
contenido en buscidores sin `hreflang`. Si algún día se migra a locales por ruta, ese bloque
va en `redirects:` de `apps/web/vercel.json` junto con `hreflang`/`x-default`.

Lo único normalizable hoy (`trailingSlash: false`) ya está declarado en `vercel.json`.

---

## 5. Pasos de vinculación (acción manual de tu parte)

Todo lo que corre en local ya está preparado. Falta la autenticación, que es interactiva:

```powershell
# 1) Login (abre el navegador; elegí la cuenta y confirmá)
pnpm dlx vercel login

# 2) Vincular el directorio apps/web a un proyecto de Vercel
cd apps\web
pnpm dlx vercel link

# 3) Desplegar a producción
pnpm dlx vercel --prod
```

Opcionales:

```powershell
pnpm dlx vercel env add NEXT_PUBLIC_API_BASE_URL   # sólo si algún día hace falta
pnpm dlx vercel domains add gws.com                # dominio propio
```

`.vercel/` queda ignorado por git (sólo contiene UUIDs de proyecto, no secretos).

---

## 6. Checklist de verificación post-despliegue

Sobre la **URL pública** que arroje `vercel --prod`:

```powershell
$u = "https://TU-DOMINIO.vercel.app"
foreach ($p in @('/','/novedades','/novedades/reaparicion','/novedades/alianzas-estrategicas','/novedades/modelo-de-alianza','/umbral','/inicio','/privacy','/terms','/cookies','/refunds')) {
  $r = Invoke-WebRequest -UseBasicParsing -Uri ($u + $p)
  "{0,-38} {1}" -f $p, $r.StatusCode
}
Invoke-WebRequest -UseBasicParsing -Uri $u -Method Head | Select-Object -ExpandProperty Headers
```

Esperado: **11 rutas en `200`** y las cabeceras de §3 presentes.

Estado local de referencia (verificado el 15-10-2026): `tsc --noEmit` y `next build` sin
advertencias, **14 páginas estáticas** generadas.
