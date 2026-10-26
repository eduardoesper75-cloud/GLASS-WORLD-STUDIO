# GWS — Flujo de trabajo de agentes

> Define el ciclo de vida de una unidad de trabajo, la maquina de estados, las compuertas,
> los limites anti-bucle y el protocolo de cuadrillas. Sin secretos.

---

## 1. Unidad de trabajo: el `Task Manifest`

Toda tarea empieza con un manifiesto escrito **antes** de tocar archivos. Plantilla en
`docs/agents/GWS_REPORT_TEMPLATES.md` (§1). Contenido minimo:

```text
taskId            GWS-YYYYMMDD-NN
titulo            ...
agenteJefe        gws-chief-engineer | gws-art-experience-director | gws-chief-qa-security-auditor
baseCommit        <hash corto>
allowlist         rutas permitidas (explicitas)
prohibido         rutas fuera de alcance
subagentes        cuadrilla + alias + tarea atomica por miembro
compuertas        tecnica | visual | seguridad | QA (segun corresponda)
notasHumanas      decisiones previas que condicionan la tarea
```

Un cambio sin `Task Manifest` no puede pasar a `INTEGRATED`.

## 2. Maquina de estados

```text
PLANNED
  -> SCOPED
  -> ASSIGNED
  -> IN_PROGRESS
  -> IMPLEMENTED
  -> TECHNICAL_REVIEW
  -> VISUAL_REVIEW        (obligatorio si el cambio es visible)
  -> SECURITY_REVIEW
  -> QA_REVIEW
  -> READY_FOR_HUMAN_APPROVAL
  -> APPROVED
  -> INTEGRATED
```

Estados de bloqueo (paralelos, pueden interrumpir cualquier estado):

```text
BLOCKED
SECURITY_HOLD
VISUAL_CONFLICT
CONTRACT_CONFLICT
SCOPE_VIOLATION
REPEATED_FAILURE
REQUIRES_DECISION
REQUIRES_HUMAN_APPROVAL
```

### Reglas de transicion

1. No se puede saltar de `IMPLEMENTED` a `INTEGRATED`.
2. No se puede integrar sin parte de novedades.
3. No se puede integrar con S0 o S1 abiertos.
4. No se puede integrar con archivos fuera de la allowlist.
5. No se puede integrar sin `VISUAL_PASS` cuando el cambio es visible.
6. Pagos, migraciones, autenticacion, multi-tenant y secretos requieren aprobacion humana.
7. El Auditor solo audita un estado **congelado** (commit o snapshot fijo).
8. Toda transicion relevante se registra con fecha y responsable.

Quien mueve cada estado:

| Transicion | Responsable |
|---|---|
| `PLANNED` -> `SCOPED` -> `ASSIGNED` | Agente jefe |
| `ASSIGNED` -> `IN_PROGRESS` -> `IMPLEMENTED` | Jefe + subagentes de su cuadrilla |
| `IMPLEMENTED` -> `TECHNICAL_REVIEW` | Agente jefe |
| `TECHNICAL_REVIEW` -> `VISUAL_REVIEW` | Director de Arte (solo si es visible) |
| `VISUAL_REVIEW` -> `SECURITY_REVIEW` | Auditor Jefe |
| `SECURITY_REVIEW` -> `QA_REVIEW` | Auditor Jefe + `[QA-SQUAD]` |
| `QA_REVIEW` -> `READY_FOR_HUMAN_APPROVAL` | Auditor Jefe |
| `READY_FOR_HUMAN_APPROVAL` -> `APPROVED` -> `INTEGRATED` | **Humano** (aprobacion) + Ingeniero (integracion) |

## 3. Separacion de poderes

```text
Ingeniero:        implementa
Director de Arte: revisa lo visual
Auditor:          revisa el estado congelado
Humano:           aprueba lo critico
```

El Auditor **no** depende de una autorizacion textual del Ingeniero: su independencia esta
en la constitucion (no edita codigo) y en que audita un commit fijo.

## 4. Limites anti-bucle

```text
MAX_AUDIT_ROUNDS      = 3
MAX_CORRECTION_ROUNDS = 2
MAX_SAME_FINDING      = 2
```

