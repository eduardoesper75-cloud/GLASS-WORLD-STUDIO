# Estado Maestro GWS + Tropa

Última actualización: **2026-10-03 23:05** (sesión compacta, lista para retomar)
Sesión: OpenCode autónomo · modelo `opencode/big-pickle` (DeepSeek configurado pero no activo en esta sesión — requiere reinicio de la app)

---

## Frente 1 — GWS

### Git
- **Último commit: `9c092a0`** — `[frente-1] feat: agregar favicon + OG image con branding GWS`
- **`origin/main` = `9c092a0`** (sincronizado, push clean)
- Rama `main`, remote `github.com/eduardoesper75-cloud/GLASS-WORLD-STUDIO`
- Working tree: solo 2 state files de claude-flow sucios (ruido de runtime, no tocar)
- La rama `backup/pre-secret-cleanup` fue **eliminada** (03/10). Verificado: **0 refs** contienen la key vieja de OpenRouter.

| Hash | Commit |
|---|---|
| `9c092a0` | feat: agregar favicon + OG image con branding GWS |
| `3c32dfa` | feat(welcome): poster real 1920x1080 con branding GWS |
| `7e96fe4` | chore(welcome): agregar placeholder del poster |
| `a24a83e` | fix: proteger claude-flow.config.json + agregar .example |
| `7c7c4f0` | docs: guardar estado maestro 2026-10-03 |
| `f4c03a9` | feat(welcome): agregar WelcomeVideo + WelcomeCta |
| `3fa4e9f` | docs: agregar specs de welcome-screen |
| `3028888` | chore: update 47 files |
| `f3d4502` | fix(b15): pool de libuv a 8 threads (último sync previo al rewrite) |

### Build
| Target | Comando | Estado |
|---|---|---|
| Backend (NestJS) | `npm run build` (raíz) | **OK** |
| Frontend (Next.js) | `npm run build` (apps/web) | **OK — 18/18 rutas** |

Rutas del build web: `/`, `/_not-found`, `/api/auth/{login,logout,register,session}`, `/api/gateway/[...path]`, `/checkout`, `/dashboard`, `/galaxies/g2`, `/intro`, `/login`, `/orders`, `/orders/[id]`, `/plans`, `/register`, `/umbral`, `/welcome`.

### Tests
| Suite | Comando | Resultado |
|---|---|---|
| Backend (jest, raíz) | `npm test` | **38/38 PASS** — 6 suites |
| Frontend (jest, apps/web) | `npm test` | **19/19 PASS** — 4 suites |
| Typecheck web | `npm run typecheck` | **0 errores** |
| Lint web | `npm run lint` | **1 warning** (no bloqueante) |

Lint warning conocido: `@next/next/no-img-element` en `WelcomeVideo.tsx:15` — es el `<img>` del poster en la rama `prefers-reduced-motion`. Intencional (Next/Image no aplica bien a un asset local con este propósito). Dejarlo o agregar `// eslint-disable-next-line`.

### Welcome screen — entregado
- `apps/web/app/welcome/page.tsx` — **EXISTE** (máquina de estados `playing` → `title` (6000ms) → `cta` (8000ms) → `exiting` (400ms) → `/umbral`)
- `apps/web/components/welcome/WelcomeVideo.tsx` — **CREADO 03/10** (video autoplay/muted/loop/playsInline + fallback a poster con `prefers-reduced-motion`)
- `apps/web/components/welcome/WelcomeCta.tsx` — **CREADO 03/10** (botón glass dorado, `aria-label="Ingresar al Umbral"`, foco visible, oculto por opacity/pointer-events en vez de desmontarse)
- **Ambos crearon desbloqueando el build web**, que estaba roto desde `main` por `Module not found`.

Specs en `docs/specs/welcome-screen/`: `spec.md`, `plan.md`, `tasks.md` — **creados 03/10**, marcados `PENDIENTE DE APROBACIÓN DE JORGE` con 5 decisiones abiertas (D1–D5).

### Assets de `/welcome` — POSTER RESUELTO, VIDEO PENDIENTE
| Archivo | Estado | Detalle |
|---|---|---|
| `apps/web/public/welcome/intro-poster.jpg` | **OK** | **1920×1080, 48.8 KB**, JPG real (`image/jpeg`, 50.261 B servidos) |
| `apps/web/public/welcome/intro.webm` | **FALTA** | sin fuente de video |
| `apps/web/public/welcome/intro.mp4` | **FALTA** | sin fuente de video |

