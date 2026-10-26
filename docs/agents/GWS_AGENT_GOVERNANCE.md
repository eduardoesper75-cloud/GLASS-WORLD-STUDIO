# GWS — Gobierno de agentes

> **Que es esto:** el marco de gobierno de los agentes de Glass World Studio (GWS) en
> OpenCode. Define jerarquia, autoridad, limites, permisos, trazabilidad y compuertas.
> **No** contiene codigo de producto ni secretos.
>
> **Estado de esta fase:** estructura documentada **y** creada como archivos de
> configuracion. Pendiente de **aprobacion humana** antes de usarse para construir producto.
>
> | Dato | Valor |
> |---|---|
> | Fecha de creacion | 2026-10-17 |
> | OpenCode | v2.0.28 |
> | Agentes jefes | 3 |
> | Subagentes | 17 (ver §9, discrepancia con "18" del pedido) |
> | Config de agentes | `.opencode/agents/*.md` (20 archivos) |
> | Configuracion modificada | **ninguna** (no se toco `.opencode/opencode.json`) |
> | Codigo de producto | **sin cambios** |

---

## 1. Objetivo

Dirigir, contextualizar, ejecutar, auditar y documentar el desarrollo futuro de GWS con
responsabilidades separadas: quien implementa no se aprueba a si mismo, y quien aprueba lo
visual no gobierna lo tecnico.

## 2. Jerarquia

```text
Humano / Responsable del proyecto
              |
    GWS Chief Engineer  (gws-chief-engineer)
              |
    +---------+----------------------------+
    |                                      |
[TECH-SQUAD] (6)                GWS Art & Experience Director (gws-art-experience-director)
                                           |
                                   [ART-SQUAD] (5)

GWS Chief QA & Security Auditor (gws-chief-qa-security-auditor)
  +-- audita al Ingeniero
  +-- audita al Director de Arte
  +-- audita a los subagentes
  +-- revisa evidencia
  +-- tiene autoridad de veto (S0/S1)
      |
      [QA-SQUAD] (6)
```

Reglas de gobierno (1–10):

1. El Ingeniero coordina la implementacion.
2. El Director de Arte gobierna la aprobacion visual.
3. El Auditor revisa independientemente.
4. Ningun subagente puede ampliar su alcance.
5. Ningun agente puede aprobar su propio trabajo critico.
6. El Auditor no edita codigo de produccion.
7. El Ingeniero no puede anular un veto S0 o S1.
8. Los cambios criticos requieren aprobacion humana.
9. Las decisiones quedan registradas (`docs/agents/GWS_DECISION_LOG.md`).
10. No hay edicion concurrente del mismo archivo sin coordinacion explicita.

## 3. Donde vive la configuracion (decision de ruta)

OpenCode V2 descubre agentes en Markdown de dos formas:

- `~/.config/opencode/agents/<nombre>.md` (global, todos los proyectos);
- `.opencode/agents/<nombre>.md` (proyecto).

**Una ruta anidada pasa a formar parte del ID del agente.** La documentacion de V2 lo
indica de forma explicita: `.opencode/agents/team/reviewer.md` produce el ID
`team/reviewer`.

El pedido original proponia `.opencode/agents/subagents/gws-*.md`. Si se usara esa ruta, el
ID de cada subagente seria `subagents/gws-...`, y se romperian dos cosas: el nombre
obligatorio del subagente **y** la allowlist de `subagent` de los jefes (el recurso de la
regla es el ID del agente).

**Decision:** todos los agentes viven **planos** en `.opencode/agents/`, de modo que el ID
sea exactamente el nombre obligatorio (`gws-backend-domain-agent`, etc.). Registrado como
DEC-0001 en `docs/agents/GWS_DECISION_LOG.md`.

```text
.opencode/agents/
  gws-chief-engineer.md
  gws-art-experience-director.md
  gws-chief-qa-security-auditor.md
  gws-backend-domain-agent.md  ...  (17 subagentes)
```

## 4. Mecanismo de registro

Los agentes en Markdown **se descubren automaticamente**: no hace falta declararlos en
`opencode.json`. Por eso esta fase **no modifico** `.opencode/opencode.json` (que sigue
teniendo unicamente la configuracion del MCP `imap`) ni `.opencode/mcp.json` (Ruflo, sin
tocar). Cero riesgo para lo existente. Registrado como DEC-0002.

Verificacion obligatoria (no alcanza con que el archivo exista):

