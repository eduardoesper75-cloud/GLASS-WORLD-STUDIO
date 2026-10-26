# GWS — Registro de decisiones

> Registro cronologico de decisiones del sistema de gobierno de agentes.
> **Sin secretos.** Convencion: `DEC-NNNN`.

| Campo | Descripcion |
|---|---|
| Fecha | `AAAA-MM-DD` |
| Decision | que se decidio |
| Motivo | por que |
| Evidencia | como se verifico |
| Responsable | agente o humano |
| Impacto | alcance |
| Aprobacion humana | `pendiente` / `otorgada` / `no requerida` |
| Reversibilidad | facil / media / dificil |
| Estado | `vigente` / `reemplazada` |

---

## DEC-0001 — Agentes en archivos planos

- **Fecha:** 2026-10-17
- **Decision:** Los 20 agentes GWS viven en `.opencode/agents/<id>.md` (plano), no en
  `.opencode/agents/subagents/`.
- **Motivo:** En OpenCode V2 una ruta anidada pasa a formar parte del ID del agente
  (`agents/team/reviewer.md` -> `team/reviewer`). Usar `subagents/` habria cambiado el nombre
  obligatorio y habria roto la allowlist de `subagent` de los jefes (el recurso de esa regla
  es el ID del agente).
- **Evidencia:** Documentacion de agentes de OpenCode V2 (seccion Locations).
- **Responsable:** `gws-chief-engineer` (arquitecto de configuracion)
- **Impacto:** Los IDs coinciden exactamente con los nombres obligatorios del pedido.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** facil (mover archivos, pero cambiaria los IDs)
- **Estado:** vigente

## DEC-0002 — No modificar `.opencode/opencode.json`

- **Fecha:** 2026-10-17
- **Decision:** No se agrego ningun bloque a `.opencode/opencode.json` ni a
  `.opencode/mcp.json`.
- **Motivo:** Los agentes en Markdown se descubren automaticamente; no hace falta declararlos.
  Modificar el archivo existente agregaba riesgo sin beneficio y exponia la configuracion del
  MCP `imap` (que el pedido prohibe alterar).
- **Evidencia:** `git diff` sin cambios sobre esos archivos; `opencode debug config` sigue
  mostrando el mismo documento.
- **Responsable:** `gws-chief-engineer`
- **Impacto:** Riesgo cero para la configuracion vigente; `imap` y Ruflo intactos.
- **Aprobacion humana:** no requerida
- **Reversibilidad:** no aplica
- **Estado:** vigente

## DEC-0003 — El Auditor no puede editar codigo

- **Fecha:** 2026-10-17
- **Decision:** `gws-chief-qa-security-auditor` y los 6 subagentes `[QA-SQUAD]` tienen
  `edit` denegado sobre todo el proyecto, con la unica excepcion de
  `docs/agent-reports/**` y `docs/audit/**`.
- **Motivo:** El pedido exige que el Auditor no escriba ni corrija codigo de produccion, y
  que no pueda modificar sus propios criterios (`docs/agents/**` queda denegado por quedar
  fuera de la excepcion).
- **Evidencia:** Lista `permissions` de los 7 archivos `*qa*` / `gws-chief-qa-*`.
- **Responsable:** `gws-chief-qa-security-auditor`
- **Impacto:** Independencia real del auditor, impuesta por la herramienta.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** facil
- **Estado:** vigente

## DEC-0004 — Lectura de `.env` denegada (mas estricto que el default)

- **Fecha:** 2026-10-17
- **Decision:** Todos los agentes GWS tienen `read` y `edit` denegados sobre `*.env` y
  `*.env.*`, con permiso solo para `.env.example` y `.env.production.example` (plantillas
  versionadas).
- **Motivo:** OpenCode por defecto pregunta (`ask`) al leer `.env`. El pedido exige que los
  secretos "nunca" se impriman. Denegar es verificable; preguntar depende del cliente.
