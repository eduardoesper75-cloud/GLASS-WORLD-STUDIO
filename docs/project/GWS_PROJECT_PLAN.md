# GWS · Plan de proyecto

**Fecha:** 2026-10-27
**Base de trabajo:** `workspace/2026-10-24`
**Commit base:** `1bdafd2df3057d633c47a998da982ef5aca7830f`
**Circuito operativo:** [`GWS_TWO_FRONTS_OPERATING_MODEL.md`](GWS_TWO_FRONTS_OPERATING_MODEL.md)

## 1. Propósito y alcance

Glass World Studio (GWS) se organiza como **un solo proyecto con dos frentes**:

- **Frente local:** repositorio de trabajo, ramas cortas, pruebas y preparación.
- **Frente GitHub:** repositorio remoto, revisión, publicación y trazabilidad.

Este plan no crea un segundo proyecto ni una taxonomía paralela. Toma como base
la arquitectura, la taxonomía y los inventarios existentes. El alcance de esta
fase es ordenar el circuito de trabajo y dejar explícitas las decisiones que
requieren autorización del titular.

## 2. Workspace canónico

**Workspace A** es la fuente canónica: contiene el repositorio Git, el remoto
`origin`, la rama publicada `workspace/2026-10-24` y el commit base `77301a0`
de la historia anterior. La rama está alineada con el remoto en `1bdafd2`.

La ruta indicada como **Workspace B** (`D:\Descargas\GLASS-WORLD-STUDIO-main`)
no existe. La copia observada en `D:\Downloads\GLASS-WORLD-STUDIO-main` es un
repositorio distinto (TROPA): no contiene `apps/web`, no tiene remoto configurado
y su carpeta anidada no constituye trabajo exclusivo de GWS.

No se copió ninguna carpeta completa sobre otra y no se modificó la copia de
`D:`. No hay un informe formal de selección C: vs D:; la evidencia disponible
es la identidad del repositorio y la presencia del remoto.

## 3. Estrategia de ramas

- La rama compartida es `workspace/2026-10-24`, en `1bdafd2`.
- Cada tarea usa una rama corta con ID:
  `feat/<task-id>-<descripcion>`, `fix/<task-id>-<descripcion>`,
  `docs/<task-id>-<descripcion>` o `chore/<task-id>-<descripcion>`.
- No se crean ramas vacías ni dos ramas permanentes llamadas «frente 1» y
  «frente 2».
- La preparación documental de esta orden vive en
  `docs/GWS-TWO-FRONTS-WORKFLOW-001-circuito-operativo`.
- El worktree de integración existente no es el taller diario; no se elimina ni
  se reutiliza silenciosamente.
- No se hace `reset --hard`, `clean` destructivo, `push --force` ni
  `push --mirror`.
- No se modifica `main` ni su historia en esta fase.

## 4. Hitos

| Hito | Resultado | Estado |
| --- | --- | --- |
| M0 · Fuente | Workspace canónico identificado y evidencia registrada | Integrado |
| M1 · Gobernanza | 29 archivos de gobernanza versionados sin activar agentes | Integrado |
| M2 · Planificación | Plan, backlog, estado y circuito versionables | En revisión |
| M3 · Saneamiento | Correcciones documentales y defaults explícitos publicados | Integrado |
| M4 · Publicación | Paquetes exactos aprobados y publicados | Integrado: `1bdafd2` |
| M5 · Gestión | Backlog versionado; tablero remoto solo con permisos y aprobación | En revisión (PR #1) |
| M6 · Alineación | `main` y ramas reconciliadas con evidencia | Bloqueado |

## 5. Dependencias

- `M1`, `M2` y `M3` dependen de que el Workspace A siga siendo la fuente.
- `M4` quedó cerrado con la publicación de A, S1, C y P en `1bdafd2`.
- `M5` está en revisión en el PR #1. La aprobación del lote documental y los
  permisos para recursos remotos son decisiones separadas.
- `M6` depende de una estrategia para `main` y de evidencia de ancestro común.
- La línea base funcional `GWS-GITHUB-CONSTRUCTION-BASELINE-001` no está
  ejecutada; las tareas de producto dependen de ella.
- La rotación de credenciales y el saneamiento de archivos locales ya
  trackeados dependen del titular; no se infieren de una publicación saneada.

## 6. Criterios de aceptación del circuito

- El diff coincide exactamente con los archivos aprobados.
- No hay secretos, tokens, contraseñas ni contactos de terceros en candidatos.
- Los archivos de gobernanza no activan agentes por sí mismos.
- La auditoría `docs/agents/GWS_PRE_APPROVAL_AUDIT.md` queda excluida.
- Las configuraciones MCP no se publican como operativas.
- Las pruebas declaradas se ejecutan y las no ejecutadas se informan.
- El SHA remoto se verifica después del push.
- Las modificaciones locales a archivos ya trackeados y la auditoría no
  trackeada se preservan fuera del PR; la exclusión no las convierte en
  privadas ni las retira del árbol publicado.

## 7. Revisión e integración

1. Revisar el diff y la lista exacta de archivos.
2. Verificar que no haya inclusiones accidentales ni datos privados.
3. Aprobar el lote documental.
4. Abrir el PR contra `workspace/2026-10-24`.
5. Revisar y aprobar según los permisos aplicables.
6. Integrar sin auto-merge y verificar el SHA remoto.
7. Actualizar el estado y emitir el parte de sesión.

Estado actual: el lote documental ya está publicado en el PR #1. Los pasos 3 y
4 se cumplieron; quedan la revisión humana y la decisión de merge.

El circuito completo, los estados de tarea y las reglas de permisos están en
`GWS_TWO_FRONTS_OPERATING_MODEL.md`.

## 8. Incidentes y límites

- **S1:** la rotación de las cuatro credenciales históricas sigue pendiente de
  verificación independiente. No se declara resuelta.
- **Archivos locales ya trackeados:** las modificaciones locales y la auditoría
  no trackeada se preservan fuera del PR. La exclusión no las convierte en
  privadas ni las retira del árbol publicado; cualquier saneamiento o retirada
  requiere una tarea de seguridad separada y aprobación.
- **Contactos:** no se borran contactos públicos por coincidencia de patrón ni
  se marca aprobación del titular sin evidencia.
- **MCP:** consumidores y carga efectiva no verificados; configuración fuera de
  la entrega.
- **Harness:** sin backend autorizado para inferencia real.
- **`main`:** la `main` local (`77301a0`) es ancestro de la rama; `origin/main`
  (`ddab558`) no comparte ancestro común. No se mezcla en esta fase.

## 9. Relación con `main`

La transición de `main` es una línea separada. No se usa como base de las tareas
de construcción ni se modifica su historia. Cualquier estrategia de integración
requiere evidencia de ancestro común, revisión del historial y aprobación del
titular.

## 10. Siguiente tarea

`TWO_FRONTS_WORKFLOW_REVIEW`: revisar el PR #1 y sus siete archivos; no fusionar
sin aprobación humana. Después, resolver la dependencia de línea base antes de
iniciar una tarea de producto.
