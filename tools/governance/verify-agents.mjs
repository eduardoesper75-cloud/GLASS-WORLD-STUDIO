// Verificador estructural del gobierno de agentes GWS.
// No modifica nada. Solo lee archivos. No usa dependencias externas.
// Uso: node tools/governance/verify-agents.mjs [--root=<ruta>]
//   --root  raiz del proyecto a verificar (por defecto: directorio actual).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT_ARG = process.argv.find((a) => a.startsWith("--root="));
const ROOT = ROOT_ARG ? ROOT_ARG.slice("--root=".length) : process.cwd();
const AGENTS_DIR = join(ROOT, ".opencode", "agents");
const DOCS = [
  "docs/agents/GWS_AGENT_GOVERNANCE.md",
  "docs/agents/GWS_AGENT_REGISTRY.md",
  "docs/agents/GWS_WORKFLOW.md",
  "docs/agents/GWS_SECURITY_AUDIT_STANDARD.md",
  "docs/agents/GWS_REPORT_TEMPLATES.md",
  "docs/agents/GWS_ART_DIRECTION_STANDARD.md",
  "docs/agents/GWS_DECISION_LOG.md",
  "docs/agent-reports/README.md",
];

const CHIEFS = {
  "gws-chief-engineer": "primary",
  "gws-art-experience-director": "primary",
  "gws-chief-qa-security-auditor": "primary",
};
const TECH = [
  "gws-backend-domain-agent",
  "gws-data-acid-agent",
  "gws-security-architecture-agent",
  "gws-payments-commerce-agent",
  "gws-api-contracts-agent",
  "gws-performance-observability-agent",
];
const ART = [
  "gws-ux-information-architecture-agent",
  "gws-visual-system-agent",
  "gws-galaxy-experience-agent",
  "gws-motion-interaction-agent",
  "gws-responsive-accessibility-agent",
];
const QA = [
  "gws-security-verification-agent",
  "gws-qa-test-verification-agent",
  "gws-data-integrity-audit-agent",
  "gws-payment-risk-audit-agent",
  "gws-supply-chain-audit-agent",
  "gws-release-gate-agent",
];
const PARENT = {};
for (const id of TECH) PARENT[id] = "gws-chief-engineer";
for (const id of ART) PARENT[id] = "gws-art-experience-director";
for (const id of QA) PARENT[id] = "gws-chief-qa-security-auditor";
const SUBAGENTS = [...TECH, ...ART, ...QA];
const EXPECTED = [...Object.keys(CHIEFS), ...SUBAGENTS];

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok, detail: detail ?? "" });
}

