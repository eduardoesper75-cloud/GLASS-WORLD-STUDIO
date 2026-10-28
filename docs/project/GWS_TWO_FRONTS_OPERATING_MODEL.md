# GWS — Circuito operativo de los dos frentes

**Estado:** preparado para revisión; no publicado todavía.
**Fecha:** 2026-10-27
**Base de trabajo:** `workspace/2026-10-24`
**Commit base:** `1bdafd2df3057d633c47a998da982ef5aca7830f`
**Remoto:** `https://github.com/eduardoesper75-cloud/GLASS-WORLD-STUDIO.git`

Este documento regula el trabajo operativo humano: cómo se prepara una tarea
localmente y cómo se revisa en GitHub. El ciclo de agentes, el `Task Manifest`
y las compuertas de agente están en `docs/agents/GWS_WORKFLOW.md`; este circuito
no activa agentes.

## 1. Propósito de los dos frentes

GWS es **un solo proyecto** con dos frentes complementarios:

- **Frente local:** construir, probar y preparar cambios en una rama corta.
- **Frente GitHub:** revisar, aprobar y publicar el cambio en un PR trazable.

No se crea un segundo proyecto, una taxonomía paralela ni dos tableros. El
tablero, cuando exista, es único para GWS.

## 2. Base y ramas

1. La base compartida es `workspace/2026-10-24`.
2. Antes de empezar, verificar que la base local y la remota coinciden en el
   commit acordado. La referencia de este circuito es `1bdafd2`.
3. Cada tarea nace de un commit de base verificado en una rama corta:
   `feat/<task-id>-<descripcion>`, `fix/<task-id>-<descripcion>`,
   `docs/<task-id>-<descripcion>` o `chore/<task-id>-<descripcion>`.
4. No se crean ramas vacías por anticipado ni dos ramas permanentes llamadas
   «frente 1» y «frente 2».
5. Una tarea puede usar un worktree temporal propio. El worktree de integración
   existente no es el taller diario; no se elimina ni se reutiliza sin aviso.
6. Si la base avanza durante una tarea, se actualiza la rama después de
   coordinar. No se usa `push --force` ni se reescribe historial.

## 3. Ciclo de una tarea

Estados permitidos: **Backlog**, **Preparado**, **En curso**, **En revisión**,
**Bloqueado**, **Integrado**.

| Estado | Significado | Quién lo mueve | Salida |
|---|---|---|---|
| Backlog | Idea o necesidad registrada, sin alcance cerrado | Titular u operador | Alcance y prioridad preliminares |
| Preparado | Alcance, dependencias, archivos y criterios definidos | Operador con aprobación del alcance | Rama y commit base identificados |
| En curso | Una persona implementa la unidad activa | Operador | Cambios y pruebas locales |
| En revisión | PR abierto y diff congelado para revisión | Operador | Revisión técnica y pruebas |
| Bloqueado | Falta una decisión, dependencia o permiso | Quien detecta el bloqueo | Motivo y responsable registrados |
| Integrado | Cambio aceptado e integrado en la base | Titular u operador autorizado | Estado y parte de sesión actualizados |

«Validado» no es un estado: es el resultado de las comprobaciones. No reemplaza
la revisión, la integración ni la aceptación.

### Pasos

1. Elegir una tarea del backlog y confirmar que no haya otra tarea activa del
   mismo operador sobre los mismos archivos.
2. Verificar la base y registrar rama, commit de partida y alcance.
3. Completar la plantilla de tarea antes de tocar archivos.
4. Implementar cambios pequeños y descriptivos.
5. Ejecutar las pruebas declaradas y registrar las que no se ejecutaron.
6. Abrir un PR contra `workspace/2026-10-24` con la plantilla de PR.
7. Revisar el diff, los riesgos, los secretos y la reversión.
8. Aprobar e integrar según los permisos aplicables. No hay auto-merge.
9. Actualizar backlog, estado y parte de sesión.
10. Cerrar la tarea solo cuando los criterios de aceptación estén cumplidos y la
    integración esté registrada.

## 4. Criterio de cierre

Una tarea se considera cerrada cuando:

