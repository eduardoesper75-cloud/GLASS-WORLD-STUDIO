# Despliegue público — Glass World Studio (Vercel)

> **Estado: DESPLEGADO Y VERIFICADO** · 15-10-2026
> **URL pública: <https://glass-world-studio.vercel.app>**
> Proyecto: `eduardoesper75-4497/glass-world-studio` · `main` · Next.js 15.5.27 · pnpm 9 workspace

---

## 0. Resultado verificado (sobre la URL pública)

| Verificación | Resultado |
|---|---|
| 11 rutas principales | **11/11 en `200`** (anónimo, sin login) |
| Páginas generadas | **14 estáticas** (`/`, `/_not-found`, `+3` slugs, `+` legales) |
| Cabeceras de seguridad | CSP, HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy ✅ |
| Edge cache | `x-vercel-cache: HIT` · `server: Vercel` |
| Build remoto | `Build Completed in /vercel/output [39s]` |

---

## 1. Configuración del proyecto (estado real en servidor)

Obtenida vía API de Vercel (no deducida):

| Parámetro | Valor |
|---|---|
| **Root Directory** | `apps/web` |
| **Framework** | `nextjs` |
| **Install Command** | `pnpm install --frozen-lockfile` |
| **Build Command** | `pnpm --filter @gws/schemas build && pnpm --filter @gws/taxonomy build && next build` |
| **Output Directory** | `.next` (relativo al Root Directory) |
| **Node** | `24.x` (la raíz declara `engines.node >= 20`) |

> **`outputDirectory` es relativo al Root Directory.** Con `apps/web` + `.next` la salida es
> `apps/web/.next`. Poner `apps/web/.next` ahí apuntaría a `apps/web/apps/web/.next` (error).

---

## 2. ⚠️ Las dos trampas del primer intento (y su solución)

Este despliegue **falló dos veces** antes de quedar verde. Ambas causas son contraintuitivas y
conviene tenerlas escritas:

### Trampa 1 — La CLI sube los archivos desde el **directorio actual**, no desde la raíz del repo

Corrí `vercel` desde `apps/web` → Vercel subió **44 archivos** (42 del subárbol + config) y
**nunca llegó `pnpm-lock.yaml`** ni `packages/*`:

```
ERROR  Headless installation requires a pnpm-lock.yaml file
```

**Solución:** desplegar **desde la raíz del monorepo**. Así se subieron **141 archivos** y el
install encontró el workspace (`Scope: all 5 workspace projects` · `Lockfile is up to date`).

### Trampa 2 — `Root Directory` debe estar **seteado en el servidor**, no lo pone el `cwd`

Con el repo completo subido pero `rootDirectory` vacío, el build corrió en la raíz del repo,
donde el `package.json` **no** tiene `next`:

```
"No Next.js version detected. Make sure your package.json has \"next\" ... 
 Also check your Root Directory setting matches the directory of your package.json file."
```

**Solución:** fijar `rootDirectory = "apps/web"` en el proyecto (vía API/dashboard). Recién
entonces el detector encuentra `next` en `apps/web/package.json`.

### Regla resultante

> **`rootDirectory = apps/web` en el proyecto  +  `vercel --prod` ejecutado desde la raíz del repo.**
> El primero le dice *dónde construir*; el segundo determina *qué archivos se suben*. Hacen falta los dos.

---

## 3. Por qué el build no es un simple `next build`

`apps/web/next.config.mjs` declara `serverExternalPackages: ['@gws/schemas', '@gws/taxonomy']`.
Esos paquetes exportan `./dist/index.js` y **`dist/` está en `.gitignore`** (no existe en el repo).
Sin compilarlos antes, la recopilación de datos de páginas falla al resolver el motor. Por eso el
build compila primero el motor en orden topológico (`schemas` antes que `taxonomy`, que depende de
`schemas`) y recién después `next build`.

---

## 4. Variables de entorno (auditoría)