- **Evidencia:** Reglas `read`/`edit` en los 20 archivos; `.gitignore` confirma que
  `.env.example` y `.env.production.example` si se versionan.
- **Responsable:** `gws-security-architecture-agent` (propuesta) / `gws-chief-engineer`
  (implementacion)
- **Impacto:** Ningun agente GWS puede leer ni modificar secretos.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** facil
- **Estado:** vigente

## DEC-0005 — Los subagentes no anidan ni preguntan al usuario

- **Fecha:** 2026-10-17
- **Decision:** Los 17 subagentes tienen `subagent: deny` y `question: deny`.
- **Motivo:** Evita cadenas de delegacion no supervisadas y evita que un subagente saltee a su
  jefe para preguntarle al usuario. Las decisiones suben por la jerarquia.
- **Evidencia:** Reglas `subagent` / `question` en los 17 archivos.
- **Responsable:** `gws-chief-engineer`
- **Impacto:** Profundidad de delegacion de un nivel, gobernable.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** facil
- **Estado:** vigente

## DEC-0006 — Navegador: regla declarada por agente y override de sesión (corregida)

- **Fecha:** 2026-10-17 (corregida 2026-10-18)
- **Decision:** `browser` en `allow` para el Director de Arte y los 5 subagentes
  `[ART-SQUAD]`; `browser` en `deny` para el resto de los agentes GWS. Es la **regla declarada
  en los archivos de agente**, no un bloqueo tecnico absoluto.
- **Permiso efectivo observado:** con el cliente de escritorio, cada sesion del proyecto
  guarda `[{"action":"browser","resource":"*","effect":"allow"}]` (`session_v2.permission`,
  lectura de solo lectura). Las reglas efectivas son **agente ++ sesion**. Por eso
  `browser * allow` **permanece efectivo** cuando esta presente, y la denegacion declarada
  para el Ingeniero, el Auditor, los 6 subagentes `[TECH-SQUAD]` y los 6 `[QA-SQUAD]` **no se
  aplica**: todos pueden navegar en esa sesion.
- **Precedencia de reglas:** `agente ++ sesion`, donde gana la **ultima** regla que coincide
  (`findLast`); luego las aprobaciones guardadas se agregan como `allow`. Un `deny` presente en
  agente++sesion produce `deny` duro. La plataforma agrega `browser * deny` **al final** del
  agente, por lo que el `allow` declarado por el Director de Arte y `[ART-SQUAD]` tampoco gana
  a nivel de agente.
- **Override de sesion:** una regla de sesion puede anular un `deny` de agente. La regla de
  agente **no** es una politica no anulable.
- **Consecuencia para auditoria:** el Auditor **no** debe considerarse aislado del navegador en
  esa sesion. La sesion de auditoria debe **iniciar sin `browser`** cuando la tarea no requiera
  investigacion externa.
- **Mejora estructural pendiente:** una politica administrada o un hard-deny global (bloque
  `policies`) requiere una **decision independiente** (ver DEC-0009) y no se aplica aqui.
- **Motivo:** La verificacion visual exige inspeccionar lo renderizado en desktop y mobile; el
  resto de los roles no necesita el navegador.
- **Evidencia:** `opencode debug agents` (regla declarada por agente) y lectura de solo lectura
  de `session_v2.permission` (regla de sesion). Detalle en `GWS_PRE_APPROVAL_AUDIT.md` (H-02).
- **Responsable:** `gws-art-experience-director` (declaracion) / Humano (mejora estructural)
- **Impacto:** La revision visual es posible; la denegacion declarada **no** es una garantia
  tecnica mientras exista `browser * allow` en la sesion.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** facil
- **Estado:** vigente (corregida 2026-10-18) — H-02 `DOCUMENTED_WITH_COMPENSATING_CONTROL`

## DEC-0007 — Cuadrillas y alias son convencion de reporte

