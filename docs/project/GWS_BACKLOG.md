# GWS · Backlog inicial

**Corte:** 2026-10-26, previo a la publicación.
Estados permitidos: **Propuesta**, **Autorizada**, **En curso**, **Bloqueada**,
**Validada**, **Integrada**. El tablero remoto no se creó: este backlog es la
fuente versionada hasta que exista una aprobación y permisos suficientes.

## 1. Tareas

| ID | Objetivo | Bloque / galaxia | Prioridad | Responsable propuesto | Dependencias | Estado | Evidencia de cierre |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GWS-BASE-001 | Resolver y registrar el workspace canónico. | Base / transversal | P0 | Operador técnico | Comparación A/B | Validada | Workspace A contiene Git, remoto y rama; B observado no contiene GWS. |
| GWS-SYNC-001 | Publicar el avance local aprobado. | Base / publicación | P0 | Titular + operador | Aprobación del paquete exacto | En curso | A y S1 publicados en `e457dfb`; C y P no publicados; sin fuerza. |
| GWS-SEC-001 | Registrar el estado de revocación de credenciales, sin valores. | Seguridad / transversal | P0 | Titular | Confirmación del titular | Validada | Titular confirmó revocación; sin verificación independiente. |
| GWS-SEC-002 | Retirar o redactar registros operativos del árbol público, según aprobación. | Seguridad / publicación | P0 | Titular + operador | Aprobación y copias locales | Propuesta | Propuesta de retirada preparada; no ejecutada. |
| GWS-GOV-001 | Versionar las 20 definiciones de agentes y los documentos asociados. | Gobernanza / transversal | P1 | Operador técnico | Revisión del diff | Integrada | Commit `75a736d`; remoto `e457dfb`; agentes no activados. |
| GWS-PLAN-001 | Establecer tablero y rutina de partes. | Planificación / transversal | P1 | Operador técnico | Aprobación de documentos | En curso | Plan, backlog y estado preparados; no publicados; tablero pendiente. |
| GWS-G1-001 | Consolidar investigación G1 y fuentes disponibles. | Investigación / G1 | P2 | Titular + investigación | Fuentes y alcance | Propuesta | Sin fuentes nuevas verificadas en este registro. |
| GWS-UX-001 | Revisar decisiones pendientes del entorno sensorial. | Experiencia / UX | P2 | Titular + diseño | Decisiones de producto | Propuesta | Requiere revisión de alcance; no se inventan galaxias ni satélites. |
| GWS-HARNESS-001 | Resolver backend autorizado para inferencia real. | Harness / infraestructura | P1 | Titular + operador | Proveedor y autorización | Bloqueada | No hay backend autorizado ni evidencia de inferencia real. |
| GWS-MCP-001 | Identificar consumidores y resolver configuración MCP en tarea separada. | MCP / infraestructura | P2 | Operador técnico | Consumidor y carga verificada | Bloqueada | Configuraciones no publicadas; carga efectiva no verificada. |

## 2. Rutina de los dos frentes

1. Identificar el ID de tarea.
2. Registrar rama y commit base.
3. Delimitar archivos y criterio de aceptación.
4. Ejecutar una unidad de trabajo.
5. Probar.
6. Revisar.
7. Publicar el cambio autorizado.
8. Actualizar estado.
9. Emitir un parte breve.

No se mantienen dos operadores editando los mismos archivos sin coordinación.
No se activan agentes sin asignación y permisos explícitos. No se declara
sincronización continua si no existe automatización verificada.

## 3. Borradores de issues (sin crear)

Estos textos son para aprobación; no se publicaron en GitHub.

### GWS-BASE-001

**Título:** `GWS-BASE-001 · Registrar workspace canónico`
**Cuerpo:** Confirmar el workspace con repositorio Git y remoto como fuente
canónica. Documentar que la ruta alternativa no contiene el proyecto GWS y
preservar ambas ubicaciones. Criterio: evidencia de raíz Git, rama, HEAD y
remoto; sin copiar carpetas completas.

### GWS-SYNC-001

**Título:** `GWS-SYNC-001 · Publicar avance local aprobado`
**Cuerpo:** Publicar únicamente los paquetes aprobados desde la rama de
integración. Verificar diff staged, ejecutar pruebas estáticas y comprobar el SHA
remoto. No usar `git add .`, fuerza ni reescritura de historial.

### GWS-SEC-001

**Título:** `GWS-SEC-001 · Registrar revocación de credenciales`
**Cuerpo:** Registrar el estado de las cuatro credenciales históricas sin incluir
valores. No declarar rotación hasta contar con confirmación del titular.

### GWS-SEC-002

**Título:** `GWS-SEC-002 · Retirar o redactar registros operativos`
**Cuerpo:** Preparar la retirada del árbol publicado de los registros aprobados,
preservando copias locales. Excluirlos de un commit no los vuelve privados ni
elimina el historial. No ejecutar sin aprobación.

### GWS-GOV-001

**Título:** `GWS-GOV-001 · Versionar gobernanza de agentes`
**Cuerpo:** Incorporar las 20 definiciones y los documentos asociados sin
activar agentes ni servicios. Verificar que no haya cambios posteriores a la
revisión.

### GWS-PLAN-001

**Título:** `GWS-PLAN-001 · Planificación y rutina de partes`
**Cuerpo:** Versionar plan, backlog y estado. El tablero remoto queda pendiente
de permisos y aprobación agrupada.

### GWS-G1-001

**Título:** `GWS-G1-001 · Consolidar investigación G1`
**Cuerpo:** Reunir fuentes disponibles y separar propuestas de requisitos
aprobados. No inventar alcance de galaxias o satélites.

### GWS-UX-001

**Título:** `GWS-UX-001 · Revisar decisiones del entorno sensorial`
**Cuerpo:** Revisar decisiones pendientes de experiencia y accesibilidad con el
titular. No convertir propuestas conceptuales en requisitos aprobados.

### GWS-HARNESS-001

**Título:** `GWS-HARNESS-001 · Resolver backend de inferencia`
**Cuerpo:** Identificar el backend autorizado para inferencia real y evitar
repetir simulaciones sin cambios relevantes. Documentar límites y aprobación.

### GWS-MCP-001

**Título:** `GWS-MCP-001 · Resolver configuración MCP`
**Cuerpo:** Identificar consumidores y verificar la carga efectiva antes de
publicar configuración operativa. Mantener placeholders fuera de la entrega.
