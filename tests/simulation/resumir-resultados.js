/**
 * GWS Â· FASE 11 â€” Post-proceso de resultados k6.
 * Calcula p50/p95/p99/max POR endpoint y por escenario, y el throughput,
 * leyendo el JSON crudo que emitio k6 (--out json=...).
 *
 * Uso: node tests/simulation/resumir-resultados.js [archivo.json]
 *
 * â”€â”€ Por que streaming y no readFileSync â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * La corrida final produjo un JSON de 1,38 GB (287.541 requests). La version
 * anterior usaba `fs.readFileSync(file, 'utf8')`, que choca contra el limite
 * de string de V8 (~512 MB, ERR_STRING_TOO_LONG) y mataba el proceso.
 *
 * Ademas `Math.max(...arr)` con ~287k elementos revienta la pila de argumentos.
 * Por eso: lectura linea por linea con readline, y percentiles sobre un
 * array YA ORDENADO en vez de ordenar tres veces.
 *
 * Los 429 se reportan aparte de la latencia: son el throttle haciendo su
 * trabajo, no el negocio respondiendo lento.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const file = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../../docs/simulation/resultados-raw.json');

if (!fs.existsSync(file)) {
  console.error('No existe: ' + file);
  process.exit(1);
}

const porEscenario = {};
const porEndpoint = {};
const porStatus = {};
const durations = [];
let totalRequests = 0;

/**
 * Percentil sobre un array YA ORDENADO ascendentemente.
 * `sorted` es true por defecto porque los llamadores ordenan una vez y
 * reutilizan; los indices usan la misma convencion que k6.
 */
const pctSorted = (sorted, p) => {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[i];
};

async function main() {
  const rl = readline.createInterface({
    input: fs.createReadStream(file, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  for await (const linea of rl) {
    if (!linea.trim()) continue;
    let m;
    try { m = JSON.parse(linea); } catch (e) { continue; }

    if (m.type !== 'Point' || m.metric !== 'http_req_duration') continue;

    const v = m.data.value;
    const tags = m.data.tags || {};
    const esc = tags.scenario || '(sin scenario)';
    const ep = tags.endpoint || '(sin endpoint)';

    totalRequests += 1;
    durations.push(v);
    (porEscenario[esc] = porEscenario[esc] || []).push(v);
    (porEndpoint[ep] = porEndpoint[ep] || []).push(v);

    const status = tags.status || '(sin status)';
    (porStatus[status] = porStatus[status] || []).push(v);
  }

  const linea = (nombre, arr, yaOrdenado) => {
    const s = yaOrdenado ? arr : [...arr].sort((a, b) => a - b);
    const n = s.length || 1;
    let acc = 0;
    for (const x of s) acc += x;
    const avg = acc / n;
    console.log(
      nombre.padEnd(40) +
        'n=' + String(s.length).padStart(7) +
        '  avg=' + avg.toFixed(2).padStart(8) + 'ms' +
        '  p50=' + pctSorted(s, 50).toFixed(2).padStart(8) + 'ms' +
        '  p95=' + pctSorted(s, 95).toFixed(2).padStart(8) + 'ms' +
        '  p99=' + pctSorted(s, 99).toFixed(2).padStart(8) + 'ms' +
        '  max=' + (s.length ? s[s.length - 1] : 0).toFixed(0).padStart(7) + 'ms'
    );
  };

  // Ordenar una vez por grupo y reusar para todos los percentiles.
  for (const k of Object.keys(porEscenario)) porEscenario[k].sort((a, b) => a - b);
  for (const k of Object.keys(porEndpoint)) porEndpoint[k].sort((a, b) => a - b);
  for (const k of Object.keys(porStatus)) porStatus[k].sort((a, b) => a - b);
  durations.sort((a, b) => a - b);

  console.log('\n=== DURACION POR ESCENARIO (todo, incluye 429) ===');
  Object.keys(porEscenario).sort().forEach((k) => linea(k, porEscenario[k], true));

  console.log('\n=== DURACION POR ENDPOINT (todo, incluye 429) ===');
  Object.keys(porEndpoint).sort().forEach((k) => linea(k, porEndpoint[k], true));

  console.log('\n=== DURACION POR STATUS HTTP ===');
  Object.keys(porStatus).sort().forEach((k) => linea('status ' + k, porStatus[k], true));

  console.log('\n=== GLOBAL ===');
  linea('todas las peticiones', durations, true);

  console.log('\nRequests > 500ms : ' + durations.filter((d) => d > 500).length);
  console.log('Requests > 1000ms: ' + durations.filter((d) => d > 1000).length);
  console.log('Requests > 2000ms: ' + durations.filter((d) => d > 2000).length);
  console.log('\nRequests totales: ' + totalRequests);
  console.log('Fuente: ' + file);

}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
