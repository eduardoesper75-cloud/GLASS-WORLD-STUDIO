# GWS — Registro de agentes

> Fuente de verdad del inventario de agentes. **Sin secretos.**
>
> | Dato | Valor |
> |---|---|
> | Fecha de verificacion | 2026-10-17 |
> | OpenCode | v2.0.28 (servicio de escritorio, `opencode-cli`) |
> | Fuente de configuracion de agentes | `.opencode/agents/*.md` (descubrimiento automatico) |
> | Configuracion del proyecto | `.opencode/opencode.json` (solo MCP `imap`) — **sin modificar** |
> | MCP conectado | `imap` |
> | MCP declarado e inerte | `ruflo` (en `.opencode/mcp.json`, esquema no compatible con V2) |

---

## 1. Agentes nativos detectados (7)

Verificados con `opencode debug agents`. Se mantienen intactos.

| ID | Nombre | Modo | Visible | Proposito |
|---|---|---|---|---|
| `build` | Build | primary | si | Agente por defecto |
| `plan` | Plan | primary | si | Exploracion y planificacion sin editar |
| `general` | General | subagent | si | Investigacion y tareas multi-paso |
| `explore` | Explore | subagent | si | Busqueda y lectura rapida |
| `compaction` | Compaction | primary | **oculto** | Compresion de contexto (interno) |
| `title` | Title | primary | **oculto** | Titulo de conversacion (interno) |
| `summary` | Summary | primary | **oculto** | Resumen (interno) |

Los internos (`compaction`, `title`, `summary`) no son seleccionables y no participan del
gobierno GWS.

## 2. Agentes jefes GWS (3)

| ID | Nombre visible | Tipo | Padre | Ruta | Edicion | Genera informes | Coordina |
|---|---|---|---|---|---|---|---|
| `gws-chief-engineer` | GWS Chief Engineer | primary | Humano | `.opencode/agents/gws-chief-engineer.md` | Amplia, con `ask` en superficies criticas | Si (parte tecnico) | `[TECH-SQUAD]` |
| `gws-art-experience-director` | GWS Art & Experience Director | primary | Humano | `.opencode/agents/gws-art-experience-director.md` | Solo superficie visual, con `ask` | Si (informe visual) | `[ART-SQUAD]` |
| `gws-chief-qa-security-auditor` | GWS Chief QA & Security Auditor | primary | Humano | `.opencode/agents/gws-chief-qa-security-auditor.md` | Solo `docs/agent-reports/**` y `docs/audit/**` | Si (certificado) | `[QA-SQUAD]` |

## 3. Subagentes GWS (17)

### 3.1 Cuadrilla Tecnica `[TECH-SQUAD]` — lider `gws-chief-engineer`

| Cuadrilla / ID | Alias | Subagente | Mision | Ruta |
|---|---|---|---|---|
| `[TECH-SQUAD-01]` | Cimiento | `gws-backend-domain-agent` | Logica de dominio, casos de uso, invariantes, reglas de marketplace, estados de ordenes y comisiones | `.opencode/agents/gws-backend-domain-agent.md` |
| `[TECH-SQUAD-02]` | Forja | `gws-data-acid-agent` | Modelo de datos, constraints, FK, indices, transacciones, idempotencia, migraciones, concurrencia | `.opencode/agents/gws-data-acid-agent.md` |
| `[TECH-SQUAD-03]` | Muralla | `gws-security-architecture-agent` | Threat modeling, auth, RBAC/ABAC, tenant isolation, secretos, endpoints, rate limiting | `.opencode/agents/gws-security-architecture-agent.md` |
| `[TECH-SQUAD-04]` | Boveda | `gws-payments-commerce-agent` | Checkout, idempotencia, webhooks, firmas, estados de pago, conciliacion, doble cobro | `.opencode/agents/gws-payments-commerce-agent.md` |
| `[TECH-SQUAD-05]` | Aduana | `gws-api-contracts-agent` | Contratos, validacion de entradas, esquemas, compatibilidad, versionado, errores, payloads | `.opencode/agents/gws-api-contracts-agent.md` |
| `[TECH-SQUAD-06]` | Vigia | `gws-performance-observability-agent` | Rendimiento, caching, timeouts, retries, backoff, logs, metricas, trazas, alertas | `.opencode/agents/gws-performance-observability-agent.md` |

### 3.2 Cuadrilla de Arte `[ART-SQUAD]` — lider `gws-art-experience-director`

