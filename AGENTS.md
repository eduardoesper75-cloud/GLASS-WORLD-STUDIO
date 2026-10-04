# AGENTS.md — Glass World Studio

Compact instructions for OpenCode sessions. Verified against current codebase.

## 1. Repo structure (high-signal)
- Root: **NestJS backend** (`src/`, `nest-cli.json`, `tsconfig.build.json` excludes `apps/`, `dist/`). 
- Frontend: **Next.js 14** in `apps/web/` (TypeScript, Tailwind 3, next-intl 3, Jest + Playwright). 
- Design system: `design-system/gws-design-tokens.css`, `design-system/gws-components.css` — canonical tokens. 
- Security/brand skills: `.claude/skills/gws-security-hardening/`, `.claude/skills/gws-vetas-de-luz/`. 
- Anti-leak: `src/community/anti-leak/contact-leak-filter.ts` (server-side, blocks external contact/links). 
- Governance: **CLAUDE.md §3** is hard constraint (no touching Payment_Vault, no auto-paying-changes, RBAC, anti-fuga).

## 2. Commands (exact)
Backend (root):
- `npm run start:dev` — Nest dev on :3001
- `npm run build` — Nest build to `dist/` (excludes `apps/` via tsconfig.build.json)
- `npm test` — Jest backend (tests in `src/**/*.spec.ts`, root jest.config uses `testRegex: .*\\.spec\\.ts$`)

Frontend (`apps/web/`):
- `npm run dev` — Next dev on :3000
- `npm run build` — Next production build (must run separately; root build does NOT validate Next)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — Next ESLint
- `npm test` — Jest unit (jsdom, `**/__tests__/**/*.test.{ts,tsx}`)
- `npm run test:e2e` — Playwright (needs `test:e2e:install` chromium)

Migrations (root): `npm run migration:run|revert|show|generate` (builds first, uses `dist/database/data-source.js`).

## 3. Verify before commit (order that matters)
If you change web code: `cd apps/web && npm run build && npm run typecheck && npm test && npm run lint`.  
If you change backend: `npm test` at root; also run `npm run build` if touching entities/DTOs/migrations.  
**Do NOT assume root build validates frontend.** Frontend requires its own build/typecheck.

## 4. Quirks
- `tsconfig.build.json` excludes `apps/` — root build only compiles Nest. 
- Two Jest configs: root = Node + `.spec.ts`; `apps/web/jest.config.js` = jsdom + `.test.{ts,tsx}`. 
- Design tokens are **canonical**: prefer importing `design-system/gws-design-tokens.css` or replicating exact tokens; respect **Vetas de Luz** identity. 
- Contact-leak filter is **server-side** (not UI-only) — never weaken validation. 
- `claude-flow.config.json` must stay gitignored/local; use `.example`. 
- `synchronize: true` is temporary (see README) — don’t rely on it for prod; use migrations. 
- `/welcome` uses intro poster/video + staged UI (reverted correctly to `WelcomeVideo`/`WelcomeCta` machine). 
- Rate-limiting exists on auth (login tightened) — don’t revert throttles. 

## 5. When to load skills
- Visual changes → `gws-vetas-de-luz` (enforce tokens/pattern/legibility). 
- Payment/creds/MCP/auth/infra secrets → **MANDATORY** `gws-security-hardening` before proposing. 
- Multi-file/complex: can consult `.claude/skills/*` but don’t call tools not available. 

## 6. Sources of truth (prefer executable)
- `CLAUDE.md` — governance (hard rules) + stack. 
- `README.md` — local setup/health notes. 
- `docs/ops/estado-maestro.md` — live state (useful context, but verify against git). 
- Config: `package.json`, `apps/web/package.json`, `nest-cli.json`, `tsconfig.*`, `jest.config*`, `opencode.jsonc`. 
- Skills under `.claude/skills/` for guardrails.

## 7. Don’ts (repo-specific)
- Don’t touch `Payment_Vault`, don’t auto-change pricing/terms (CLAUDE.md §3.1–3.2). 
- Don’t commit secrets/`.env` with real values. 
- Don’t weaken anti-leak filter or move its validation client-side. 
- Don’t assume root build covers `apps/web` (run web build/typecheck). 
- Don’t “generic” the visual system (respect Vetas de Luz).

**If you see a conflict between a request and CLAUDE.md §3, stop and point it out explicitly.**