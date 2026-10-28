# GWS-WEB-001 · Manifiesto de alcance

**Estado:** Backlog. Manifiesto preparado; no aprobado, no implementado.
**Fecha:** 2026-10-27
**Base:** `workspace/2026-10-24` · `1bdafd2df3057d633c47a998da982ef5aca7830f`
**Circuito:** [`GWS_TWO_FRONTS_OPERATING_MODEL.md`](GWS_TWO_FRONTS_OPERATING_MODEL.md)

## 1. Objetivo

Conectar el adaptador existente de la taxonomía canónica con la interfaz web,
conservar los 20 IDs y los 3 pilares, eliminar la duplicación de IDs y resolver
los nombres en los siete idiomas sin romper la frontera servidor/cliente.

No se recrea el adaptador: `apps/web/src/lib/taxonomy.ts` ya importa
`createTaxonomyIndex` y expone `getTaxonomyView`, pero ninguna ruta lo consume.
La lista `membershipSpecialties` repite los 20 IDs canónicos y sus nombres en
siete idiomas.

## 2. Evidencia de partida

- La taxonomía canónica vive en `packages/taxonomy/data/` y se valida con
  `@gws/schemas`.
- Hay 3 pilares: `hot-kiln`, `flame`, `cold-working`.
- Hay 20 nodos: 7 de `hot-kiln`, 5 de `flame` y 8 de `cold-working`.
- `localizedTextSchema` solo define `es` y `en`.
- `membershipSpecialties` contiene exactamente los mismos 20 IDs y nombres en
  `es, en, pt, it, fr, de, zh`.
- `umbral`, `GalaxyOneDashboard` y `membership.ts` consumen la lista
  hardcodeada.
- `PillarCard` existe, pero no se importa desde ninguna ruta.
- `dashboard.ts` contiene 6 galaxias y 5 satélites; es un dominio distinto de
  los 3 pilares técnicos y no debe fusionarse con la taxonomía.
- No existe `/taxonomia`; esa ruta pertenece a `GWS-WEB-003`.
- La línea base `GWS-GITHUB-CONSTRUCTION-BASELINE-001` no está ejecutada.
- El inventario estático está documentado, pero no hay validación ejecutable:
  `node_modules` no está presente y no se instalaron dependencias.

## 3. Alcance incluido

- Derivar los IDs y pilares desde la fuente canónica.
- Sustituir la lista duplicada de IDs de `specialties.ts` por una derivación o
  una proyección client-safe.
- Mantener la selección de especialidades por galaxia y la compatibilidad con
  las preferencias guardadas en `localStorage`.
- Usar `getTaxonomyView` o una proyección equivalente en el límite
  servidor/cliente.
- Conservar los nombres en los siete idiomas mediante la decisión de la sección
  6.

## 4. Alcance excluido

- Implementar `/taxonomia` (`GWS-WEB-003`).
- Renderizar fichas de curaduría (`GWS-WEB-002` y `GWS-WEB-004`).
- Crear autenticación, permisos, base de datos o persistencia de servidor.
- Implementar pagos, suscripciones, comunidad, chat, Academy o búsqueda.
- Cambiar las seis galaxias o los cinco satélites.
- Modificar `main`.
- Activar agentes, MCP o Harness.

## 5. Archivos previstos

- `apps/web/src/lib/taxonomy.ts`
- `apps/web/src/lib/specialties.ts`
- `apps/web/src/lib/membership.ts`
- `apps/web/src/app/umbral/page.tsx`
- `apps/web/src/components/GalaxyOneDashboard.tsx`
- `apps/web/src/components/PillarCard.tsx`
- pruebas o script de verificación de IDs

## 6. Decisión de traducciones

### Opción A — recomendada

Mantener la taxonomía canónica con `es`/`en` y conservar los nombres en los
otros cinco idiomas en una capa de presentación keyed por ID canónico. La capa
no puede introducir IDs nuevos ni pilares alternativos.

Ventajas:

- no requiere migración del esquema canónico;
- conserva los siete idiomas;
- mantiene una sola fuente de identidad y jerarquía;
- es la opción de menor alcance para la primera tarea.

Riesgo: la capa de traducción sigue siendo un dato de UI; debe validarse contra
los IDs canónicos para no volver a duplicar la identidad.

### Opción B — diferida

Ampliar `localizedTextSchema` y los datos canónicos a los siete idiomas.

Ventajas:

- los nombres quedan en la fuente canónica.

Costos:

- cambios de esquema, datos y JSON Schema generados;
- migración y validación adicionales;
- mayor alcance del primer PR.

**Decisión propuesta:** Opción A para `GWS-WEB-001`. La Opción B requiere una
tarea separada si el titular decide que la taxonomía debe ser multilingüe en la
fuente.

## 7. Criterios de aceptación

- Los 20 IDs de membresía coinciden exactamente con los IDs canónicos.
- Los 3 pilares se derivan de la fuente canónica.
- No hay una segunda lista de identidad de especialidades.
- No se importa `node:fs` en componentes cliente.
- Los siete idiomas siguen disponibles.
- `/umbral` y `/galaxy/1-maestros` siguen funcionando.
- Las selecciones existentes en `localStorage` no se pierden.
- No se implementan rutas o módulos fuera de alcance.
- Typecheck y build pasan cuando las dependencias estén disponibles.

## 8. Pruebas previstas

- `pnpm --filter @gws/web typecheck`.
- `pnpm --filter @gws/web build`.
- Prueba o script de igualdad entre IDs de membresía y IDs canónicos.
- Smoke test de `/umbral` en los siete idiomas.
- Verificación de que `node:fs` no entra en el bundle cliente.
- Verificación de lectura de una selección previa de `localStorage`.

No se ejecutó ninguna de estas pruebas en esta preparación. No hay
`node_modules` y no se instalaron dependencias.

## 9. Riesgos

- Regresión de traducciones al reemplazar la lista hardcodeada.
- Ruptura de la frontera `server-only` de `@gws/taxonomy`.
- Pérdida de selecciones guardadas por cambios de IDs.
- Confusión entre galaxias/satélites y pilares técnicos.
- Ampliación innecesaria del esquema canónico.

## 10. Dependencias y siguiente paso

- Línea base funcional `GWS-GITHUB-CONSTRUCTION-BASELINE-001`: pendiente.
- Decisión de traducciones: Opción A propuesta; requiere confirmación.
- Aprobación del alcance: pendiente.
- Implementación: no iniciada.
