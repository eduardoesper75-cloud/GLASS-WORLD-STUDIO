# pipeline

Capa 3 — **Pipeline de Automatización** de GWS. Conecta la capa de datos (Google Cloud / Drive & Docs) con el motor de curaduría y las plataformas de distribución.

## Estado actual (scaffold)

| Comando | Estado | Descripción |
| --- | --- | --- |
| `validate-cards` | ✅ implementado | Valida `data/curated/*.json` contra `@gws/schemas` + `@gws/taxonomy`. |
| `ingest:drive` | ⏳ roadmap | Ingesta desde Google Drive / Docs REST API. |
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
- Credenciales de API exclusivamente vía entorno (`parseEnv` / `requireGoogleDrive`), nunca hardcodeadas.
- Un comando = un módulo en `src/`, registrado en `src/index.ts`.