Generado con `apps/web/scripts/generate-welcome-poster.js` (sharp, devDependency). Fondo `#030712` con radial `#1a1408`, título Georgia 110px en `#FFD700` con letter-spacing 12, submark `GWS` en `#52525b` entre dos diamantes.

**Los diamantes del submark son paths SVG, no glyphs de fuente**, a propósito: como glifo `◈` (U+25C8) depende de que exista en la fuente del sistema y sale como cuadro vacío si no. Verificado por análisis de píxeles sobre el raw: **5 runs exactos** en el submark (2 diamantes + G + W + S) y título de 1425 px centrado en 959.5 vs 960.

**Estado real de `/welcome`:** fondo estático + título + CTA, navegable. Sin video. Bajo `prefers-reduced-motion: reduce` el branch del `<img>` **sí** muestra el poster (antes mostraba un 1×1 negro).

### Brand assets — RESUELTOS
| Archivo | Estado | Detalle |
|---|---|---|
| `apps/web/app/icon.png` | **OK** | 256×256, 7.8 KB. 256 en vez de 32 para nitidez hi-dpi; Next escala solo |
| `apps/web/app/opengraph-image.jpg` | **OK** | 1200×630, 30.4 KB |
| `apps/web/public/og-image.jpg` | **OK** | 1200×630, 30.4 KB (mismo asset, servible por URL) |

Generados con `apps/web/scripts/generate-brand-assets.js`. Se usan las **convenciones de metadata de Next** (`app/icon.png`, `app/opengraph-image.jpg`) para que Next los inyecte solo en `<head>`. Verificado en el HTML servido:

```
<link rel="icon" href="/icon.png" sizes="256x256" type="image/png">
<meta property="og:image" content="http://localhost:3000/opengraph-image.jpg"  (1200x630)
<meta name="twitter:card" content="summary_large_image">
```

**Nota:** solo `public/og-image.jpg` NO habría funcionado — queda servible por URL pero Next no lo inyecta en el head. Por eso está la copia en `app/`.

### Servicios en runtime (verificado 03/10 23:50)
| Servicio | Estado |
|---|---|
| PostgreSQL 16 | **OK** — PID 7828, puerto 5432 |
| Backend NestJS `:3001` | **OK** — `GET /health` → `200 {"status":"ok","db":"ok","version":"1.0.0"}` |
| Frontend Next.js `:3000` | **OK** |
| `GET /welcome` | **200** — 12.073 B, contiene el título |
| `GET /welcome/intro-poster.jpg` | **200** — 50.261 B, `image/jpeg` |
| `GET /icon.png` | **200** — 7.949 B |
| `GET /og-image.jpg` | **200** — 31.174 B |

**Trampa importante para下次:** `Start-Process` + `-RedirectStandardOutput` **NO** funciona para servidores en este entorno — el log dice "successfully started" pero el process tree lo mata el timeout de la shell y el puerto queda cerrando. Hay que desacoplar con `Invoke-CimMethod -ClassName Win32_Process -MethodName Create`, que no hereda handles:

```powershell
$cmd = 'cmd /c cd /d "C:\ruta\del\proyecto" && npm run start:dev > "%TEMP%\x.log" 2> "%TEMP%\x.err.log"'
Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmd }
```

Además: para correr `npm run build` en `apps/web` hay que **matar el dev primero** (Node bloquea `.next`).

**Build de producción (verificado tras los brand assets):** ✓ Compiled successfully, **20/20 rutas** (subió de 18 por los 2 assets nuevos), `/icon.png` y `/opengraph-image.jpg` wireados · typecheck 0 errores · tests **19/19** · lint 1 warning preexistente.