- El mismo hallazgo dos veces -> `BLOCKED — REPEATED_UNRESOLVED_FINDING`.
- Superado el maximo de rondas -> `REQUIRES_HUMAN_APPROVAL`.

Implementacion real: OpenCode no cuenta rondas. Los limites se controlan en el flujo y los
verifica `[QA-SQUAD-06] Porton` antes de recomendar `LISTO_PARA_CERTIFICAR`.

## 5. Severidad de hallazgos

| Nivel | Significado | Efecto |
|---|---|---|
| `S0` | Critica (compromiso, perdida de datos, doble cobro, fuga de secretos) | Bloqueo obligatorio |
| `S1` | Alta (IDOR, escalamiento, contrato roto, idempotencia ausente en pagos) | Bloqueo obligatorio |
| `S2` | Media | Correccion o excepcion humana documentada |
| `S3` | Baja | Backlog o aceptacion documentada |
| `S4` | Informativa | Registro |

Un agente **no puede modificar sus propios criterios de aprobacion**. El estandar vive en
`docs/agents/GWS_SECURITY_AUDIT_STANDARD.md` y solo el humano lo cambia.

## 6. Protocolo de cuadrillas

En `ASSIGNED`, el jefe:

1. asigna alias operativo a cada subagente convocado;
2. registra la vinculacion en el `Task Manifest`;
3. notifica al subagente que debe firmar toda salida con
   `[CUADRILLA-xx] "Alias" · <id>`.

El parte de novedades incluye la **tabla obligatoria de cuadrilla** (ver §7). Si falta el
alias, si no se detalla la tarea atomica por miembro, o si un subagente actua fuera de su
cuadrilla: **`BLOCKED — UNIDENTIFIED_SQUAD_EXECUTION`**.

## 7. Parte de novedades

Cada tarea produce `docs/agent-reports/<task-id>.md` con:

- los tres bloques de `docs/agents/GWS_REPORT_TEMPLATES.md` (Ingeniero, Director de Arte,
  Auditor) segun corresponda;
- la **tabla de desglose por cuadrilla**:

| Cuadrilla / ID | Alias operativo | Subagente de origen | Tarea asignada | Archivos intervenidos | Estado final | Codigo de salida / Evidencia |
|---|---|---|---|---|---|---|

## 8. Roles de OpenCode en el flujo

| Momento | Herramienta real |
|---|---|
| Seleccionar jefe | selector de agente (`mode: primary`) |
| Delegar | herramienta `subagent` (recurso = ID del agente) |
| Pedir aprobacion humana | herramienta `question` (jefes) |
| Verificar registro | `opencode debug agents` |
| Congelar estado | commit de Git (`baseCommit` + commit candidato) |

Los subagentes no pueden usar `question`: escalan a su jefe, que si puede.

## 9. Reglas de convivencia

1. Un archivo, una unidad de trabajo activa: sin edicion concurrente sin coordinacion.
2. Los subagentes no amplian su alcance: si necesitan otro archivo, lo piden a su jefe.
3. Ningun agente declara "libre de errores": solo "sin hallazgos en lo revisado".
4. Ningun agente inventa validaciones, metricas ni evidencia.
5. Las decisiones van a `docs/agents/GWS_DECISION_LOG.md`.
6. Antes de declarar un control como activo, se inspecciona el **permiso efectivo** de la
   sesion (reglas del agente **++** reglas de la sesion, gana la ultima que coincide). Las
   reglas de sesion pueden anular un `deny` de agente (H-02): una regla de agente **no** es
   una politica no anulable.
7. La auditoria se ejecuta **sin** `browser` cuando la tarea no requiere investigacion
   externa. No se usa una sesion con `browser * allow` para afirmar que el Auditor navega
   bloqueado.
8. El Ingeniero Jefe no edita los documentos normativos (`docs/agents/**`), `docs/audit/**`
   ni el verificador (`tools/governance/**`): estan en `deny` (H-01). Si cree que un
   documento de gobierno debe cambiar, lo propone en su informe y decide el Humano.
