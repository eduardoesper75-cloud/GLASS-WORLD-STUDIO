# GWS-WEB-001 · Especificación técnica

**Tarea:** `GWS-WEB-001`
**Estado:** especificación lista; implementación no iniciada.
**Base:** `feat/GWS-WEB-001-monoplaza-frontend`
**Fecha:** 2026-10-28
**Decisión de traducción:** Opción A.

## 1. Objetivo

Consumir exclusivamente el adaptador de taxonomía canónica en la UI del
monoplaza web, eliminando la lista paralela de identidad de especialidades y
manteniendo los nombres en los siete idiomas de interfaz.

La fuente de verdad es `packages/taxonomy/data/`, validada por
`@gws/schemas` y expuesta por `createTaxonomyIndex()`.

## 2. Alcance

Incluido:

- Conectar `apps/web/src/lib/taxonomy.ts` con las rutas y componentes que
  muestran pilares, nodos y especialidades.
- Derivar los 3 pilares y los 20 nodos canónicos desde el motor.
- Conservar la selección de especialidades por galaxia.
- Mantener compatibilidad con preferencias existentes en `localStorage`.
- Conservar los siete idiomas: `es`, `en`, `pt`, `it`, `fr`, `de`, `zh`.
- Validar que la capa de nombres no introduzca IDs ni jerarquías paralelas.

Excluido:

- Cambios de esquema canónico o migraciones de datos.
- Ampliar `localizedTextSchema` a siete idiomas; eso queda para una tarea
  posterior si el titular lo decide.
- Crear la ruta `/taxonomia` (`GWS-WEB-003`).
- Fichas de curaduría, autenticación real, pagos, suscripciones, comunidad,
  chat, búsqueda o persistencia de servidor.
- Modificar `main`, fusionar PR #1 o activar agentes/MCP/Harness.

## 3. Contrato del adaptador

`getTaxonomyView()` sigue siendo la frontera server-only. Debe exponer un DTO
serializable con:

- `version`
- `pillarCount`
- `totalNodes`
- `pillars[]`: `id`, `name`, `summary`, `tags`, `nodeCount`, `highlights[]`

Reglas:

1. Ningún componente cliente importa `@gws/taxonomy`, `node:fs` ni el módulo
   `server-only`.
2. La identidad, el pilar y la jerarquía provienen del motor.
3. La UI recibe la proyección por props desde un Server Component o por un
   artefacto generado en build; no la reconstruye con listas hardcodeadas.
4. La capa de nombres es un mapa de etiquetas keyed por ID canónico. No declara
   pilares, jerarquía, orden alternativo ni IDs adicionales.
5. Si un ID canónico no tiene etiqueta en los siete idiomas, el build o la
   validación fallan.

## 4. Opción A · proyección de traducciones

La taxonomía canónica mantiene `name.es` y `name.en`. Los cinco idiomas
restantes se resuelven en una capa de presentación:

```ts
type SpecialtyLabels = Record<LanguageCode, string>;
type SpecialtyLabelOverlay = Record<CanonicalNodeId, SpecialtyLabels>;
```

Contrato:

- las claves deben coincidir exactamente con los IDs canónicos;
- no se agregan IDs, alias ni nodos;
- el orden de pilares y nodos se toma del motor;
- la UI no muestra la taxonomía completa en esta tarea.

## 5. Refactor previsto

1. Extraer la parte cliente de `/umbral` a un componente cliente que reciba
   `taxonomyView` y la proyección de nombres.
2. Mantener la página como Server Component para ejecutar el adaptador.
3. Reemplazar `membershipSpecialties` por la proyección derivada; conservar
   `specialtyIds` para validar `localStorage`.
4. Adaptar `GalaxyOneDashboard` para recibir los datos o un subconjunto
   serializable, sin importar el motor.
5. Eliminar la duplicación de IDs y pilares de `specialties.ts`; conservar solo
   las traducciones que falten en el motor.
6. No cambiar los seis módulos de galaxia ni los cinco satélites: son otro
   dominio.

## 6. Criterios de aceptación

- Los 20 IDs de la UI coinciden exactamente con los IDs canónicos.
- Los 3 pilares coinciden con `hot-kiln`, `flame` y `cold-working`.
- No existe una segunda lista de identidad de especialidades.
- Los siete idiomas están completos.
- `/umbral` y `/galaxy/1-maestros` funcionan.
- Una selección previa de `localStorage` sigue siendo legible.
- No se importa `node:fs` en el bundle cliente.
- `pnpm --filter @gws/web typecheck` pasa.
- `pnpm --filter @gws/web build` pasa.
- No se incorpora contenido de alianzas, inversores o logística a `apps/web`.

## 7. Pruebas de verificación

- Igualdad entre IDs de UI y IDs de `createTaxonomyIndex()`.
- Cobertura de los siete idiomas para cada ID.
- Detección de IDs faltantes o sobrantes en la capa de nombres.
- Smoke de `/umbral` en los siete idiomas.
- Smoke de `/galaxy/1-maestros` con una selección guardada.
- Inspección del bundle cliente para confirmar ausencia de `node:fs` y del
  motor server-only.
- Typecheck y build.

## 8. Riesgos

- Ruptura de la frontera `server-only` al pasar datos a cliente.
- Pérdida de selecciones guardadas por cambios de IDs.
- Nombres incompletos en alguno de los siete idiomas.
- Confundir galaxias y satélites con los tres pilares técnicos.
- Ampliar el alcance hacia esquema o datos canónicos.

## 9. Dependencias y estado

- Línea base ejecutable: PASS.
- Limpieza de frontera de dominio: ejecutada antes de esta especificación.
- Decisión de traducción: Opción A.
- Aprobación de alcance: pendiente de autorización de implementación.
- Implementación: no iniciada.
