# Auditoría #004 — Secretos, Twelve-Factor y estado de Ruflo

**Fecha:** 2026-10-05
**Alcance:** ORDEN #004 (GWS-4) — FASE 0, FASE 2 (parcial) y FASE 3.
**Método:** inspección del árbol de trabajo + `git ls-files` / `git check-ignore`.
**Regla de redacción aplicada:** ningún valor de secreto se reproduce en este
documento. Solo nombres de clave, rutas y conteos.

> **Alcance real:** esta auditoría cubre las fases ejecutables. La FASE 1
> (documentación CF-01…CF-265) **no** se ejecutó por bloqueos de insumo
> documentados en `docs/ops/CODIGO-DE-FUEGO.md` y en el reporte a Jorge.
> Este informe **no** certifica el código de fuego completo.

---

## 1. Auditoría de secretos

### 1.1 Archivos de entorno (valores NO inspeccionados)

`CLAUDE.md §3.1` prohíbe que un agente de IA lea credenciales. Se listaron
**únicamente nombres de clave**, nunca valores.

| Archivo | Claves | Estado en git |
|---|---|---|
| `.env` (raíz) | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`, `PG_SUPERUSER_PASSWORD`, `JWT_SECRET`, `UV_THREADPOOL_SIZE` | Ignorado (`.gitignore:9`) |
| `apps/web/.env.local` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` | Ignorado (`apps/web/.gitignore:13`) |
| `.env.example` (raíz) | 14 claves | Versionado a propósito (plantilla) |
| `apps/web/.env.example` | 3 claves | Versionado a propósito (plantilla) |

**Resultado: sin secretos de entorno versionados.** Ninguna de las 12 claves
con valor real está en el índice de git.

### 1.2 Secretos en código fuente

Barrido de 269 archivos TypeScript/JavaScript versionados contra patrones de
token (`sk-*`, `ghp_*`, `AKIA*`, PEM private key, JWT `eyJ*.eyJ*`).

**Resultado: 0 coincidencias.** No hay credenciales hardcodeadas en el código
trackeado.

### 1.3 Hallazgos que requieren decisión de Jorge