| Cuadrilla / ID | Alias | Subagente | Mision | Ruta |
|---|---|---|---|---|
| `[ART-SQUAD-01]` | Brujula | `gws-ux-information-architecture-agent` | Arquitectura de informacion, recorridos, navegacion, estados, claridad, onboarding | `.opencode/agents/gws-ux-information-architecture-agent.md` |
| `[ART-SQUAD-02]` | Paleta | `gws-visual-system-agent` | Tokens, color, tipografia, espaciado, componentes, superficies, contraste | `.opencode/agents/gws-visual-system-agent.md` |
| `[ART-SQUAD-03]` | Vitral | `gws-galaxy-experience-agent` | Identidad de galaxias, hero sections, grids, navegacion contextual, continuidad narrativa | `.opencode/agents/gws-galaxy-experience-agent.md` |
| `[ART-SQUAD-04]` | Onda | `gws-motion-interaction-agent` | Microinteracciones, transiciones, feedback, motion reducido, ritmo | `.opencode/agents/gws-motion-interaction-agent.md` |
| `[ART-SQUAD-05]` | Horizonte | `gws-responsive-accessibility-agent` | Responsive, teclado, foco, contraste, legibilidad, reduced motion, tactil | `.opencode/agents/gws-responsive-accessibility-agent.md` |

### 3.3 Cuadrilla Auditora `[QA-SQUAD]` — lider `gws-chief-qa-security-auditor`

| Cuadrilla / ID | Alias | Subagente | Mision | Ruta |
|---|---|---|---|---|
| `[QA-SQUAD-01]` | Lupa | `gws-security-verification-agent` | Autorizacion, autenticacion, IDOR, escalamiento, tenant isolation, secretos, inputs, endpoints | `.opencode/agents/gws-security-verification-agent.md` |
| `[QA-SQUAD-02]` | Ensayos | `gws-qa-test-verification-agent` | Unit/integration/e2e, regresiones, casos borde, concurrencia, reintentos, errores | `.opencode/agents/gws-qa-test-verification-agent.md` |
| `[QA-SQUAD-03]` | Balanza | `gws-data-integrity-audit-agent` | ACID, constraints, migraciones, transacciones, consistencia, duplicacion, perdida, concurrencia | `.opencode/agents/gws-data-integrity-audit-agent.md` |
| `[QA-SQUAD-04]` | Sello | `gws-payment-risk-audit-agent` | Webhooks, firmas, replay, idempotencia, importes, estados, doble cobro, conciliacion | `.opencode/agents/gws-payment-risk-audit-agent.md` |
| `[QA-SQUAD-05]` | Cadena | `gws-supply-chain-audit-agent` | Dependencias, lockfiles, scripts, paquetes no autorizados, vulnerabilidades conocidas | `.opencode/agents/gws-supply-chain-audit-agent.md` |
| `[QA-SQUAD-06]` | Porton | `gws-release-gate-agent` | Verifica reportes y allowlist, comprueba compuertas, impide integracion incompleta | `.opencode/agents/gws-release-gate-agent.md` |

## 4. Matriz de capacidades

`E` = puede editar (con las guardas de su configuracion) · `A` = puede auditar ·
`C` = puede coordinar (lanzar subagentes).

| ID | E | A | C | Alcance de edicion |
|---|---|---|---|---|
| `gws-chief-engineer` | Si | No | Si (TECH) | Todo el proyecto, con `ask` en criticos |
| `gws-art-experience-director` | Si | No | Si (ART) | Superficie visual (`ask`) |
| `gws-chief-qa-security-auditor` | Solo informes | Si | Si (QA) | `docs/agent-reports/**`, `docs/audit/**` |
| `gws-backend-domain-agent` | Si | No | No | `apps/web/src/**` (sin UI), schemas, taxonomy |
| `gws-data-acid-agent` | Si | No | No | Idem + `pipeline/**` |
| `gws-security-architecture-agent` | Si | No | No | Idem (sin secretos) |
| `gws-payments-commerce-agent` | Si | No | No | Idem (pagos con `ask`) |
| `gws-api-contracts-agent` | Si | No | No | Idem (contratos) |
| `gws-performance-observability-agent` | Si | No | No | Idem (observabilidad) |
| `gws-ux-information-architecture-agent` | Si | No | No | UI: components, app (sin api), locales, public |
| `gws-visual-system-agent` | Si | No | No | UI (tokens y CSS) |
| `gws-galaxy-experience-agent` | Si | No | No | UI (galaxias) |
| `gws-motion-interaction-agent` | Si | No | No | UI (motion) |
| `gws-responsive-accessibility-agent` | Si | No | No | UI (responsive/a11y) |
| `gws-security-verification-agent` | No | Si | No | Solo informes |
| `gws-qa-test-verification-agent` | No | Si | No | Solo informes |
| `gws-data-integrity-audit-agent` | No | Si | No | Solo informes |
| `gws-payment-risk-audit-agent` | No | Si | No | Solo informes |
| `gws-supply-chain-audit-agent` | No | Si | No | Solo informes |
| `gws-release-gate-agent` | No | Si | No | Solo informes |