```powershell
# desde la raiz del proyecto
opencode debug config   # debe listar el documento y el directorio .opencode
opencode debug agents   # debe listar los 20 agentes GWS ademas de los 7 nativos
```

## 5. Los cinco estados de un agente

Distincion que **no** se debe saltear (un texto del modelo no es una configuracion):

| Estado | Significado |
|---|---|
| `DOCUMENTED` | Existe la definicion escrita. |
| `FILED` | Existe el archivo en la ruta que OpenCode descubre. |
| `REGISTERED` | OpenCode lo lista (`opencode debug agents` / API `/api/agent`). |
| `SELECTABLE` | Aparece en el selector de agentes (aplicable a `mode: primary`). |
| `EXECUTABLE` | Puede recibir una tarea y ejecutarla con sus permisos. |

Si los archivos existen pero OpenCode no los reconoce, el estado correcto es
`DOCUMENTED_BUT_NOT_REGISTERED` y hay que reportarlo como limitacion, no como exito.

## 6. Modelo de permisos

Cada agente declara `permissions` como una lista ordenada de
`{ action, resource, effect }`. **Gana la ultima regla que coincide.** Todo agente arranca
con la base de OpenCode `*:* allow` + `.env` en `ask`, y las reglas del agente se agregan
**despues**.

Acciones usadas: `read`, `edit` (cubre `edit`/`write`/`patch`), `shell`, `glob`, `grep`,
`subagent`, `question`, `skill`, `webfetch`, `websearch`, `browser`, `external_directory` y
`imap_*` (MCP).

Resumen por rol:

| Rol | Edicion | Shell | Subagentes | Navegador | Secretos |
|---|---|---|---|---|---|
| Ingeniero Jefe | amplia + `ask` en criticos; **`deny` sobre el gobierno** (`docs/agents/**`, `docs/audit/**`, `tools/governance/**`) | `ask` + allowlist + denies duros | solo `[TECH-SQUAD]` | deny (declarado; ver §7.1) | nunca |
| Director de Arte | solo superficie visual, con `ask` | deny + allowlist de validacion | solo `[ART-SQUAD]` | allow (declarado; ver §7.1) | nunca |
| Auditor Jefe | solo sus informes | deny + allowlist no destructiva | solo `[QA-SQUAD]` | deny (declarado; ver §7.1) | nunca |
| Subagente TECH | su dominio + `ask` en criticos | `ask` + allowlist + denies | deny (sin anidar) | deny (declarado; ver §7.1) | nunca |
| Subagente ART | superficie visual | deny + allowlist de validacion | deny | allow (declarado; ver §7.1) | nunca |
| Subagente QA | solo sus informes | deny + allowlist no destructiva | deny | deny (declarado; ver §7.1) | nunca |

Endurecimientos reales aplicados (mas estrictos que el default de OpenCode):

- **Lectura de `.env` denegada** en todos los agentes GWS (OpenCode por defecto usa `ask`).
  Se permite leer `.env.example` y `.env.production.example` (plantillas versionadas).
- **Archivos de credenciales denegados** (`*credentials*.json`, `client_secret*.json`,
  `token*.json`, `service-account*.json`) para lectura y escritura.
- **`imap_*` denegado** en los 20 agentes: el gobierno no manda correo.
- **Subagentes no pueden lanzar subagentes** ni hacer preguntas al usuario: escalan a su jefe.
- **`external_directory` denegado** en todos los agentes GWS.
- **Gobierno protegido (H-01, aplicado):** `edit` sobre los documentos normativos
  (`docs/agents/**`), la carpeta de auditoria (`docs/audit/**`) y el verificador
  (`tools/governance/**`) es **`deny`** para el Ingeniero Jefe; los otros 19 agentes ya lo
  tenian denegado. El Ingeniero conserva la ruta operativa `docs/agent-reports/**`. La accion
  `edit` cubre las herramientas `edit`/`write`/`patch`, asi que la denegacion no se puede
  esquivar cambiando de herramienta.

## 7. Requisitos que OpenCode 2.0.28 no puede imponer tecnicamente

Honestidad de herramienta: no se simula una restriccion que el motor no aplica.