| ID | Severidad | Hallazgo | Estado | Evidencia |
|---|---|---|---|---|
| **H-01** | MEDIA | `.swarm/memory.db** commiteado (172 032 bytes). Base de datos SQLite de runtime: no debe estar en el índice. | **RESUELTO** (`git rm --cached`) | `git ls-tree -r HEAD` |
| **H-02** | BAJA | `.swarm/schema.sql` commiteado, por el mismo motivo. | **RESUELTO** (`git rm --cached`) | `git ls-files .swarm` |
| **H-03** | BAJA | `server.err` commiteado (0 bytes hoy). Log de error de servidor. | **RESUELTO** (`git rm --cached`) | `git ls-files server.err` |
| **H-04** | MEDIA | `DB_SSL` y `PG_SUPERUSER_PASSWORD` existen en `.env` pero no están en `.env.example`. | ABIERTO | Diff de nombres de clave |
| **H-05** | MEDIA | `ESCROW_SWEEP_ENABLED` se lee en `src/escrow/escrow.scheduler.ts:26,44,46,49` y no está en `.env.example`. | ABIERTO | `grep` sobre `.env.example` |
| **H-06** | BAJA | `MINIMAX_API_KEY` vacía mientras el plugin `code-agent-auto-commit` está declarado. El plugin no puede funcionar. | ABIERTO por decisión de Jorge | `opencode.jsonc`, `.opencode/ruflo-config.txt` |

**Falso positivo descartado.** Un barrido inicial marcó 2 coincidencias de un
patrón tipo `sk-` en `.swarm/memory.db`. La inspección de contexto mostró que
ambas provienen de la cadena `'task-routing'` (`ta**sk-r**outing`), no de un
token. Barrido de refuerzo sobre el archivo: **0** coincidencias de `api_key`,
`token`, `password`, `secret`, `Bearer` y `BEGIN PRIVATE`. **No hay que
rotar ninguna credencial por este archivo.** El riesgo es de higiene del
repositorio, no de exposición de secretos.

**H-01/H-02/H-03 resueltos (decisión de Jorge: desindexar sin reescribir
historia).** Ejecutado `git rm --cached .swarm/memory.db .swarm/schema.sql
server.err`. Los tres archivos siguen en disco (verificado), pero han salido
del índice y ahora casan con las reglas nuevas de `.gitignore`
(`.gitignore:44` y `.gitignore:46`).

**Lo que esto NO resuelve:** las versiones antiguas de esos archivos permanecen
en el historial de git. Quien ya descargó el repo tiene la copia local; un
`git clone` nuevo ya no la recibe. Si en el futuro se quiere purgar el
historial, es una operación de reescritura separada y destructiva que requiere
su propia autorización.

---

## 2. Twelve-Factor III — Config

Factor III: *store config in the environment*.

**Cumplimiento parcial favorable.**

- La configuración se lee por variables de entorno, no incrustada en el código.
  - Backend (`src/`): 13 accesos a `process.env.*`.
  - Frontend (`apps/web`): 7 accesos a `process.env.*`.
- Variables de entorno consumidas por el backend: `DB_HOST`, `DB_NAME`,
  `DB_PASSWORD`, `DB_PORT`, `DB_USER`, `ESCROW_SWEEP_ENABLED`, `JWT_SECRET`,
  `NODE_ENV`, `UV_THREADPOOL_SIZE`.
- Variables de entorno consumidas por el frontend: `GWS_E2E_API_URL`,
  `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NODE_ENV`.
- Existe `src/config/throttle.config.ts` como módulo de configuración de
  throttling (con su spec), lo que evita constantes dispersas.

**Brechas (H-04, H-05):** `.env.example` no refleja el conjunto real de
claves. Un despliegue nuevo siguiendo la plantilla omitiría `DB_SSL`,
`PG_SUPERUSER_PASSWORD` y `ESCROW_SWEEP_ENABLED`.

---

## 3. Twelve-Factor IV — Logs

Factor IV: *treat logs as event streams* (a stdout, nunca a archivos).

**Cumplimiento.**

- Escrituras a archivo en `src/`: **0** coincidencias de `appendFile`,
  `createWriteStream` o `writeFileSync`.
- `console.*` en `src/`: **3** ocurrencias, todas en
  `src/config/threadpool.ts:68,77,89` → salida a stdout, que es lo correcto.

**Nota de higiene:** `.gitignore` ahora excluye `.cac/`, pero los `.log` que hay
dentro ya estaban cubiertos por la regla `*.log` (línea 14). La exclusión
explícita de `.cac/` añade defensa para archivos no-`.log` futuros.

---

## 4. Estado de Ruflo (FASE 0)

| Métrica | Valor |
|---|---|
| Tools `ruflo_*` disponibles | ≈322 (una posible duplicación en el recuento) |
| `ruflo_mcp_status` | `running: true`, PID `17196`, transporte `stdio` |
| Swarm más reciente | `swarm-1791059087583-nojsui` |
| Estado del swarm | `terminated` |
| `maxAgents` / `agentCount` / `taskCount` | 15 / 0 / 0 |
| Swarm activo | Ninguno |

**FASE 0: APROBADA.** El servidor MCP responde y el toolset está disponible.
No hay swarm activo porque la carga de trabajo se ejecutó de forma secuencial,
no multi-agente.

---

## 5. FASE 2 — Estado de la limpieza

Acciones aplicadas en esta sesión:

- `apps/web/app/welcome/ruflo.txt` → `.opencode/ruflo-config.txt`
  (movido con `git mv`; queda registrado como rename).
- `.gitignore`: añadidos `.swarm/`, `.cac/` y `server.err`.
  Verificado con `git check-ignore --no-index`: las tres reglas casan
  (`.gitignore:44` y `.gitignore:46`).
- `git rm --cached .swarm/memory.db .swarm/schema.sql server.err`
  (autorizado por Jorge). Los archivos permanecen en disco y han salido del
  índice. Verificado: `git ls-files --error-unmatch` ahora falla para los tres,
  y `git status --untracked-files=all` ya no los lista.

Pendiente: purgar el historial de esas versiones antiguas (requiere
autorización propia; no es parte de esta orden).

**Nota sobre `ruflo-config.txt`:** el contenido movido declara el servidor MCP
`ruflo` vía `npx -y ruflo@latest mcp start` y una lista de plugins
(`code-agent-auto-commit`, `opencode-agent-teams`). La raíz del repo ya tiene
`opencode.jsonc` con esos mismos plugins. El archivo movido queda como
configuración local de `.opencode/`, no como fuente única de verdad; si se
quiere evitar la duplicación de plugins, conviene decidir cuál de los dos
prevalece.

---

## 6. Veredicto

| Fase | Estado |
|---|---|
| FASE 0 — Ruflo | APROBADA |
| FASE 1 — CF-01…CF-265 | **NO EJECUTADA** — Jorge decidió esperar los insumos faltantes (§7) |
| FASE 2 — limpieza | COMPLETA (rename + `.gitignore` + `git rm --cached`) |
| FASE 3 — auditoría | COMPLETA (este documento) |
| FASE 4 — commit atómico | **NO EJECUTADA** — depende de FASE 1 |

**No se creó ningún commit.** La ORDEN #004 pide un commit atómico que incluya
la FASE 1 completa. Commitear ahora solo FASE 2 + FASE 3 con ese mensaje
declararía como documentadas 265 reglas que no lo están. El trabajo de FASE 2 y
FASE 3 queda **staged** en el índice, listo para commit cuando la FASE 1 esté
resuelta.

Verificación ejecutada: `git check-ignore --no-index` sobre las tres rutas
nuevas y `git ls-files --error-unmatch` para confirmar la desindexación. **No
se ejecutaron tests ni build**: los cambios son `.gitignore`, un rename de
archivo de texto y un `.md`. No hay código de aplicación ni de build que
afectar.

---

## 7. Insumos que bloquean la FASE 1

1. Los 13 bloques definidos cubren solo 121 identificadores. **Faltan 144**
   (`CF-57`…`CF-200`) sin bloque asignado.
2. El texto original de `CF-01`…`CF-42` nunca fue provisto.
3. No se localizaron las fuentes de los bloques 3, 6, 7 y 8
   (Jiménez Murillo/Alfaomega, AMCHAMDR, Cuascota, Domínguez & Vera).
4. No está definido qué subconjunto de las ≈45 reglas de *Clean Code JS*
   corresponde a `CF-224`…`CF-246`; la numeración source-order desde `CF-224`
   no alinea `CF-240` con "un concepto por test".
5. `MINIMAX_API_KEY` está vacía: el plugin `code-agent-auto-commit` no puede
   funcionar sin decisión de Jorge sobre su configuración.
