# GWS · Backlog y líneas de trabajo

**Corte:** 2026-10-27
**Base de trabajo:** `workspace/2026-10-24`
**Commit base verificado:** `1bdafd2df3057d633c47a998da982ef5aca7830f`
**Circuito:** [`GWS_TWO_FRONTS_OPERATING_MODEL.md`](GWS_TWO_FRONTS_OPERATING_MODEL.md)
**Remoto:** `https://github.com/eduardoesper75-cloud/GLASS-WORLD-STUDIO.git`

Estados: **Backlog**, **Preparado**, **En curso**, **En revisión**, **Bloqueado**,
**Integrado**. «Validado» es un resultado de comprobaciones, no un estado.

## 1. Línea base funcional

La tarea `GWS-GITHUB-CONSTRUCTION-BASELINE-001` **no tiene evidencia de
ejecución** en este repositorio: no aparece en documentos, commits, issues ni
PRs consultados. Se mantiene como dependencia y no se repite dentro de esta
orden.

Por ese motivo, las tareas de producto siguientes están propuestas, no
aprobadas ni preparadas para implementación. No se inicia ninguna hasta que la
línea base funcional esté disponible o el titular autorice expresamente un
alcance alternativo.

## 2. Líneas separadas

| Línea | Estado | Siguiente paso | Dependencia |
|---|---|---|---|
| Construcción de producto | Bloqueada por línea base | Confirmar baseline y priorizar | `GWS-GITHUB-CONSTRUCTION-BASELINE-001` |
| Seguridad histórica y credenciales | Bloqueada | Decisión del titular y verificación independiente | Registros privados y confirmación del titular |
| Configuración MCP | Bloqueada | Identificar consumidor y verificar carga efectiva | Tarea MCP separada |
| Inferencia real de Harness | Bloqueada | Autorización de backend y proveedor | Decisión del titular |
| Transición futura de `main` | Bloqueada | Definir ancestro común y estrategia de base | Aprobación del titular |

Un bloqueo de estas líneas no impide una tarea independiente que sea segura y
esté aprobada.

## 3. Backlog de construcción propuesto

Máximo cinco tareas. Todas dependen de la línea base funcional y permanecen en
**Backlog**. No son requisitos de producto aprobados.

| ID | Objetivo | Módulo | Prioridad | Dependencias | Estado |
|---|---|---|---|---|---|
| `GWS-WEB-001` | Conectar el adaptador existente de la taxonomía canónica con la UI, eliminar la duplicación de IDs y resolver los nombres en siete idiomas; no recrear el adaptador. | `apps/web` · `packages/taxonomy` | P1 | Línea base; decisión de idiomas | Backlog |
| `GWS-WEB-002` | Renderizar las fichas disponibles de `data/curated` con el contrato de `@gws/schemas` y un filtro de estado explícito; definir una ficha de prueba publicada. | `apps/web` · `data/curated` | P1 | Línea base; decisión de datos | Backlog |
| `GWS-WEB-003` | Implementar la ruta `/taxonomia` usando la taxonomía canónica. | `apps/web` | P2 | Línea base; `GWS-WEB-001` | Backlog |
| `GWS-WEB-004` | Implementar la ruta `/ficha/[id]` para fichas publicadas. | `apps/web` | P2 | Línea base; `GWS-WEB-002` | Backlog |
| `GWS-WEB-005` | Definir la ruta `/dashboard` y su relación con las superficies existentes, sin duplicar estado local; decisión de UX previa. | `apps/web` | P2 | Línea base; decisión de UX | Backlog |

### Tarea recomendada para comenzar, después de la línea base

`GWS-WEB-001` · Conectar la taxonomía canónica (reformulada).

Valor: elimina la duplicación de IDs y nombres, usa el adaptador existente y
desbloquea la ruta `/taxonomia`. Requiere una decisión explícita sobre los siete
idiomas y no requiere autenticación ni persistencia de servidor.

No se recomienda iniciar `GWS-WEB-002` a `GWS-WEB-005` antes de confirmar la
línea base y revisar el alcance con el titular. La ficha existente en
`data/curated` está en estado `draft`; no hay fichas publicadas.

El manifiesto de alcance de `GWS-WEB-001` y la decisión de traducciones están en
[`GWS_WEB_001_MANIFEST.md`](GWS_WEB_001_MANIFEST.md).

## 4. Registro de tareas base

| ID | Resultado | Estado | Evidencia |
|---|---|---|---|
| `GWS-BASE-001` | Workspace canónico identificado y documentado. | Integrado | Workspace A con Git, remoto y rama; D no es fuente GWS. |
| `GWS-SYNC-001` | Paquetes A, S1, C y P publicados sin fuerza. | Integrado | Remoto `workspace/2026-10-24` en `1bdafd2`. |
| `GWS-GOV-001` | Gobernanza de agentes versionada sin activarlos. | Integrado | Commit `75a736d`. |
| `GWS-PLAN-001` | Plan, backlog, estado y circuito de trabajo actualizados. | En revisión | Esta rama documental. |
| `GWS-SEC-001` | Estado de credenciales registrado sin valores. | En revisión | Confirmación del titular; sin verificación independiente. |
| `GWS-SEC-002` | Tratamiento de registros privados. | Backlog | Requiere aprobación y copias locales. |
| `GWS-MCP-001` | Configuración MCP. | Bloqueado | Consumidor y carga efectiva no verificados. |
| `GWS-HARNESS-001` | Backend de inferencia real. | Bloqueado | Sin backend autorizado. |

## 5. Propuestas no priorizadas

Estas propuestas no forman parte del backlog activo de construcción:

- `GWS-G1-001`: consolidar investigación de Galaxia 1.
- `GWS-UX-001`: revisar decisiones del entorno sensorial.

No se convierten en requisitos aprobados ni se implementan en esta orden.

## 6. Tablero único propuesto

Si se crea un tablero de GitHub, será uno solo para GWS, con estas columnas:

`Backlog` · `Preparado` · `En curso` · `En revisión` · `Bloqueado` · `Integrado`

Vistas sugeridas: tareas activas, bloqueos y separación por línea de trabajo.
El tablero **no se creó**; requiere aprobación separada.

## 7. Issues propuestos

No hay issues abiertos en el remoto. Los títulos propuestos para las cinco
tareas son:

1. `GWS-WEB-001 · Consumir taxonomía canónica en la web`
2. `GWS-WEB-002 · Renderizar fichas de curaduría publicadas`
3. `GWS-WEB-003 · Implementar ruta /taxonomia`
4. `GWS-WEB-004 · Implementar ruta /ficha/[id]`
5. `GWS-WEB-005 · Definir ruta /dashboard`

No se crearon issues. Los cuerpos deben completarse con la plantilla de tarea y
no deben incluir datos privados.

## 8. Regla de avance

El orden es: confirmar la línea base, preparar una sola tarea, abrir un PR
contra `workspace/2026-10-24`, revisar, integrar y actualizar este backlog. No
se publican cambios privados, no se activan agentes por incorporar definiciones,
no hay auto-merge y el despliegue no es un requisito implícito.
