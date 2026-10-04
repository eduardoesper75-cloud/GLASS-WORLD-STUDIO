# SPEC — Welcome Screen (GWS)

> **ESTADO: PENDIENTE DE APROBACIÓN DE JORGE.**
> Este spec fue generado automáticamente el 2026-10-03 a partir del código existente
> (`apps/web/app/welcome/page.tsx`). Jorge NO proveyó spec original. Todo lo que está
> marcado con `[DECISIÓN PENDIENTE]` requiere confirmación antes de implementar.

## 1. Objetivo

Pantalla de bienvenida full-screen para Glass World Studio: reproduce un video de
introducta, superpone el título de marca y, al final, ofrece un CTA para entrar a
`/umbral`.

## 2. Ubicación

| Ruta | Estado |
|---|---|
| `apps/web/app/welcome/page.tsx` | EXISTE (implementado) |
| `apps/web/components/welcome/WelcomeVideo.tsx` | **FALTA** → rompe el build |
| `apps/web/components/welcome/WelcomeCta.tsx` | **FALTA** → rompe el build |

## 3. Comportamiento actual (extraído de `page.tsx`)

Máquina de estados de 4 etapas:

| Estado | Trigger | Visibilidad título | Visibilidad CTA |
|---|---|---|---|
| `playing` | inicial (0 ms) | no | no |
| `title` | timer 6000 ms | sí | no |
| `cta` | timer 8000 ms | sí | sí |
| `exiting` | click / Enter / Espacio | sí | sí |

- La página completa es clickeable (`onClick={handleEnter}`) y tiene `tabIndex={0}`.
- `handleEnter()` → `exiting` → `router.push('/umbral')` a los 400 ms.
- La opacidad del contenedor hace la transición `1 → 0` en 400 ms ease-out.
- Viñeta radial overlay para legibilidad del texto sobre el video.
- Título: `GLASS WORLD STUDIO`, `#FFD700`, Cinzel, `clamp(2.5rem, 6vw, 5rem)`.
- Subtítulo: `— GWS —`, `#52525b`, JetBrains Mono, letter-spacing `0.4em`.
- El overlay y el bloque de texto llevan `pointer-events-none` para que el click
  en cualquier punto siga funcionando.

## 4. Contrato de los componentes faltantes

### `WelcomeVideo`

```ts
type WelcomeVideoProps = {
  className?: string;
};
```

- Debe renderizar un `<video>` con `autoPlay`, `muted`, `playsInline`, `loop`.
- Debe ocupar el contenedor completo (`absolute inset-0`, `object-cover`).
- `[DECISIÓN PENDIENTE]` — ¿MP4/WebM local en `public/`, o fuente remota?
  `[DECISIÓN PENDIENTE]` — ¿poster/placeholder mientras carga?
- `[DECISIÓN PENDIENTE]` — ¿debe llamar `onEnded`? La máquina de estados actual
  usa timers fijos (6 s / 8 s), no el evento `ended`. Si el video dura distinto,
  hay que alinear timers o cambiar a event-driven.

### `WelcomeCta`

```ts
type WelcomeCtaProps = {
  visible: boolean;
  label?: string;   // default: 'ENTRAR'
  onClick: () => void;
};
```

- Botón con `visible` controlling opacity/transform (no debe desmontarse, para
  permitir la transición de entrada).
- Debe ser alcanzable por teclado (el `onClick` del padre ya cubre Enter/Espacio,
  pero el botón necesita `type="button"` y foco visible).
- `[DECISIÓN PENDIENTE]` — estilo visual exacto. ¿Reusar
  `components/ui/button.tsx` o botón propio con el token dorado `#FFD700`?
- `[DECISIÓN PENDIENTE]` — ¿`aria-hidden` cuando `visible === false`?

## 5. Requisitos no funcionales

- Accesibilidad: `aria-live="polite"` en el bloque de título (ya presente), foco
  visible en el CTA, contraste AA sobre el video.
- Performance: el video no debe bloquear el LCP — usar `preload="metadata"`.
- Build: `npm run build` en `apps/web` debe pasar. Hoy **falla**.
- Tests: agregar test para la transición de estados con fake timers.

## 6. Fuera de alcance

- Cambios en `/umbral`.
- Persistencia de "ya vio el welcome" (no hay requirement definido).
- Analytics de la visita al welcome.