- el ID y el alcance coinciden con la plantilla aprobada;
- los criterios de aceptación tienen evidencia verificable;
- las pruebas ejecutadas y las no ejecutadas están declaradas;
- no se incorporaron secretos, registros privados ni configuraciones excluidas;
- el PR fue revisado y el diff coincide con lo aprobado;
- el cambio quedó integrado en la base;
- el backlog, el estado y el parte de sesión fueron actualizados.

Para cambios de producto se aplican además las comprobaciones del proyecto
(`pnpm --filter @gws/web typecheck` y `pnpm --filter @gws/web build` cuando
correspondan). Para cambios exclusivamente documentales se exige al menos
`git diff --check` y revisión de enlaces y formato.

No se declara «terminado» por haber publicado una rama o abierto un PR.

## 5. Parte de sesión

Cada sesión deja un parte breve, sin secretos ni logs completos:

```text
# Parte de sesión — <task-id>
fecha:
operador:
rama:
commit base:
commit candidato:
estado: Backlog | Preparado | En curso | En revisión | Bloqueado | Integrado
objetivo:
archivos:
pruebas ejecutadas:
pruebas no ejecutadas:
resultado:
decisiones:
pendientes:
riesgos:
privacidad: sin secretos / sin datos privados
próximo paso:
```

El parte se guarda en `docs/agent-reports/` solo cuando corresponda al circuito
de agentes; para trabajo humano puede registrarse en el estado del proyecto o
en el PR. No se duplica el mismo parte en varios lugares.

## 6. Permisos y decisiones

- **Titular:** decide alcance de producto, tratamiento de registros privados,
  creación de recursos remotos y estrategia de `main`.
- **Operador:** prepara la rama, implementa, prueba, abre el PR y publica solo
  el lote aprobado. No se autoaprueba una decisión de producto.
- **Revisor:** revisa el diff y las pruebas. La revisión asistida por Perplexity
  es una entrada de revisión, no una aprobación formal de GitHub, salvo que un
  actor autorizado la registre como tal.
- **Decisiones:** se registran con fecha, responsable y motivo. Las decisiones
  de producto pendientes no se convierten en requisitos aprobados por aparecer
  en un documento de trabajo.

## 7. Relación pendiente con `main`

- La `main` local permanece en `77301a0` y es ancestro de la rama de trabajo.
- `origin/main` está en `ddab558` y no comparte ancestro común con
  `workspace/2026-10-24`.
- No se usa `main` como base de estas tareas ni se modifica su historia.
- La transición de `main` es una línea separada: requiere estrategia propia,
  evidencia de ancestro común y aprobación del titular.

## 8. Revisión en GitHub

- El PR se abre contra `workspace/2026-10-24`, no contra `main`.
- Se usa la plantilla de PR del repositorio.
- No se exigen checks, revisores ni aprobaciones formales que el equipo actual
  no pueda proporcionar.
- No se activa auto-merge.
- No se crean reglas de protección, issues ni tableros sin aprobación separada.
- No se considera el despliegue un requisito implícito de la tarea.

## 9. Líneas separadas

Estas líneas no se mezclan con el backlog de construcción:

| Línea | Tratamiento |
|---|---|
| Construcción de producto | Backlog priorizado y PR contra la base |
| Seguridad histórica y credenciales | Tarea separada; decisión del titular; no se infiere de una publicación |
| Configuración MCP | Tarea separada; requiere consumidor y carga verificada |
| Inferencia real de Harness | Línea bloqueada hasta autorización de backend |
| Transición futura de `main` | Línea separada; no se ejecuta en este circuito |

Un bloqueo de una línea no congela tareas independientes que sean seguras y
estén aprobadas.

## 10. Reglas iniciales

1. Una tarea de implementación activa por operador.
2. No editar los mismos archivos desde dos frentes sin coordinación.
3. Revisar estado y base antes de empezar.
4. Commits pequeños y descriptivos.
5. No publicar cambios privados ni configuraciones excluidas.
6. No activar agentes por incorporar sus definiciones.
7. No usar auto-merge.
8. No considerar despliegue un requisito implícito.
9. No declarar «terminado» sin criterios y pruebas.

## 11. Sincronización

No hay sincronización automática. La actualización de referencias y la
publicación son operaciones manuales, verificadas y aprobadas. Este documento
no promete sincronización continua ni integración automática.