### El frontend no lee ninguna variable

- **0** coincidencias de `process.env.*` en `apps/web`.
- **0** rutas de API (`src/app/**/route.ts` no existe) → app 100% estática.
- Por lo tanto **no se cargó ninguna clave en Vercel**, y no se necesita.

### 🔒 Las claves de OpenOutreach NO van al hosting

| Clave | Dónde vive realmente |
|---|---|
| `OPENOUTFIND_LLM_API_KEY` | `C:\Users\eduesper\AppData\Local\gws-tools\openoutreach\.env` |
| `OPENOUTFIND_BETTERCONTACT_API_KEY` | ídem |
| `OPENOUTFIND_APOLLO_API_KEY` | ídem |
| `OUTSEND_MAILBOX_PASSWORD` | ídem |
| `OUTSEND_SMTP_*` / `OUTSEND_IMAP_*` | ídem |
| `GOOGLE_*`, `YOUTUBE_API_KEY` | `.env` local en la raíz |

**Motivos:** (1) nadie las leería — el sitio no tiene servidor que las consuma; (2) el panel del
hosting tiene un ámbito de acceso mucho más amplio que este equipo, y cualquier `NEXT_PUBLIC_*`
viaja al navegador; (3) violaría la regla propia del proyecto: *secretos sólo en `.env`*.

Plantilla auditable versionada: [`.env.production.example`](../../.env.production.example).

---

## 5. Cabeceras de seguridad y caché

Definidas en **`apps/web/next.config.mjs` → `headers()`** (no en `vercel.json`), para que apliquen
en cualquier hosting y sean verificables con `next start`:

| Cabecera | Valor |
|---|---|
| `Content-Security-Policy` | `default-src 'self'` + `'unsafe-inline'` en script/style (requerido por App Router), `object-src 'none'`, `frame-ancestors 'none'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` (sólo producción) |
| `Cache-Control` | `/_next/static/*` → `immutable, 1 año`; imágenes → `1 día` + `stale-while-revalidate` |

---

## 6. Redirecciones de idioma — NO APLICA

No hay redirecciones que configurar: el idioma **no** va en la URL (no existen `/es/...`,
`/en/...`). Se aplica en cliente con un selector en `localStorage` que sincroniza el `lang` y el
título del documento y persiste al navegar. Configurar redirects de idioma rompería ese modelo y
duplicaría contenido sin `hreflang`. Si algún día se migra a locales por ruta, ese bloque va en
`redirects:` de `apps/web/vercel.json` junto con `hreflang`/`x-default`.

---

## 7. Cómo volver a desplegar

```powershell
# Requisito: CLI autenticada (vercel login)
cd "C:\Users\eduesper\Documents\Proyecto predeterminado"   # SIEMPRE desde la raíz del repo
pnpm dlx vercel@latest --prod
```

`vercel --prod` re-promociona la producción y actualiza el alias
`https://glass-world-studio.vercel.app`.

> El proyecto **no** tiene integración Git (el repo todavía no tiene remoto), así que el deploy es
> **manual**. Cuando exista remoto en GitHub, conviene conectar el repo para despliegues automáticos
> (Vercel respeta el Root Directory ya configurado).

---

## 8. Checklist de verificación (reutilizable)

```powershell
$u = "https://glass-world-studio.vercel.app"
foreach ($p in @('/','/novedades','/novedades/reaparicion','/novedades/alianzas-estrategicas','/novedades/modelo-de-alianza','/umbral','/inicio','/privacy','/terms','/cookies','/refunds')) {
  $r = Invoke-WebRequest -UseBasicParsing -Uri ($u + $p)
  "{0,-38} {1}" -f $p, $r.StatusCode
}
Invoke-WebRequest -UseBasicParsing -Uri $u -Method Head | Select-Object -ExpandProperty Headers
```

Esperado: **11 rutas en `200`** y las cabeceras de §5.