| Requisito del pedido | Que hace OpenCode | Control compensatorio |
|---|---|---|
| "shell destructivo: denegado" con certeza total | Los recursos de `shell` son **texto analizado de forma best-effort**; no hay garantia de reconocer todo comando peligroso. | `shell` en `ask` (Ingeniero/TECH) o `deny` (Arte/QA) como base; allowlist corta; denies explicitos (`*install*`, `*npx *`, `*git push*`, `*rm -rf*`, `*Remove-Item*`, `*vercel --prod*`, `*drop database*`); y aprobacion humana para lo que no esta en la allowlist. |
| "pagos / migraciones / auth / tenancy requieren aprobacion humana" como regla semantica | Solo existen `allow` / `ask` / `deny` por accion y recurso. | Reglas `ask` sobre las superficies criticas (`**/payments/**`, `**/auth/**`, `**/billing/**`, `**/webhooks/**`, `**/migrations/**`, `**/*.prisma`, `**/app/api/**`) + obligacion contractual de pedir `question` + verificacion del Auditor. |
| "no aprueba su propio trabajo" | No hay noción de "aprobador" en el motor. | Separacion real de agentes: el Auditor tiene `edit` denegado sobre el codigo y compuertas obligatorias en el workflow. |
| Coordinacion de edicion concurrente del mismo archivo | No existe bloqueo de archivos por agente. | Regla 10 del gobierno (procedural) + `Task Manifest` con allowlist + una sola unidad de trabajo activa por archivo. |
| `ask` como "espera al humano" | `ask` requiere un cliente interactivo; en modo no interactivo el cliente debe decidir. Los `deny` configurados **siempre** se aplican. | Todo lo critico se modela con `deny`, no solo con `ask`; y el flujo exige aprobacion humana registrada. |
| Cuadrillas `[TECH-SQUAD-xx]`, alias y firma | No existe el concepto de cuadrilla ni de firma en el motor. | Convencion de reporte obligatoria (§8) + el ancla tecnica equivalente es la allowlist de `subagent` (cada jefe solo puede lanzar los IDs de su cuadrilla). |
| `MAX_AUDIT_ROUNDS` / `MAX_CORRECTION_ROUNDS` / `MAX_SAME_FINDING` | No hay contador de rondas. | Limites procedurales en `docs/agents/GWS_WORKFLOW.md`, verificados por el `[QA-SQUAD-06] Porton`. |
| Anti-bucle de ejecucion | `steps` limita pasos del modelo por turno (no es un contador semantico). | `steps: 30` en los 17 subagentes para acotar tareas; los limites de auditoria son procedurales. |
| Hard-deny que ninguna aprobacion guardada pueda anular | Existe `policies` (`tool.use`), y las politicas globales/Console mandan sobre el proyecto. | **No aplicado todavia**: agregarlo exige tocar `.opencode/opencode.json` (requiere aprobacion humana + respaldo). Ver DEC-0009 y §11. |
| Ajustes de `request` (temperatura, etc.) por agente | El runner preserva los valores pero **aun no los envia** con las peticiones al modelo. | No se uso `request` en ningun agente. |
| "El Ingeniero no puede modificar los documentos que lo gobiernan" | No existe el concepto de "documento protegido": se modela con reglas `edit` por recurso. | **Aplicado (H-01):** `edit deny` sobre `docs/agents/**`, `docs/audit/**` y `tools/governance/**` en `gws-chief-engineer`. El verificador comprueba el efecto **efectivo** (no solo la regla literal) y falla si se revierte. |
| "El Auditor tiene el navegador bloqueado" | **Falso en la practica (H-02):** cada sesion del proyecto guarda `browser * allow`; las reglas de sesion se evaluan despues de las del agente y ganan. Ademas la plataforma agrega `browser * deny` al final de cada agente, asi que un `browser allow` declarado (Director de Arte) tampoco gana a nivel de agente. | **Control compensatorio (H-02, `DOCUMENTED_WITH_COMPENSATING_CONTROL`):** precedencia documentada (§7.1), obligacion de inspeccionar el permiso efectivo al inicio de cada sesion, prohibicion de declarar el navegador bloqueado cuando no lo esta y sesion de auditoria sin `browser * allow`. La solucion robusta exige `policies` administradas (DEC-0009). |

### 7.1 Precedencia real de permisos y override de sesion (H-02)

El motor resuelve el efecto asi:

1. reglas **del agente ++ reglas de la sesion**, y gana la **ultima** que coincide
   (`findLast`);
2. si alguna de esas reglas da `deny`, el resultado es `deny` duro (no lo anulan las
   aprobaciones guardadas);