- **Fecha:** 2026-10-17
- **Decision:** Las etiquetas `[TECH-SQUAD-xx]`, `[ART-SQUAD-xx]`, `[QA-SQUAD-xx]` y los
  alias operativos se implementan como convencion de documentacion y firma, no como
  configuracion del motor.
- **Motivo:** OpenCode V2 no tiene concepto de cuadrilla, alias ni firma. Simular una
  restriccion inexistente seria deshonesto. El ancla tecnica equivalente es la allowlist de
  `subagent` (cada jefe solo puede lanzar los IDs de su cuadrilla).
- **Evidencia:** Documentacion de permisos de OpenCode V2 (accion `subagent`, recurso = ID de
  agente). Tablas de cuadrilla en `GWS_AGENT_REGISTRY.md`.
- **Responsable:** Humano (directiva de la adenda) / `gws-chief-engineer` (implementacion)
- **Impacto:** La trazabilidad por cuadrilla se verifica en los partes, no por la herramienta.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** facil
- **Estado:** vigente

## DEC-0008 — 17 subagentes, no 18

- **Fecha:** 2026-10-17
- **Decision:** Se crean los 17 subagentes nombrados explicitamente en el pedido (6 TECH +
  5 ART + 6 QA). No se inventa un decimoctavo.
- **Motivo:** El "resultado esperado" menciona 18 subagentes, pero la enumeracion del pedido y
  su seccion de archivos listan 17. Inventar uno violaria la regla de no simular contenido.
- **Evidencia:** Recuento de los nombres obligatorios y de la lista de rutas del pedido.
- **Responsable:** `gws-chief-engineer`
- **Impacto:** Diferencia conocida y declarada respecto del texto del pedido.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** facil (agregar un decimoctavo si el humano nombra el rol)
- **Estado:** vigente

## DEC-0009 — `policies` de hard-deny no aplicado todavia

- **Fecha:** 2026-10-17
- **Decision:** No se aplico el bloque `policies` (hard-deny no anulable por aprobaciones
  guardadas) que OpenCode V2 soporta.
- **Motivo:** Requiere modificar `.opencode/opencode.json`, un archivo compartido que afecta
  tambien a los agentes nativos, y el pedido prohibe sobrescribir sin respaldo ni diff. Se
  documenta como mejora pendiente sujeta a aprobacion humana.
- **Evidencia:** Seccion "Politicas" de la documentacion de permisos de V2; §11 de
  `GWS_AGENT_GOVERNANCE.md`.
- **Responsable:** Humano
- **Impacto:** Hoy el control de comandos peligrosos se apoya en `deny` de permisos +
  aprobacion humana; el hard-deny seria una capa adicional.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** facil
- **Estado:** vigente

## DEC-0010 — Sin commits, sin push, sin despliegues en esta fase

- **Fecha:** 2026-10-17
- **Decision:** El trabajo de esta fase queda en el arbol de trabajo sin commitear.
- **Motivo:** El pedido prohibe commits automaticos, push y despliegues.
- **Evidencia:** `git status` muestra los archivos nuevos sin commit.
- **Responsable:** Humano (aprobacion) / `gws-chief-engineer` (ejecucion)
- **Impacto:** La estructura queda lista para revision humana antes de incorporarse.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** no aplica
- **Estado:** vigente

## DEC-0011 — Endurecimiento de secretos por antecedente real (S1)

- **Fecha:** 2026-10-17
- **Decision:** El estandar de auditoria incluye un bloque obligatorio de secretos, con
  escaneo de arbol e historial, y los agentes tienen la lectura de `.env` y de archivos de
  credenciales denegada.
- **Motivo:** Antecedente documentado en `docs/security/GWS_S1_Remediacion_Credenciales.md`
  (credenciales en texto plano dentro de un documento versionado).
- **Evidencia:** Ese documento de remediacion (sin transcribir valores).
- **Responsable:** `gws-chief-qa-security-auditor`
- **Impacto:** La fuga se convierte en control permanente.
- **Aprobacion humana:** pendiente
- **Reversibilidad:** facil
- **Estado:** vigente
