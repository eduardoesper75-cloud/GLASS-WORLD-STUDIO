# Estado Maestro GWS + Tropa

Última actualización: **2026-10-03 23:05** (sesión compacta, lista para retomar)
Sesión: OpenCode autónomo · modelo `opencode/big-pickle` (DeepSeek configurado pero no activo en esta sesión — requiere reinicio de la app)

---

## Frente 1 — GWS

### Git
- **Último commit: `7e96fe4`** — `[frente-1] chore(welcome): agregar placeholder del poster`
- **`origin/main` = `7e96fe4`** (sincronizado, push clean)
- Rama `main`, remote `github.com/eduardoesper75-cloud/GLASS-WORLD-STUDIO`
- Working tree: solo 2 state files de claude-flow sucios (ruido de runtime, no tocar)
- La rama `backup/pre-secret-cleanup` fue **eliminada** (03/10). Verificado: **0 refs** contienen la key vieja de OpenRouter.

| Hash | Commit |
|---|---|
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

### Assets de `/welcome` — INCOMPLETOS
| Archivo | Estado | Nota |
|---|---|---|
| `apps/web/public/welcome/intro-poster.jpg` | EXISTE (70 bytes) | **NO FUNCIONAL COMO POSTER** — ver abajo |
| `apps/web/public/welcome/intro.webm` | **FALTA** | sin fuente de video |
| `apps/web/public/welcome/intro.mp4` | **FALTA** | sin fuente de video |

**El placeholder NO sirve como poster.** El archivo generado el 03/10 es un **PNG de 1×1 píxel transparente de 70 bytes con extensión `.jpg`**. Estirado a pantalla completa es un rectángulo negro liso. Dos defectos: (a) 1×1 no es un placeholder utilizable, (b) es PNG con nombre `.jpg`, así que el content-type queda mal.

**Lo que sí resolvió:** eliminó el 404 del atributo `poster`. Build web ✓ Compiled successfully, `/welcome` 1.57 kB.

**Estado real de `/welcome` en runtime:** renderiza fondo negro `#030712` + título dorado + CTA. Navegable y funcional, **pero sin video**. Con `prefers-reduced-motion: reduce` el branch del `<img>` tampoco muestra nada útil, porque el poster es 1×1.

**Fix pendiente (D1):** generar un poster real 1920×1080, fondo `#030712`, "GLASS WORLD STUDIO" en `#FFD700`, vetas de luz según `design-system/gws-design-tokens.css`, exportado a JPG real (~50–80 KB). Alternativa: eliminar el atributo `poster` hasta tener el asset real.

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
| 1 | **Video del welcome ausente**: `apps/web/public/welcome/intro.webm` y `intro.mp4` no existen. El poster es un PNG 1×1 inservible | `/welcome` renderiza negro + título + CTA, sin video | Decisión D1 — generar poster real y/o conseguir el video |
| 2 | **Jobs en modo Interactive** | No corren sin sesión Windows abierta | Re-registrar desde consola admin con S4U |
| 3 | **InboxAPI en 0** — 0 emails recibidos/enviados en todo el histórico | La tropa no recibe nada | Diagnosticar integración |
| 4 | **3 ofertas bajo umbral** (#13 $16/h, #14 $21/h, #19 $11,5/h) | Descartar o negociar | Decisión de Jorge |
| 5 | **5 borradores esperando aprobación** | Postulaciones paradas | Decisión de Jorge |
| 6 | **Backend :3001 caído** | No se puede probar la integración real | `npm run start:dev` |
| 7 | **`opencode.jsonc` sin commitear** (tiene el fix de Ruflo aplicado) | Cambio local no versionado | Commitear o dejar así |

### Fuera de alcance / pausado
- **Ruflo**: pausado por decisión de Jorge. No invocar.
- **Equipo `team_create`**: `opencode-agent-teams` instalado pero la tool no está expuesta en sesión CLI. La Fase 3 de coordinación con agentes quedó sin ejecutar.
- Escalado menor: `@inboxapi/cli` 0.3.18 → 0.3.23 disponible (pendiente de OK).

---

## Próximos pasos

1. **Decidir D1** (video del welcome) — generar un poster real 1920×1080 con los tokens GWS, o borrar el atributo `poster` hasta tener el asset. Los `intro.webm`/`intro.mp4` hay que conseguirlos. *Es lo único que bloquea el Frente 1.*
2. **Aprobar o descartar los 5 borradores** de `ledger/drafts/`. Ninguno se envía sin OK.
3. **Fijar precio** para #11, #12, #15, #16, #17, #18.
4. **Diagnosticar InboxAPI** — 0 emails es sospechoso.
5. **Re-registrar los 4 jobs en S4U** desde consola admin para que no dependan de la sesión abierta.
6. **Commitear `opencode.jsonc`** con el fix de Ruflo, o decidir si se descarta.
7. **Levantar el backend** (`:3001` caído) si hace falta probar integración real.

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
9. Placeholder del poster del welcome (**no funcional**, ver sección de assets).

---

## Referencias

- Specs welcome: `docs/specs/welcome-screen/{spec,plan,tasks}.md`
- Welcomescreen: `apps/web/app/welcome/page.tsx`, `apps/web/components/welcome/{WelcomeVideo,WelcomeCta}.tsx`
- Jobs tropa: `F:\Downloads\GLASS-WORLD-STUDIO-main\ledger\scheduler\jobs\`
- Prompts tropa: `F:\Downloads\GLASS-WORLD-STUDIO-main\ledger\scheduler\prompts/`
- Reporte tropa 03/10: `F:\Downloads\GLASS-WORLD-STUDIO-main\ledger\reports\estado-2026-10-03.md`
- Bitácora email: `F:\Downloads\GLASS-WORLD-STUDIO-main\ledger\email\2026-10-03.md`
- Invariantes de gobernanza: `CLAUDE.md` §3 (agentes), §5 (nada de secretos en texto plano)