# GWS — Plantillas de reportes

> Plantillas obligatorias del sistema de gobierno. Copiar, completar y guardar en
> `docs/agent-reports/<task-id>.md`. **Sin secretos**: nunca transcribir valores sensibles.
>
> Identificadores: `taskId` = `GWS-YYYYMMDD-NN`.

---

## 1. `Task Manifest` (antes de empezar)

```text
# Task Manifest — <task-id>
titulo:
agenteJefe:            gws-chief-engineer | gws-art-experience-director | gws-chief-qa-security-auditor
baseCommit:            <hash corto>
alcance:               <que SI entra>
fueraDeAlcance:        <que NO entra>
allowlist:             <rutas permitidas, explicitas>
prohibido:             <rutas prohibidas>
compuertas:            tecnica | visual | seguridad | QA
subagentes:
  | Cuadrilla / ID | Alias operativo | Subagente | Tarea atomica |
notasHumanas:          <decisiones previas que condicionan la tarea>
```

Regla: sin `Task Manifest` no hay `INTEGRATED`.

---

## 2. Parte de novedades del Ingeniero Jefe

```text
# Parte tecnico — <task-id>
taskId:
titulo:
baseCommit:
commitCandidato:
agenteJefe:            gws-chief-engineer
subagentesUtilizados:  <IDs>
nominaDeTareas:        <lista>
archivosPermitidos:    <allowlist declarada>
archivosModificados:   <lista real>
archivosFueraDeAlcance:<lista o "ninguno">
comandosEjecutados:    <comando -> codigo de salida>
tests:                 <resultado real>
typecheck:             <resultado real>
lint:                  <resultado real o "no disponible">
build:                 <resultado real>
riesgosTecnicos:       <lista>
hallazgosDeSeguridad:  <lista o "ninguno">
revisionDirectorArte:  <VISUAL_PASS | VISUAL_PASS_WITH_CONDITIONS | VISUAL_REJECTED | VISUAL_REQUIRES_DECISION | no aplica>
bloqueadores:          <lista o "ninguno">
decisionIntegracion:   <INTEGRATED | BLOCKED | REQUIRES_HUMAN_APPROVAL>
proximoPaso:           <uno solo>
```

### Tabla obligatoria de desglose por cuadrilla

| Cuadrilla / ID | Alias operativo | Subagente de origen | Tarea asignada | Archivos intervenidos | Estado final (`PASS`/`FAIL`) | Codigo de salida / Evidencia |
|---|---|---|---|---|---|---|
| `[TECH-SQUAD-01]` | Cimiento | `gws-backend-domain-agent` | | | | |
| `[ART-SQUAD-03]` | Vitral | `gws-galaxy-experience-agent` | | | | |
| `[QA-SQUAD-03]` | Balanza | `gws-data-integrity-audit-agent` | | | | |

Un parte sin alias, sin tarea atomica por miembro o con un subagente fuera de su cuadrilla
se marca **`BLOCKED — UNIDENTIFIED_SQUAD_EXECUTION`**.

---

## 3. Informe del Director de Arte

```text
# Informe visual — <task-id>
taskId:
versionVisualRevisada:  <commit o snapshot>
agenteJefe:             gws-art-experience-director
subagentesUtilizados:   <IDs>
galaxiaOSuperficie:     <galaxia 1-6 | Umbral | satelite | superficie>
contextoVisual:         <narrativa y fondo esperados y observados>
archivosRevisados:      <lista>
jerarquia:
tipografia:
color:
contraste:
responsive:             <desktop | tablet | mobile>
accesibilidad:          <teclado, alt, tactil>
focusVisible:           <indicador, contraste >= 3:1, area >= 2px CSS (WCAG 2.2 SC 2.4.13)>
reducedMotion:          <comportamiento con prefers-reduced-motion>
estadosRevisados:       <default, hover, focus-visible, active, selected, disabled, loading, error, success>
satelitesVerificados:   <los cinco satelites o "no aplica">
hallazgos:              <archivo -> problema -> correccion exigida>
riesgos:                <riesgos visuales residuales>
evidencia:              <inspeccion renderizada / capturas server-local>
decision:               VISUAL_PASS | VISUAL_PASS_WITH_CONDITIONS | VISUAL_REJECTED | VISUAL_REQUIRES_DECISION
condiciones:            <solo si VISUAL_PASS_WITH_CONDITIONS: condiciones verificables>
observaciones:
proximoPaso:            <uno solo>
```

### Estados de decision visual

Solo se admiten **cuatro** estados. No se agregan estados visuales adicionales.
`VISUAL_PASS_WITH_CONDITIONS` **no** es aprobacion tecnica de seguridad, backend ni producto.

#### `VISUAL_PASS`

- **Definicion:** la superficie cumple el estandar de direccion de arte y el checklist completo.
- **Cuando utilizarlo:** contexto de galaxia correcto, fondo consecuente, contraste y foco
  correctos, estados completos, responsive verificado, reduced motion y sin dependencia
  exclusiva del color.
- **Cuando NO utilizarlo:** si queda un punto del checklist abierto o una correccion pendiente.
- **Evidencia requerida:** inspeccion renderizada real (desktop y mobile) + galaxia/superficie,
  contexto visual, estados revisados, contraste, foco, reduced motion, responsive, riesgos y
  checklist completo.
- **Bloqueos:** ninguno.
- **Proximo paso:** integrar.

#### `VISUAL_PASS_WITH_CONDITIONS`