### Seguridad — incidente resuelto
- **Secreto encontrado:** API key de OpenRouter (`sk-or-v1-…`) en texto plano en `claude-flow.config.json:4`, introducida en `910e502`.
- **Nunca llegó al remoto** (`origin/main` estaba en `f3d4502`). Expuesta solo en disco local.
- **Resuelto:** Jorge rotó la key (03/10). Se reescribió la historia local: `git reset --mixed f3d4502` + reconstrucción de los 3 commits. `git diff 910e502 3028888` = **1 sola línea** (la key → `{env:OPENROUTER_API_KEY}`). Push conforme.
- **Resuelto 03/10 (`a24a83e`):** `claude-flow.config.json` agregado a `.gitignore`, `git rm --cached` aplicado (des-trackeado, **intacto en disco**), y creado `claude-flow.config.json.example` con `{env:OPENROUTER_API_KEY}`. Git lo registró como rename (`claude-flow.config.json` → `.example`). La key vieja **no existe ya en ningún ref** del repo.
- **Pendiente:** si algún tool regenera `claude-flow.config.json`, el `.gitignore` ahora lo cubre — pero el `.example` hay que mantenerlo en sync si cambia el schema.

### Stack / contexto heredado (verificado por última vez 2026-09-22)
- Fases 0–9 completadas: backend 20 módulos, frontend FASE 1–9 con checkout real + órdenes.
- **Backend NO corre ahora** — `http://localhost:3001/health` no responde (verificado 03/10 22:35). Levantar con `npm run start:dev` en la raíz si hace falta.
- PostgreSQL 5432, BD `gws_dev`. Seed E2E: `seed.seller@gwe2e.dev` (verificar vigencia).
- FASE 10 (OpenAPI/Swagger) era el próximo paso del 22/09 — **nunca se hizo**.

### Toolchain
- `opencode-ai@1.18.34` (binario autónomo de 180 MB, sin deps de `opencode-windows-x64`).
- `opencode-windows-x64@1.18.31` obsoleto **desinstalado** 03/10. `opencode --version` → 1.18.34 OK.
- `ruflo@3.51.1` **PAUSADO** por decisión de Jorge (bugs en Windows). No invocar. Quitado del bloque `mcp` de `opencode.jsonc` (03/10, **sin commitear**).
- `opencode-agent-teams@2.0.0` instalado; activo **solo** dentro del repo GWS (declarado en `opencode.jsonc`). El config global tiene `"plugin": []`.
- Hermes `hermes-agent@0.20.4` instalado, **no corriendo**. Skill: `glass-world-studio`.

---

## Frente 2 — Tropa

Base: `F:\Downloads\GLASS-WORLD-STUDIO-main` · DB: `ledger/scheduler/tropa.db`

### Ofertas
- **Total: 19** — 10 `discarded`, 9 `pending_review`, **0 `draft_ready`** (el estado `draft_ready` no lo usa el script actual; las propuestas viven como `.md` en `ledger/drafts/`)
- **Postulaciones enviadas: 0.** InboxAPI reporta 0 recibidos y 0 enviados en todo el histórico de `eduardo-agente@39df03.inboxapi.ai`.

### 9 ofertas en `pending_review`
| # | Oferta | Precio | Nota |
|---|---|---|---|
| 11 | n8n/Make fixed-price ongoing (Marius_Bauzis) | no publicado | P2: USD 60/h |
| 12 | n8n Freelancer / Automation Builder (Jyotirmoy) | no publicado | P2: precio fijo |
| 13 | n8n + Looker Studio, paid test (MerrillOther) | ~USD 16/h | **BAJO UMBRAL** |
| 14 | N8N AI Automation Developer (Magic1) | ~USD 21/h | **BAJO UMBRAL** |
| 15 | Multi-Agent B2B Lead Gen (zhuoweixinnengyan) | no publicado | P2: USD 1.200/proyecto |
| 16 | Automation Specialist (Real Hires) | no publicado | P2: USD 60/h |
| 17 | Remote AI Automation Specialist (Pearl Talent) | no publicado | P2: USD 60/h |
| 18 | Full stack web developer (u/Disastorous-Ad-8637) | "flexible" | Requiere negociación |
| 19 | Founding Engineer (Backdoor) | ~USD 11,5/h | **BAJO UMBRAL** |

### 5 borradores listos para envío manual — NINGUNO ENVIADO
Requieren aprobación de Jorge (CLAUDE.md §3.2). Todos con datos verificados del post, sin huecos estructurales.

