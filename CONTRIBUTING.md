# Contribuir a GWS

## Principios

1. **Arquitectura limpia.** Respeta el grafo de dependencias de `docs/ARCHITECTURE.md`. La UI depende del motor; nunca al revés.
2. **Tipado estricto.** TypeScript en modo `strict` (ver `tsconfig.base.json`). Sin `any` implícitos.
3. **Cero redundancia.** Una sola fuente de verdad por concepto. Los esquemas viven solo en `packages/schemas`; no los dupliques.
4. **Entorno limpio.** Claves de API solo vía `.env` y `parseEnv`. Jamás hardcodeadas ni versionadas.
5. **Raíz ordenada.** No agregues carpetas de primer nivel sin actualizar este repo y `docs/ARCHITECTURE.md`.

## Flujo de trabajo

1. Crea una rama descriptiva: `feat/taxonomia-slumping`, `fix/validacion-id`, `docs/pipeline`.
2. Implementa con cambios pequeños y enfocados.
3. Antes de commitear:

   ```bash
   pnpm typecheck
   pnpm validate:taxonomy
   pnpm validate:cards
   ```

4. Commits **semánticos**:

   | Prefijo | Uso |
   | --- | --- |
   | `feat:` | Nueva funcionalidad |
   | `fix:` | Corrección de error |
   | `docs:` | Documentación |
   | `refactor:` | Cambio interno sin alterar comportamiento |
   | `chore:` | Tareas de mantenimiento / tooling |
   | `test:` | Pruebas |

   Ejemplo: `feat(taxonomy): añade nodo flame-marbling`.

## Dónde va cada cambio

| Cambio | Ubicación |
| --- | --- |
| Nuevo campo o tipo canónico | `packages/schemas/src/` |
| Nuevo nodo/pilar de taxonomía | `packages/taxonomy/data/` |
| Nueva ficha curada | `data/curated/<id>.json` |
| Nuevo comando de ingesta/sync | `pipeline/src/` |
| UI / rutas | `apps/web/src/` |
| Decisiones de arquitectura | `docs/` |

## Si cambias un esquema

1. Edita el Zod en `packages/schemas/src/`.
2. Regenera los JSON Schema: `pnpm generate:schemas`.
3. Revalida datos: `pnpm validate:taxonomy && pnpm validate:cards`.
