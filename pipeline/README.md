# pipeline

Capa 3 — **Pipeline de Automatización** de GWS. Conecta la capa de datos (Google Cloud / Drive & Docs) con el motor de curaduría y las plataformas de distribución.

## Estado actual (scaffold)

| Comando | Estado | Descripción |
| --- | --- | --- |
| `validate-cards` | ✅ implementado | Valida `data/curated/*.json` contra `@gws/schemas` + `@gws/taxonomy`. |
| `ingest:drive` | ⏳ roadmap | Ingesta desde Google Drive / Docs REST API. |
| `ingest:youtube` | ⏳ roadmap | Metadatos y capítulos desde YouTube Data API v3. |
| `sync:web` | ⏳ roadmap | Publica fichas hacia la capa de presentación. |

## Uso

```bash
# desde la raíz del monorepo
pnpm validate:cards
# o directamente
pnpm --filter @gws/pipeline start validate-cards
```

Código de salida ≠ 0 si alguna ficha es inválida: listo para CI.

## Convenciones

- Sin lógica duplicada: los esquemas viven **solo** en `@gws/schemas`.
- Credenciales de API exclusivamente vía entorno (`parseEnv` / `requireGoogleDrive` / `requireYouTube`), nunca hardcodeadas.
- Un comando = un módulo en `src/`, registrado en `src/index.ts`.

## Requisitos de seguridad para la integración de YouTube

`ingest:youtube` y la automatización de playlists siguen en roadmap: el repositorio todavía no contiene `gws_youtube_playlists.py` ni código que publique o inserte videos. Antes de implementar esa integración, deberá:

- Crear playlists privadas por defecto y permitir únicamente los estados privado u oculto durante pruebas.
- Validar el esquema, dominio e identificador de cada enlace, y comprobar su disponibilidad antes de procesarlo.
- Omitir y registrar en el CSV de resultados los videos eliminados, restringidos o bloqueados por derechos de autor sin detener el lote.
- Aplicar un límite estricto de 10.000 unidades diarias de API y dosificar las publicaciones a 1–3 por día.
- Leer las claves solo desde variables de entorno; nunca imprimirlas en logs ni incluirlas en archivos versionados.
- Usar el transporte local `stdio` para las herramientas MCP, sin exponerlas en un endpoint de red.
