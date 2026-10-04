# PLAN — Welcome Screen

> **ESTADO: PENDIENTE DE APROBACIÓN DE JORGE.** Generado 2026-10-03.
> No ejecutar ninguna fase sin OK explícito.

## Premisa

`apps/web/app/welcome/page.tsx` ya está escrito y es correcto en su lógica. El
bloqueo es puramente de los dos componentes que importa. El objetivo del plan es
**desbloquear el build web** con el cambio mínimo posible, sin reescribir la página.

## Fase 0 — Desbloquear build (bloqueante)

1. Crear `apps/web/components/welcome/WelcomeVideo.tsx`
   - Server-safe: no necesita `'use client'` (el padre ya es client).
   - `autoPlay muted playsInline loop preload="metadata"`, `object-cover`.
2. Crear `apps/web/components/welcome/WelcomeCta.tsx`
   - Botón mínimo con transiciones de opacidad/translate.
   - `type="button"`, `aria-hidden={!visible}`, `tabIndex={visible ? 0 : -1}`.
3. Verificar: `npm run build` en `apps/web` → debe pasar.

## Fase 1 — Asset de video

4. `[BLOQUEADO — decisión de Jorge]` Definir fuente del video:
   - (a) archivo local en `apps/web/public/welcome/` (recomendado: sin dependencia externa),
   - (b) URL remota,
   - (c) poster estático + video diferido.
5. Si (a): agregar el asset y setear `src`. Verificar tamaño (target < 5 MB).

## Fase 2 — alineación timers ↔ video

6. `[DECISIÓN PENDIENTE]` Hoy los timers son fijos (6 s / 8 s). Si el video real
   dura distinto, alinear. Opciones:
   - (a) ajustar constantes 6000/8000 a la duración real,
   - (b) migrar a `onTimeUpdate`/`onEnded` (más robusto, más código).
7. Verificar con `prefers-reduced-motion`: si el usuario pide menos movimiento,
   saltar directo a `cta`. `[DECISIÓN PENDIENTE]`

## Fase 3 — Tests

8. Test de la máquina de estados en `apps/web/app/welcome/__tests__/` con
   `jest.useFakeTimers()`: playing → title (6000) → cta (8000) → exiting → push.
9. Test de render condicional del CTA según `visible`.

## Fase 4 — Verificación final

10. `npm run typecheck` en `apps/web`.
11. `npm run lint` en `apps/web`.
12. `npm test` en `apps/web` y en la raíz (no regressión del backend: 38/38).
13. `npm run build` en raíz (NestJS) y en `apps/web` (Next).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El video pesa mucho y hunde el LCP | `preload="metadata"`, poster, comprimir |
| Timers desalineados con el video | Fase 2 |
| Regresión en `/umbral` al navegar | Test de integración del `router.push` |
| Cambios de estilo fuera del design system | Fase 0 usa clases existentes |