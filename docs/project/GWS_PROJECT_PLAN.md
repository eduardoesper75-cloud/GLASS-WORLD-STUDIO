# GWS · Plan de proyecto

## 1. Propósito y alcance

Glass World Studio (GWS) se organiza como **un solo proyecto con dos frentes**:

- **Frente local:** repositorio de trabajo, ramas de preparación y validaciones.
- **Frente GitHub:** repositorio remoto, revisión, publicación y gestión trazable.

Este plan no crea un segundo proyecto ni una taxonomía paralela. Toma como base
la arquitectura, la taxonomía y los inventarios ya existentes. El alcance de esta
fase es preparar una entrega publicable y dejar explícitas las decisiones que
requieren autorización del titular.

## 2. Workspace canónico

**Workspace A** es la fuente canónica: contiene el repositorio Git, el remoto
`origin`, la rama publicada `workspace/2026-10-24` y el commit base `77301a0`.

La ruta indicada como **Workspace B** (`D:\Descargas\GLASS-WORLD-STUDIO-main`)
no existe. La copia observada en `D:\Downloads\GLASS-WORLD-STUDIO-main` es un
repositorio distinto (TROPA): no contiene `apps/web`, no tiene el paquete GWS y
no tiene remoto configurado. Sus 14 archivos trackeados y su carpeta anidada no
constituyen trabajo exclusivo de GWS.

Otras copias sin repositorio Git no se consideran fuente. No se copió ninguna
carpeta completa sobre otra y no se modificó el Workspace B.

## 3. Estrategia de ramas

- La rama publicada se conserva: `workspace/2026-10-24` en `77301a0`.
- La preparación se hace en una rama de integración reversible:
  `integration/gws-two-fronts-20261026`.
- La preparación vive en un worktree separado; el árbol de trabajo original
  permanece intacto.
- No se hace `reset --hard`, `clean` destructivo, `push --force` ni `push --mirror`.
- No se modifica `main` ni la rama predeterminada.
- La integración con `main` no se ejecuta hasta verificar ancestro común y
  acordar una estrategia de base estable.

## 4. Hitos

| Hito | Resultado | Estado |
| --- | --- | --- |
| M0 · Fuente | Workspace canónico identificado y evidencia registrada | Validado |
| M1 · Gobernanza | 29 archivos de gobernanza preparados sin activar agentes | En curso |
| M2 · Planificación | Plan, backlog y estado versionables | En curso |
| M3 · Saneamiento | Correcciones documentales y defaults explícitos preparados | En curso |
| M4 · Publicación | Paquetes exactos aprobados y publicados | Parcial: A y S1 publicados; C y P pendientes |
| M5 · Gestión | Backlog versionado; tablero remoto solo con permisos y aprobación | Pendiente |
| M6 · Alineación | `main` y ramas reconciliadas con evidencia | Bloqueado |

## 5. Dependencias

- `M1`, `M2` y `M3` dependen de que el Workspace A siga siendo la fuente.
- `M4` depende de la aprobación del conjunto exacto y de la revisión del diff.
- `M5` depende de permisos de GitHub y de una aprobación separada del lote.
- `M6` depende de evidencia de ancestro común y de una estrategia para `main`.
- La rotación de credenciales y la retirada de registros privados dependen del
  titular; no se infieren de una publicación saneada.

## 6. Criterios de aceptación

- El diff staged coincide exactamente con los archivos aprobados.
- No hay secretos, tokens, contraseñas ni contactos de terceros en candidatos.
- Los 29 archivos de gobernanza no activan agentes por sí mismos.
- La auditoría `docs/agents/GWS_PRE_APPROVAL_AUDIT.md` queda excluida.
- Las configuraciones MCP no se publican como operativas.
- Las pruebas estáticas y los chequeos de sintaxis pasan.
- El SHA remoto se verifica después del push.
- Las copias locales de registros privados se preservan.

## 7. Revisión e integración

1. Revisar el diff y la lista exacta de archivos.
2. Verificar que no haya inclusiones accidentales.
3. Aprobar cada paquete por separado.
4. Preparar solo los archivos aprobados.
5. Commit y push normales, sin fuerza.
6. Comprobar el SHA remoto y el estado local restante.
7. Actualizar el estado y emitir un parte breve.

## 8. Incidentes y límites

- **S1:** la rotación de las cuatro credenciales históricas sigue pendiente de
  confirmación del titular. No se declara resuelta ni se afirma que una
  publicación saneada elimine la exposición histórica.
- **Registros privados:** se prepara una propuesta de retirada del árbol
  publicado, preservando copias locales. No se ejecuta en esta fase.
- **Contactos:** no se borran contactos públicos por coincidencia de patrón ni se
  marca aprobación del titular sin evidencia.
- **MCP:** los consumidores y la carga efectiva no están verificados. El frente
  MCP se resuelve en una tarea separada.
