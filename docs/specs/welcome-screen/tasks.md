# TASKS — Welcome Screen

> **ESTADO: PENDIENTE DE APROBACIÓN DE JORGE.** Generado 2026-10-03.
> Ninguna tarea se marca `done` sin build + tests en verde.

## Bloqueantes (build roto)

- [ ] **T1** Crear `apps/web/components/welcome/WelcomeVideo.tsx`
  - [ ] Props `className?: string`
  - [ ] `<video autoPlay muted playsInline loop preload="metadata">`
  - [ ] `absolute inset-0 h-full w-full object-cover`
  - [ ] Sin `'use client'` (el padre ya lo es)
- [ ] **T2** Crear `apps/web/components/welcome/WelcomeCta.tsx`
  - [ ] Props `{ visible: boolean; label?: string; onClick: () => void }`
  - [ ] `type="button"`
  - [ ] `aria-hidden={!visible}` + `tabIndex={visible ? 0 : -1}`
  - [ ] No desmontar al ocultarse (transición de entrada)
- [ ] **T3** Verificar build web → `npm run build` en `apps/web` **en verde**

## Decisiones pendientes de Jorge

- [ ] **D1** ¿De dónde sale el video? (local en `public/` / URL remota / poster)
- [ ] **D2** ¿`WelcomeCta` reusa `components/ui/button.tsx` o botón propio dorado?
- [ ] **D3** ¿Timers fijos (6000/8000) o event-driven (`onEnded`)?
- [ ] **D4** ¿`prefers-reduced-motion` soportado?
- [ ] **D5** ¿Se persiste "ya vio el welcome" (cookie/DB)?

## Asset

- [ ] **T4** [bloqueado por D1] Incorporar el video a `apps/web/public/welcome/`
- [ ] **T5** [bloqueado por D1] Poster de fallback

## Calidad

- [ ] **T6** [bloqueado por D3] Alinear constantes o migrar a event-driven
- [ ] **T7** Test de máquina de estados con fake timers
- [ ] **T8** Test de render condicional del CTA
- [ ] **T9** `npm run typecheck` en `apps/web`
- [ ] **T10** `npm run lint` en `apps/web`
- [ ] **T11** `npm test` en `apps/web`
- [ ] **T12** No regresión backend: `npm test` en raíz → 38/38
- [ ] **T13** `npm run build` en raíz (NestJS) → verde
- [ ] **T14** Verificación manual en `/welcome` (video, título, CTA, Enter)

## Reglas

- Nada de API keys ni secretos en el repo.
- Nada de push a `main` sin build + tests en verde.
- Nada de emails ni postulaciones sin aprobación de Jorge.