## 5. Permisos efectivos (comparado)

| Aspecto | Nativos | Jefes GWS | Subagentes GWS |
|---|---|---|---|
| Base | `*:* allow` + `.env` `ask` | `*:* allow` + `.env` `ask` | `*:* allow` + `.env` `ask` |
| `.env` (lectura) | `ask` | `deny` (plantillas `allow`) | `deny` (plantillas `allow` en TECH) |
| Credenciales `*.json` | sin regla (permitido) | `deny` | `deny` |
| `edit` | permitido | acotado por rol; **`deny`** sobre `docs/agents/**`, `docs/audit/**` y `tools/governance/**` | `deny` + allowlist por rol |
| `shell` | permitido | `ask` (Ing.) / `deny`+allowlist (Arte, QA) | `ask`+denies (TECH) / `deny`+allowlist (ART, QA) |
| `subagent` | build/plan sin limite | allowlist de su cuadrilla | `deny` |
| `question` | build/plan `allow` | `allow` | `deny` |
| `browser` (declarado / **efectivo**) | `deny` / `deny` | Ing./Auditor `deny` / **`allow`**; Arte `allow` / **`allow`** | ART `allow` / **`allow`**; TECH/QA `deny` / **`allow`** |
| `external_directory` | permitido | `deny` | `deny` |
| `imap_*` | permitido | `deny` | `deny` |
| `steps` | sin limite | sin limite | `30` |

> **Override de sesion (H-02).** La columna *efectivo* difiere de lo declarado para
> `browser`: cada sesion del proyecto guarda `browser * allow` y las reglas de sesion se
> evaluan **despues** de las del agente y ganan. Resultado: la denegacion declarada por el
> Ingeniero, el Auditor, TECH y QA **no se aplica**; y el `allow` de Arte no discrimina.
> Consecuencia operativa: **no** se declara el navegador bloqueado y la auditoria se corre
> sin `browser` cuando la tarea no requiere investigacion externa (ver §7.1 de
> `GWS_AGENT_GOVERNANCE.md`). Se corrige aqui el §5 anterior, que afirmaba `deny` efectivo.

## 6. Limitaciones de OpenCode 2.0.28 registradas

1. Rutas anidadas cambian el ID del agente (por eso los archivos son planos).
2. `shell` se evalua por texto best-effort, sin garantia total.
3. No existe primitivo de cuadrilla, alias ni firma.
4. No existe contador de rondas de auditoria.
5. No existe bloqueo de edicion concurrente por archivo.
6. `ask` depende de un cliente interactivo; los `deny` siempre se aplican.
7. `request` (temperatura y demas) se preserva pero aun no se envia al modelo.
8. `policies` (hard-deny no anulable) existe y **no** se aplico todavia (DEC-0009).
9. El MCP `ruflo` declarado en `.opencode/mcp.json` no lo carga V2 (esquema distinto);
   `imap` es el unico MCP conectado y no se modifico.
10. Las reglas de sesion se evaluan **despues** de las del agente y ganan: un `deny` de
    agente puede ser anulado por una regla de sesion. Es la causa raiz de H-02 (ver §5) y la
    razon por la que el permiso efectivo debe inspeccionarse al inicio de cada sesion.

## 7. Verificacion

```powershell
opencode debug config   # fuentes de configuracion
opencode debug agents   # inventario real de agentes reconocidos
```

Resultado esperado: los 7 nativos + los 20 agentes GWS, cada uno con su lista de permisos.

> Nota: el endpoint HTTP `/api/agent` del servicio de escritorio resolvio la ubicacion en
> el directorio home durante el diagnostico, por lo que **no** sirve para verificar los
> agentes del proyecto. `opencode debug agents` y `opencode debug config` si resuelven el
> directorio del proyecto.

## 8. Firma de cuadrilla

Formato obligatorio en toda salida de subagente:

```text
[CUADRILLA-xx] "Alias" · <id-del-subagente>
```

Ejemplo: `[TECH-SQUAD-03] "Muralla" · gws-security-architecture-agent`
