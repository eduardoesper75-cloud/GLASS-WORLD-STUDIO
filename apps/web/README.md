# @gws/web

Capa 1 — **Presentación / UI** de GWS (Next.js App Router + React + TypeScript).

## Layer 1 — Portada de bienvenida

La portada se compone con HTML semántico y CSS responsive siguiendo la imagen maestra `public/arte-del-vidrio-en-el-cosmos.png` como blueprint visual. El cielo, la esfera de vidrio, la placa, los títulos y el indicador son elementos de interfaz, no una imagen a pantalla completa.

El enlace «TOCA PARA CONTINUAR» navega a `/umbral`, la entrada de Layer 2. Incluye el formulario visual del prototipo y selector persistente en los siete idiomas de `src/locales/*.json`: español, inglés, portugués, italiano, francés, alemán y chino. La selección se conserva en `localStorage`, sincroniza el idioma y el título del documento, y permanece al navegar entre rutas y recargar. Las páginas legales y el modal global de privacidad conservan por ahora su texto original en español.

El Umbral abre directamente la selección múltiple de las galaxias de pertenencia y perfiles profesionales. Una credencial estelar conceptual muestra en vivo la órbita elegida antes de confirmar. Las preferencias se guardan únicamente en `localStorage` (`gws-membership-preferences`). La confirmación aclara que no crea una cuenta ni activa una suscripción: la autenticación y persistencia de servidor siguen pendientes.

La interfaz principal del marketplace está en `/inicio`, con seis galaxias, cinco satélites, traducciones en los siete idiomas y modales de funciones. El acceso desde `/umbral` está marcado como vista previa. Los datos de Ruflo MCP aún no están conectados; no se muestran métricas ficticias.

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
- Rutas implementadas: `/` (portada), `/umbral` y `/inicio`. Rutas previstas: `/taxonomia`, `/ficha/[id]` y `/dashboard`.
- El consumo de APIs de Google/YouTube se hace **server-side**; nunca exponer claves (`NEXT_PUBLIC_*` solo para valores públicos).