// --- parseo de frontmatter (sin dependencias) ---
function parseAgent(file) {
  const raw = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fm = m[1];
  const body = m[2];
  const get = (k) => {
    const r = fm.match(new RegExp("^" + k + ":\\s*(.*)$", "m"));
    return r ? r[1].trim().replace(/^["']|["']$/g, "") : null;
  };
  const rules = [];
  let cur = null;
  for (const line of fm.split("\n")) {
    let mm = line.match(/^\s+- action:\s*(.+)$/);
    if (mm) {
      cur = { action: mm[1].trim().replace(/^["']|["']$/g, ""), resource: null, effect: null };
      rules.push(cur);
      continue;
    }
    mm = line.match(/^\s+resource:\s*(.+)$/);
    if (mm && cur) {
      cur.resource = mm[1].trim().replace(/^["']|["']$/g, "");
      continue;
    }
    mm = line.match(/^\s+effect:\s*(.+)$/);
    if (mm && cur) cur.effect = mm[1].trim().replace(/^["']|["']$/g, "");
  }
  return {
    id: file.replace(/\\/g, "/").split("/").pop().replace(/\.md$/, ""),
    description: get("description"),
    mode: get("mode"),
    steps: get("steps"),
    color: get("color"),
    rules,
    body,
  };
}

// --- 1. inventario ---
const files = existsSync(AGENTS_DIR)
  ? readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md"))
  : [];
check("carpeta .opencode/agents existe", existsSync(AGENTS_DIR), AGENTS_DIR);
check(
  "cantidad de archivos de agente = 20",
  files.length === 20,
  `encontrados: ${files.length}`,
);

const agents = files.map((f) => parseAgent(join(AGENTS_DIR, f)));
check("todos los frontmatter parsean", agents.every((a) => a !== null));

const ids = agents.map((a) => a.id);
check("IDs unicos", new Set(ids).size === ids.length, `total ${ids.length}`);
check(
  "conjunto de IDs exacto",
  EXPECTED.every((id) => ids.includes(id)) && ids.length === EXPECTED.length,
  EXPECTED.filter((id) => !ids.includes(id)).join(", ") || "exacto",
);

// Tolerancia a agentes ausentes: si falta un archivo, cada verificacion debe reportar el
// faltante y seguir. Sin esto, un archivo ausente aborta la ejecucion con una excepcion.
for (const id of EXPECTED) {
  if (!agents.some((a) => a && a.id === id)) {
    agents.push({ id, description: null, mode: null, steps: null, color: null, rules: [], body: "" });
  }
}

// --- 2. modos ---
for (const [id, mode] of Object.entries(CHIEFS)) {
  const a = agents.find((x) => x.id === id);
  check(`${id}: mode=${mode}`, a && a.mode === mode, a ? `mode=${a.mode}` : "ausente");
}
for (const id of SUBAGENTS) {
  const a = agents.find((x) => x.id === id);
  check(`${id}: mode=subagent`, a && a.mode === "subagent", a ? `mode=${a.mode}` : "ausente");
}

// --- 3. descripcion presente (visible al modelo) ---
for (const a of agents) {
  check(`${a.id}: tiene description`, !!a.description && a.description.length > 20);
}

// --- 4. jerarquia: cada subagente declara su padre y el padre lo autoriza ---
for (const id of SUBAGENTS) {
  const a = agents.find((x) => x.id === id);
  const parent = PARENT[id];
  check(
    `${id}: declara padre ${parent}`,
    a && a.body.includes(`**Padre:** \`${parent}\``),
  );
  const p = agents.find((x) => x.id === parent);
  const authorized =
    p &&
    p.rules.some(
      (r) => r.action === "subagent" && r.resource === id && r.effect === "allow",
    );
  check(`${parent} autoriza ${id}`, authorized);
}

// --- 5. jefes: allowlist de subagentes cerrada ---
for (const id of Object.keys(CHIEFS)) {
  const a = agents.find((x) => x.id === id);
  const denyAll = a.rules.some(
    (r) => r.action === "subagent" && r.resource === "*" && r.effect === "deny",
  );
  const allowed = a.rules
    .filter((r) => r.action === "subagent" && r.effect === "allow")
    .map((r) => r.resource);
  const expectedSquad =
    id === "gws-chief-engineer" ? TECH : id === "gws-art-experience-director" ? ART : QA;
  check(`${id}: subagent * deny`, denyAll);
  check(
    `${id}: solo su cuadrilla (${expectedSquad.length})`,
    allowed.length === expectedSquad.length && expectedSquad.every((s) => allowed.includes(s)),
    `allow: ${allowed.join(", ")}`,
  );
  check(
    `${id}: no coordina a otros jefes`,
    !allowed.some((s) => Object.keys(CHIEFS).includes(s)),
  );
}

// --- 6. jefes: limites (secciones 5 y 7 del prompt) ---
for (const id of Object.keys(CHIEFS)) {
  const a = agents.find((x) => x.id === id);
  const sec = (n) => new RegExp(`^## ${n}\\.`, "m").test(a.body);
  const sections = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  const missing = sections.filter((n) => !sec(n));
  check(`${id}: 20 secciones del prompt`, missing.length === 0, `faltan: ${missing.join(",")}`);
  check(`${id}: declara Limites`, /no podes/i.test(a.body));
}

// --- 7. subagentes: 13 secciones ---
for (const id of SUBAGENTS) {
  const a = agents.find((x) => x.id === id);
  const missing = [1,2,3,4,5,6,7,8,9,10,11,12,13].filter(
    (n) => !new RegExp(`^## ${n}\\.`, "m").test(a.body),
  );
  check(`${id}: 13 secciones`, missing.length === 0, `faltan: ${missing.join(",")}`);
  check(`${id}: fideicomiso de alcance (Entradas requeridas)`, /## 8\./.test(a.body));
}

// --- 8. Auditor: prohibido editar produccion ---
const auditor = agents.find((x) => x.id === "gws-chief-qa-security-auditor");
const auditEditAllow = auditor.rules.filter((r) => r.action === "edit" && r.effect === "allow");
check(
  "Auditor Jefe: edit permitido SOLO en informes/audit",
  auditEditAllow.length === 2 &&
    auditEditAllow.every((r) => ["docs/agent-reports/**", "docs/audit/**"].includes(r.resource)),
  auditEditAllow.map((r) => r.resource).join(", "),
);
check(
  "Auditor Jefe: edit * deny",
  auditor.rules.some((r) => r.action === "edit" && r.resource === "*" && r.effect === "deny"),
);
check(
  "Auditor Jefe: no puede editar sus propios criterios (docs/agents fuera del allow)",
  !auditEditAllow.some((r) => r.resource.includes("docs/agents")),
);
check(
  "Auditor Jefe: shell * deny (solo allowlist no destructiva)",
  auditor.rules.some((r) => r.action === "shell" && r.resource === "*" && r.effect === "deny"),
);
check(
  "Auditor Jefe: no instala dependencias (sin allow de install)",
  !auditor.rules.some((r) => r.action === "shell" && r.effect === "allow" && /install/i.test(r.resource || "")),
);
for (const id of QA) {
  const a = agents.find((x) => x.id === id);
  const allows = a.rules.filter((r) => r.action === "edit" && r.effect === "allow").map((r) => r.resource);
  check(
    `${id}: sin edicion de codigo`,
    allows.length === 2 && allows.every((r) => ["docs/agent-reports/**", "docs/audit/**"].includes(r)),
    allows.join(", "),
  );
}

// --- 9. Ingeniero: obligacion de reportar ---
const eng = agents.find((x) => x.id === "gws-chief-engineer");
check(
  "Ingeniero Jefe: obligacion de reporte",
  /docs\/agent-reports\/<task-id>\.md/.test(eng.body) && /GWS_REPORT_TEMPLATES/.test(eng.body),
);
check(
  "Ingeniero Jefe: no puede anular veto S0/S1",
  /anular un veto S0\/S1/i.test(eng.body),
);
check(
  "Ingeniero Jefe: aprobacion humana obligatoria",
  /Aprobacion humana obligatoria/.test(eng.body),
);

// --- 9b. H-01: el Ingeniero no puede editar el gobierno ---
// No alcanza con mirar la regla literal: se reproduce el matcher real de OpenCode
// (gana la ULTIMA regla cuyo `resource` coincide) para medir el efecto EFECTIVO de
// `edit` sobre las rutas normativas. En OpenCode la accion `edit` cubre edit/write/patch.
function matchResource(resource, pattern) {
  const n = String(resource).replaceAll("\\", "/");
  let i = String(pattern)
    .replaceAll("\\", "/")
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  if (i.endsWith(" .*")) i = i.slice(0, -3) + "( .*)?";
  return new RegExp("^" + i + "$", "si").test(n);
}
function effectiveEdit(rules, file) {
  for (let i = rules.length - 1; i >= 0; i--) {
    const r = rules[i];
    if (r && r.action === "edit" && matchResource(file, r.resource)) return r.effect;
  }
  return "ask";
}
const GOVERNANCE_DOCS = [
  "docs/agents/GWS_AGENT_GOVERNANCE.md",
  "docs/agents/GWS_AGENT_REGISTRY.md",
  "docs/agents/GWS_WORKFLOW.md",
  "docs/agents/GWS_SECURITY_AUDIT_STANDARD.md",
  "docs/agents/GWS_REPORT_TEMPLATES.md",
  "docs/agents/GWS_DECISION_LOG.md",
  "docs/agents/GWS_PRE_APPROVAL_AUDIT.md",
];
for (const f of GOVERNANCE_DOCS) {
  const eff = effectiveEdit(eng.rules, f);
  check(`Ingeniero Jefe: edit DENY efectivo sobre ${f} (H-01)`, eff === "deny", `efectivo=${eff}`);
}
for (const f of ["docs/audit/hallazgo.md", "tools/governance/verify-agents.mjs"]) {
  const eff = effectiveEdit(eng.rules, f);
  check(`Ingeniero Jefe: edit DENY efectivo sobre ${f} (H-01)`, eff === "deny", `efectivo=${eff}`);
}
check(
  "Ingeniero Jefe: conserva edit ALLOW operativo en docs/agent-reports/**",
  effectiveEdit(eng.rules, "docs/agent-reports/GWS-TASK.md") === "allow",
  `efectivo=${effectiveEdit(eng.rules, "docs/agent-reports/GWS-TASK.md")}`,
);
for (const gov of ["docs/agents/**", "docs/audit/**", "tools/governance/**"]) {
  check(
    `Ingeniero Jefe: declara edit deny explicito para ${gov} (H-01)`,
    eng.rules.some((r) => r.action === "edit" && r.resource === gov && r.effect === "deny"),
  );
}
for (const a of agents) {
  if (a.id === "gws-chief-engineer") continue;
  const eff = effectiveEdit(a.rules, "docs/agents/GWS_WORKFLOW.md");
  check(`${a.id}: edit NO-allow efectivo sobre docs/agents (H-01)`, eff !== "allow", `efectivo=${eff}`);
}

// --- 10. endurecimientos transversales ---
for (const a of agents) {
  const has = (act, res, eff) =>
    a.rules.some((r) => r.action === act && r.resource === res && r.effect === eff);
  check(`${a.id}: read *.env deny`, has("read", "*.env", "deny"));
  check(`${a.id}: imap_* deny`, has("imap_*", "*", "deny"));
  check(`${a.id}: external_directory deny`, has("external_directory", "*", "deny"));
}
for (const id of SUBAGENTS) {
  const a = agents.find((x) => x.id === id);
  const has = (act, res, eff) =>
    a.rules.some((r) => r.action === act && r.resource === res && r.effect === eff);
  check(`${id}: subagent * deny`, has("subagent", "*", "deny"));
  check(`${id}: question * deny`, has("question", "*", "deny"));
  check(`${id}: steps acotado`, a.steps === "30", `steps=${a.steps}`);
}
for (const id of TECH.concat(QA)) {
  const a = agents.find((x) => x.id === id);
  check(
    `${id}: browser deny`,
    a.rules.some((r) => r.action === "browser" && r.effect === "deny"),
  );
}
for (const id of ART) {
  const a = agents.find((x) => x.id === id);
  check(
    `${id}: browser allow (inspeccion visual)`,
    a.rules.some((r) => r.action === "browser" && r.effect === "allow"),
  );
  const edits = a.rules.filter((r) => r.action === "edit" && r.effect === "allow").map((r) => r.resource);
  check(`${id}: sin backend (lib/types/api denegados)`, edits.includes("apps/web/src/app/**") && !edits.includes("apps/web/src/lib/**"), edits.join(", "));
}
for (const id of TECH) {
  const a = agents.find((x) => x.id === id);
  check(
    `${id}: UI denegada (components/locales)`,
    a.rules.some((r) => r.action === "edit" && r.resource === "apps/web/src/components/**" && r.effect === "deny"),
  );
}
check(
  "Director de Arte: sin backend",
  ["apps/web/src/lib/**", "apps/web/src/types/**", "apps/web/src/app/api/**", "packages/**"].every((res) =>
    ART.length && agents.find((x) => x.id === "gws-art-experience-director").rules.some((r) => r.action === "edit" && r.resource === res && r.effect === "deny"),
  ),
);

// --- 11. documentos de gobierno ---
for (const d of DOCS) check(`existe ${d}`, existsSync(join(ROOT, d)));

// --- 12. cuadrillas documentadas en el registro ---
const registry = existsSync(join(ROOT, "docs/agents/GWS_AGENT_REGISTRY.md"))
  ? readFileSync(join(ROOT, "docs/agents/GWS_AGENT_REGISTRY.md"), "utf8")
  : "";
for (const id of EXPECTED) check(`registro incluye ${id}`, registry.includes(id));
for (const tag of ["[TECH-SQUAD-01]", "[ART-SQUAD-05]", "[QA-SQUAD-06]"]) {
  check(`registro incluye ${tag}`, registry.includes(tag));
}

// --- 13. sin secretos en lo creado ---
const SECRET_PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "clave privada PEM"],
  [/AIza[0-9A-Za-z_-]{30,}/, "Google API key"],
  [/sk-[A-Za-z0-9_-]{20,}/, "clave sk-"],
  [/(password|passwd|contrasena|clave)\s*[:=]\s*["'][^"']{8,}["']/i, "asignacion de contrasena"],
  [/(secret|token|api[_-]?key)\s*[:=]\s*["'][A-Za-z0-9_-]{16,}["']/i, "asignacion de secreto"],
  [/(?=[A-Za-z0-9+/]*[A-Z])(?=[A-Za-z0-9+/]*[a-z])(?=[A-Za-z0-9+/]*[0-9])[A-Za-z0-9+/]{40,}={0,2}/, "cadena larga tipo base64"],
];
const createdFiles = files.map((f) => join(AGENTS_DIR, f)).concat(DOCS.map((d) => join(ROOT, d)));
let secretHits = 0;
for (const f of createdFiles) {
  if (!existsSync(f)) continue;
  const txt = readFileSync(f, "utf8");
  for (const [re, label] of SECRET_PATTERNS) {
    const mm = txt.match(re);
    if (mm) {
      secretHits++;
      check(`SIN secretos: ${f.replace(ROOT, "")}`, false, `${label}: ${mm[0].slice(0, 24)}...`);
    }
  }
}
check("escaneo de secretos en archivos creados", secretHits === 0, `coincidencias: ${secretHits}`);

// --- resumen ---
const failed = results.filter((r) => !r.ok);
console.log(JSON.stringify({
  total: results.length,
  ok: results.length - failed.length,
  failed: failed.length,
  fallos: failed.map((f) => ({ check: f.name, detalle: f.detail })),
}, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
