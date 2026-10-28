# @gws/web

Capa 1 — **Presentación / UI** de GWS (Next.js App Router + React + TypeScript).

## Layer 1 — Portada de bienvenida

La portada se compone con HTML semántico y CSS responsive siguiendo la imagen maestra `public/arte-del-vidrio-en-el-cosmos.png` como blueprint visual. El cielo, la esfera de vidrio, la placa, los títulos y el indicador son elementos de interfaz, no una imagen a pantalla completa.

El enlace «TOCA PARA CONTINUAR» navega a `/umbral`, la entrada de Layer 2. Incluye el formulario visual del prototipo y selector persistente en los siete idiomas de `src/locales/*.json`: español, inglés, portugués, italiano, francés, alemán y chino. La selección se conserva en `localStorage`, sincroniza el idioma y el título del documento, y permanece al navegar entre rutas y recargar. Las páginas legales y el modal global de privacidad conservan por ahora su texto original en español.

El Umbral comienza con un paso obligatorio de credenciales (nombre de usuario, correo, contraseña y confirmación exacta) antes de permitir la selección de galaxias. La autenticación todavía no está conectada: esos campos no se transmiten ni se guardan y el flujo no crea una cuenta. Después, cada tarjeta de galaxia abre un modal con 20 especialidades agrupadas en los pilares Hot-Kiln, Flame y Cold-Working; las disciplinas se conservan por galaxia y pueden editarse antes de confirmar. Se requiere una galaxia o un perfil profesional; satélites y especialidades son opcionales. Una credencial estelar conceptual muestra en vivo la órbita, las disciplinas y los servicios elegidos. Al finalizar, se guardan `user_profile` y `assigned_galaxy_id` en `localStorage` (`gws-membership-preferences`) y se enruta al hub correspondiente; si solo se seleccionó un perfil profesional, se abre `/professionals/dashboard`. La preferencia es local a este dispositivo: no crea una cuenta ni activa una suscripción, porque la autenticación y persistencia de servidor siguen pendientes.

El hub de Galaxia 1 está en `/galaxy/1-maestros`, con bienvenida para elegir un avatar guardado localmente, curaduría de contenido interno, accesos rápidos y navegación entre galaxias. Los demás destinos de galaxia tienen una portada base, y `/professionals/dashboard` muestra los roles profesionales seleccionados. La interfaz principal del marketplace sigue disponible en `/inicio`, con seis galaxias, cinco satélites y modales de funciones. Los datos de Ruflo MCP aún no están conectados; no se muestran métricas simuladas.

El panel de creación de Maestros vive en `/galaxy/1-maestros/creator-dashboard`. Permite editar el perfil profesional y administrar borradores/publicaciones locales de cursos y recursos educativos, herramientas e insumos, piezas de arte y servicios técnicos. El catálogo tipado se guarda en `localStorage` (`gws-master-creator-data`) y admite edición y eliminación; los campos multimedia son referencias URL a recursos y no cargas de archivos. La opción «Mostrar en mi catálogo local» solo modifica la vista local: las publicaciones no se envían ni se comercializan en el marketplace sin persistencia compartida.

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
- Rutas implementadas: `/` (portada), `/umbral`, `/inicio`, `/galaxy/[slug]`, `/galaxy/1-maestros/creator-dashboard` y `/professionals/dashboard`. Rutas previstas: `/taxonomia`, `/ficha/[id]` y `/dashboard`.
- Las integraciones externas no forman parte del cliente web; las claves privadas nunca deben exponerse mediante variables `NEXT_PUBLIC_*`.