- **Definicion:** la superficie es aprobable **solo** si se cumplen condiciones enumeradas y
  verificables. **No** es aprobacion tecnica de seguridad, backend ni producto.
- **Cuando utilizarlo:** defecto acotado, enumerable y no estructural, subsanable sin rehacer la
  superficie.
- **Cuando NO utilizarlo:** como aprobacion condicional de seguridad, datos o pagos; ni ante un
  defecto estructural.
- **Evidencia requerida:** la misma que `VISUAL_PASS` + lista de condiciones verificables (una
  por hallazgo).
- **Bloqueos:** la integracion queda bloqueada hasta re-verificar el cumplimiento de las
  condiciones.
- **Proximo paso:** cumplir las condiciones y volver a verificar.

#### `VISUAL_REJECTED`

- **Definicion:** la superficie incumple el estandar y no debe integrarse.
- **Cuando utilizarlo:** fondo que contradice la galaxia; plantilla generica; glow que impide
  leer; glassmorphism que reduce contraste; sin foco visible; sin reduced motion; sin estados;
  credencial que implica verificacion inexistente; boveda que implica proteccion legal
  inexistente; movimiento que distrae; metafora que domina la funcion.
- **Cuando NO utilizarlo:** para preferencias esteticas menores o "para no trabar".
- **Evidencia requerida:** hallazgo -> archivo -> correccion exigida, con la inspeccion que lo
  sustenta.
- **Bloqueos:** bloquea la integracion.
- **Proximo paso:** corregir y volver a revisar.

#### `VISUAL_REQUIRES_DECISION`

- **Definicion:** la decision excede la autoridad del Director de Arte (marca, tono, alcance,
  politica).
- **Cuando utilizarlo:** falta de criterio humano; cambio de identidad de marca; nueva galaxia o
  superficie publica; o el `VISUAL_CONFLICT` de `GWS_WORKFLOW.md`.
- **Cuando NO utilizarlo:** cuando el Director de Arte puede decidir por si mismo.
- **Evidencia requerida:** el motivo de la escalada y las opciones con su impacto.
- **Bloqueos:** bloquea la integracion hasta la decision humana.
- **Proximo paso:** escalar al humano con `question` y esperar.

---

## 4. Certificado del Auditor Jefe

```text
# Certificado QA & Seguridad — <task-id>
taskId:
baseCommit:
commitAuditado:
diffRevisado:           <--stat y archivos>
allowlistVsDiff:        <coincide | divergencias>
controlesAutenticacion:
controlesAutorizacion:
tenantIsolation:
baseDeDatos:            <estado o "sin superficie">
acid:
migraciones:            <estado o "sin superficie">
pagos:                  <estado o "sin superficie">
webhooks:               <estado o "sin superficie">
idempotencia:
secretos:               <arbol e historial>
uploads:                <estado o "sin superficie">
dependencias:
observabilidad:
resiliencia:
hallazgosPorSeveridad:
  S0: <n>
  S1: <n>
  S2: <n>
  S3: <n>
  S4: <n>
evidencia:              <por hallazgo: comando, archivo, linea>
rondasDeAuditoria:      <n de MAX_AUDIT_ROUNDS=3>
subagentesUtilizados:   <IDs con alias>
riesgosResiduales:
limitesDeLaRevision:    <que NO se reviso>
decision:               PASS | BLOCKED | REQUIRES_HUMAN_APPROVAL
observaciones:
```

### Tabla obligatoria de desglose por cuadrilla

| Cuadrilla / ID | Alias operativo | Subagente de origen | Tarea asignada | Archivos intervenidos | Estado final (`PASS`/`FAIL`) | Codigo de salida / Evidencia |
|---|---|---|---|---|---|---|
| `[QA-SQUAD-01]` | Lupa | `gws-security-verification-agent` | | | | |
| `[QA-SQUAD-02]` | Ensayos | `gws-qa-test-verification-agent` | | | | |
| `[QA-SQUAD-04]` | Sello | `gws-payment-risk-audit-agent` | | | | |
| `[QA-SQUAD-05]` | Cadena | `gws-supply-chain-audit-agent` | | | | |
| `[QA-SQUAD-06]` | Porton | `gws-release-gate-agent` | | | | |

---

## 5. Bloque de subagente (salida corta)

```text
Subagente:   <id>
Firma:       [CUADRILLA-xx] "Alias" · <id>
Padre:       <id del jefe>
Tarea:       <tarea atomica>
Archivos:    <intervenidos>
Comandos:    <comando -> codigo de salida>
Evidencia:   <archivo/linea o salida>
Estado:      PASS | FAIL | BLOCKED
Bloqueos:    <motivo o "ninguno">
```

---

## 6. Reglas de composicion de los reportes

1. Todo dato debe ser real y reproducible; si no se pudo verificar, se declara.
2. Los codigos de salida se transcriben tal cual, sin interpretarlos.
3. No se transcriben secretos, tokens, cookies ni PII.
4. Una salida sin firma de cuadrilla no se considera valida.
5. `PASS` significa "sin hallazgos en la superficie revisada", nunca "libre de errores".
6. Los estados visuales permitidos son exactamente `VISUAL_PASS`,
   `VISUAL_PASS_WITH_CONDITIONS`, `VISUAL_REJECTED` y `VISUAL_REQUIRES_DECISION`.
   `VISUAL_PASS_WITH_CONDITIONS` **no** es aprobacion tecnica de seguridad, backend ni
   producto.