3. si no hay `deny`, se agregan como `allow` las aprobaciones guardadas del proyecto y, si
   alguna coincide con `ask`, el resultado es `ask`; si no, `allow`.

Consecuencias **verificadas** en este proyecto (evidencia en §C de la auditoria):

- **Las reglas de sesion pueden anular un `deny` de agente.** Cada sesion del proyecto guarda
  `[{"action":"browser","resource":"*","effect":"allow"}]`, por lo que la denegacion de
  `browser` **declarada** por el Ingeniero, el Auditor, los 6 subagentes TECH y los 6 QA
  **no se aplica**: todos navegan.
- La plataforma agrega `browser * deny` al final de la lista de cada agente; por eso el
  `browser allow` declarado por el Director de Arte y los `[ART-SQUAD]` tampoco gana a nivel
  de agente.
- **Una regla de agente no equivale a una politica no anulable.** La unica capa no anulable
  es `policies` (DEC-0009), aun no aplicada.

Reglas operativas obligatorias (control compensatorio):

1. **Inspeccionar el permiso efectivo al inicio de cada sesion** antes de declarar cualquier
   control como activo (`opencode debug agents` + lectura de `session_v2.permission`).
2. **Prohibido declarar el navegador bloqueado** cuando la sesion tiene `browser * allow`.
3. **Sesion de auditoria segura:** la auditoria se ejecuta **sin** `browser` cuando la tarea
   no requiere investigacion externa; no se usa una sesion con `browser * allow` para
   afirmar que el Auditor navega bloqueado.
4. La solucion robusta (no anulable) requiere `policies` administradas o un mecanismo
   equivalente (DEC-0009), fuera de esta orden.

## 8. Cuadrillas, alias y firma obligatoria

Cada jefe administra una cuadrilla con etiqueta unica:

| Cuadrilla | Etiqueta | Lider | Miembros |
|---|---|---|---|
| Tecnica de Integracion | `[TECH-SQUAD-xx]` | `gws-chief-engineer` | 6 |
| Direccion de Arte y Experiencia | `[ART-SQUAD-xx]` | `gws-art-experience-director` | 5 |
| Auditora de Calidad y Ciberseguridad | `[QA-SQUAD-xx]` | `gws-chief-qa-security-auditor` | 6 |

Protocolo (en `ASSIGNED`):

1. El jefe asigna alias operativo al subagente (tabla completa en
   `docs/agents/GWS_AGENT_REGISTRY.md`).
2. La vinculacion se registra en el `Task Manifest`.
3. El subagente **firma toda salida** con `[CUADRILLA-xx] "Alias" · <id>`.

Si un parte omite el alias, no detalla la tarea atomica por miembro, o un subagente actua
fuera de su cuadrilla, el ciclo se marca
**`BLOCKED — UNIDENTIFIED_SQUAD_EXECUTION`**.

## 9. Alcance de esta fase (que se creo y que no)

Creado: 20 agentes + 6 documentos de gobierno + el directorio de informes
(`docs/agent-reports/`).

Discrepancia registrada: el pedido enumera **17** subagentes (6 TECH + 5 ART + 6 QA) y §6
lista **17** archivos, pero el "resultado esperado" menciona **18**. Se crearon los 17
nombrados explicitamente. No se invento un decimoctavo. Registrado como DEC-0008.

**No** se hizo: codigo de producto, cambios de UI, backend, base de datos, pagos,
migraciones, dependencias, `.env`, Ruflo, `imap`, commits, push ni despliegues.

## 10. Como continuar

1. **Aprobacion humana** de esta estructura.
2. Verificar registro real (`opencode debug agents`).
3. Si se aprueba, opcional: aplicar `policies` de hard-deny (DEC-0009).
4. Crear el primer `Task Manifest` y empezar por algo acotado y no critico.

## 11. Mejora pendiente recomendada (requiere decision humana)

`opencode.json` acepta un bloque `policies` que convierte `allow`/`ask` en `deny` y que
**ninguna aprobacion guardada puede anular**:

```jsonc
{
  "policies": [
    { "action": "tool.use", "resource": "shell:sudo *", "effect": "deny" },
    { "action": "tool.use", "resource": "shell:*git push*", "effect": "deny" }
  ]
}
```

No se aplico en esta fase porque modifica un archivo de configuracion compartido y afecta
tambien a los agentes nativos (`build`). Requiere aprobacion humana y respaldo previo.
