# @gws/web

Capa 1 — **Presentación / UI** de GWS (Next.js App Router + React + TypeScript).

## Layer 1 — Portada de bienvenida

La portada se compone con HTML semántico y CSS responsive siguiendo la imagen maestra `public/arte-del-vidrio-en-el-cosmos.png` como blueprint visual. El cielo, la esfera de vidrio, la placa, los títulos y el indicador son elementos de interfaz, no una imagen a pantalla completa.

El enlace «TOCA PARA CONTINUAR» navega a `/umbral`, la entrada de Layer 2. Incluye el formulario visual del prototipo y siete idiomas. La selección se conserva en `localStorage`, sincroniza el atributo de idioma del documento y permanece al navegar entre rutas y recargar.

El formulario aún no se conecta a autenticación ni envía o almacena los datos introducidos. Al enviarlo, informa explícitamente de que esa integración está pendiente.

## Comandos

```bash
pnpm --filter @gws/web dev        # desarrollo en http://localhost:3000
pnpm --filter @gws/web build      # build de producción
pnpm --filter @gws/web typecheck  # verificación de tipos
```

## Próximos pasos

- Integrar autenticación y registro en Layer 2.
- Consumir `@gws/taxonomy` (pilares y nodos) en lugar de datos cableados.
- Renderizar Fichas de Curaduría publicadas desde `data/curated`.
- Rutas previstas: `/` (landing), `/taxonomia`, `/ficha/[id]`, `/dashboard`.
- El consumo de APIs de Google/YouTube se hace **server-side**; nunca exponer claves (`NEXT_PUBLIC_*` solo para valores públicos).
