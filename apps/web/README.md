# @gws/web

Capa 1 — **Presentación / UI** de GWS (Next.js App Router + React + TypeScript).

## Estado

Esqueleto sin lógica de negocio. Incluye `layout`, `page` y estilos base.

## Comandos

```bash
pnpm --filter @gws/web dev        # desarrollo en http://localhost:3000
pnpm --filter @gws/web build      # build de producción
pnpm --filter @gws/web typecheck  # verificación de tipos
```

## Próximos pasos

- Consumir `@gws/taxonomy` (pilares y nodos) en lugar de datos cableados.
- Renderizar Fichas de Curaduría publicadas desde `data/curated`.
- Rutas previstas: `/` (landing), `/taxonomia`, `/ficha/[id]`, `/dashboard`.
- El consumo de APIs de Google/YouTube se hace **server-side**; nunca exponer claves (`NEXT_PUBLIC_*` solo para valores públicos).