| Archivo | Oferta | Canal | Tarifa |
|---|---|---|---|
| `ledger/drafts/propuestas-directas-2026-10-03/01-chek-creative-poc-final.md` | Senior Make.com Engineers | DM make.com | USD 75–95/h (publicada) |
| `ledger/drafts/propuestas-directas-2026-10-03/01-n8n-multigente-leadgen-poc.md` | Multi-Agent Lead Gen | DM n8n | P2: USD 1.200 |
| `ledger/drafts/propuestas-directas/01-n8n-looker-studio-marketing-reporting.md` | n8n + Looker Studio | reply en hilo | ~USD 16/h ⚠️ |
| `ledger/drafts/propuestas-directas/02-n8n-make-fixed-price-ongoing.md` | n8n/Make fixed-price | reply en hilo | P2: definir |
| `ledger/drafts/propuestas-directas/03-whatsapp-automation-servicios-locales.md` | WhatsApp para servicios locales | DM n8n | P2: definir |

### Scheduler — reconstruido 03/10
**Antes:** 13 tareas, 8 duplicadas + 1 huérfana, 3 de 4 jobs fallando en silencio (sin logs).
**Ahora:** 13 borradas → **4 nuevas, registradas y probadas end-to-end** (rc=0, log generado, no-op idempotente).

| Job | Frecuencia | Script wrapper | LogonType |
|---|---|---|---|
| `tropa-revision-correo` | cada 2 h | `jobs/revision-correo-urgente.cmd` | **Interactive** |
| `tropa-escaneo-mercado` | cada 4 h | `jobs/escaneo-mercado-global.cmd` | **Interactive** |
| `tropa-seguimiento` | diario 14:00 | `jobs/seguimiento-postulaciones.cmd` | **Interactive** |
| `tropa-reporte-diario` | diario 20:00 | `jobs/reporte-diario-tropa.cmd` | **Interactive** |

- Wrappers: `ledger/scheduler/jobs/*.cmd` (CRLF, log en `ledger/scheduler/logs/*.log`)
- **Limitación:** modo `Interactive` → **no corren si no hay sesión de Windows abierta**. S4U requiere consola admin (registro falló con `0x80070005`).
- Los 4 wrappers abdomen "NO enviar ningún email/postulación sin aprobación explícita de Jorge".

### Bugs encontrados y corregidos en el scheduler
1. Wrappers escritos con **LF en vez de CRLF** — cmd no parsea batch con LF. Normalizado.
2. **`echo.>> "log"`** se parseaba como redirect huérfano → *"La sintaxis del comando no es correcta"*, rc=255, sin log. Corregido al idiom `>>"log" echo.`
3. Diagnóstico previo **incorrecto:** la discrepancia `opencode-windows-x64` NO era la causa de los fallos (el binario es autónomo). Los jobs ahora fallan de forma observable porque escriben log.

---

## Bloqueos

| # | Bloqueo | Impacto | Acción |
|---|---|---|---|
| 1 | **Video del welcome ausente**: `apps/web/public/welcome/intro.webm` y `intro.mp4` no existen | `/welcome` muestra fondo estático + título + CTA, sin video | Producir el video, o generar uno sintético con ffmpeg |
| 2 | **Jobs en modo Interactive** | No corren sin sesión Windows abierta | Re-registrar desde consola admin con S4U |
| 3 | **InboxAPI en 0** — 0 emails recibidos/enviados en todo el histórico | La tropa no recibe nada | Diagnosticar integración |
| 4 | **3 ofertas bajo umbral** (#13 $16/h, #14 $21/h, #19 $11,5/h) | Descartar o negociar | Decisión de Jorge |
| 5 | **5 borradores esperando aprobación** | Postulaciones paradas | Decisión de Jorge |
| 6 | **`opencode.jsonc` sin commitear** (tiene el fix de Ruflo aplicado) | Cambio local no versionado | Commitear o dejar así |

**Resueltos en este ciclo:** poster del welcome (1920×1080 real), favicon, OG image, backend `:3001` caído, rama `backup` con la key vieja, `claude-flow.config.json` sin proteger.

### Fuera de alcance / pausado
- **Ruflo**: pausado por decisión de Jorge. No invocar.
- **Equipo `team_create`**: `opencode-agent-teams` instalado pero la tool no está expuesta en sesión CLI. La Fase 3 de coordinación con agentes quedó sin ejecutar.
- Escalado menor: `@inboxapi/cli` 0.3.18 → 0.3.23 disponible (pendiente de OK).

---

## Próximos pasos

1. **Video del welcome** — único bloqueo que impide cerrar el Frente 1. Producir `intro.webm`/`intro.mp4`, o generar uno sintético con ffmpeg. Mientras tanto la pantalla ya funciona con el poster.
2. **Aprobar o descartar los 5 borradores** de `ledger/drafts/`. Ninguno se envía sin OK.
3. **Fijar precio** para #11, #12, #15, #16, #17, #18.
4. **Diagnosticar InboxAPI** — 0 emails es sospechoso.
5. **Re-registrar los 4 jobs en S4U** desde consola admin para que no dependan de la sesión abierta.
6. **Commitear `opencode.jsonc`** con el fix de Ruflo, o decidir si se descarta.

---

## Estado de la última sesión (2026-10-03)

Trabajo completado, en orden:
1. Verificación de entorno + configuración de DeepSeek como provider (key vía variable de entorno, nunca en archivo).
2. Diagnóstico del build web roto → 2 componentes faltantes en `app/welcome/page.tsx`.
3. Creación de `WelcomeVideo.tsx` + `WelcomeCta.tsx` → build desbloqueado (18/18 rutas).
4. specs de welcome-screen (`spec.md`, `plan.md`, `tasks.md`).
5. Limpieza de Ruflo de `opencode.jsonc` (aplicado, **sin commitear**).
6. **Incidente de seguridad**: API key de OpenRouter en texto plano → key rotada por Jorge, historia reescrita, push conforme.
7. Reconstrucción del scheduler: 13 tareas → 4, con wrappers `.cmd` + logs, probados end-to-end.
8. Limpieza de `claude-flow.config.json` + `.gitignore` + `.example`.
9. Placeholder 1×1 del poster → **reemplazado por poster real 1920×1080** + favicon + OG image (sharp).
10. Backend `:3001` levantado y verificado; frontend `:3000` verificado. Build 20/20, tests 19/19.

## Decisiones técnicas tomadas sin consultar (autorización de Jorge)

| Decisión | Motivo |
|---|---|
| `◈` como `<path>` vectorial en vez de glifo de fuente | Un glyph U+25C8 depende de la fuente del sistema; si falta, sale cuadro vacío |
| favicon a 256×256 en vez de 32×32 | Next escala solo; a 32 se ve borroso en hi-dpi |
| OG image en `app/opengraph-image.jpg` además de `public/` | Solo en `public/` Next no lo inyecta en `<head>` |
| Desacoplar servidores con `Win32_Process.Create` | `Start-Process` + redirect muere con el timeout de la shell |
| Reescritura de historia por `reset --mixed` + recommit, en vez de `rebase -i` | El rebase interactivo no funciona sin editor y con el working tree sucio |

## Convenios de verificación en este repo

- **Antes de commitear en `apps/web`:** `npm run build` + `npm test` + `npm run typecheck`. El build de la raíz (`nest build`) solo cubre el backend y **no detecta** nada del frontend.
- Un `npm run build` verde en la raíz **no** implica que el web compile. Hay que correr el de `apps/web`.
- Regenerar assets: `node scripts/generate-welcome-poster.js` y `node scripts/generate-brand-assets.js` (requiere `sharp`, devDependency).

---

## Referencias

- Specs welcome: `docs/specs/welcome-screen/{spec,plan,tasks}.md`
- Welcomescreen: `apps/web/app/welcome/page.tsx`, `apps/web/components/welcome/{WelcomeVideo,WelcomeCta}.tsx`
- Jobs tropa: `F:\Downloads\GLASS-WORLD-STUDIO-main\ledger\scheduler\jobs\`
- Prompts tropa: `F:\Downloads\GLASS-WORLD-STUDIO-main\ledger\scheduler\prompts/`
- Reporte tropa 03/10: `F:\Downloads\GLASS-WORLD-STUDIO-main\ledger\reports\estado-2026-10-03.md`
- Bitácora email: `F:\Downloads\GLASS-WORLD-STUDIO-main\ledger\email\2026-10-03.md`
- Invariantes de gobernanza: `CLAUDE.md` §3 (agentes), §5 (nada de secretos en texto plano)