/**
 * GWS · FASE 11 — Post-proceso de resultados k6.
 * Calcula p50/p95/p99/max POR endpoint y por escenario, y el throughput,
 * leyendo el JSON crudo que emitio k6 (--out json=...).
 *
 * Uso: node tests/simulation/resumir-resultados.js [archivo.json]
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../../docs/simulation/resultados-raw.json');

if (!fs.existsSync(file)) {
  console.error('No existe: ' + file);
  process.exit(1);
}

const porEscenario = {};
const porEndpoint = {};
let duraciones = [];

for (const linea of fs.readFileSync(file, 'utf8').split('\n')) {
  if (!linea.trim()) continue;
  let m;
  try { m = JSON.parse(linea); } catch (e) { continue; }

  const t = m.type;
  if (t === 'Point' && m.metric === 'http_req_duration') {
    const v = m.data.value;
    const tags = m.data.tags || {};
    const esc = tags.scenario || '(sin scenario)';
    const ep = tags.endpoint || '(sin endpoint)';

    duraciones.push(v);
    (porEscenario[esc] = porEscenario[esc] || []).push(v);
    (porEndpoint[ep] = porEndpoint[ep] || []).push(v);
  }
}

const pct = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.floor((p / 100) * s.length));
  return s[i];
};

const linea = (nombre, arr) => {
  const avg = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
  console.log(
    nombre.padEnd(38) +
    'n=' + String(arr.length).padStart(7) +
    '  avg=' + avg.toFixed(2).padStart(8) + 'ms' +
    '  p50=' + pct(arr, 50).toFixed(2).padStart(7) + 'ms' +
    '  p95=' + pct(arr, 95).toFixed(2).padStart(7) + 'ms' +
    '  p99=' + pct(arr, 99).toFixed(2).padStart(7) + 'ms' +
    '  max=' + Math.max(0, ...arr).toFixed(0).padStart(6) + 'ms'
  );
};

console.log('\n=== DURACION POR ESCENARIO ===');
Object.keys(porEscenario).sort().forEach((k) => linea(k, porEscenario[k]));

console.log('\n=== DURACION POR ENDPOINT ===');
Object.keys(porEndpoint).sort().forEach((k) => linea(k, porEndpoint[k]));

console.log('\n=== GLOBAL ===');
linea('todas las peticiones', duraciones);

const over500 = duraciones.filter((d) => d > 500).length;
const over1000 = duraciones.filter((d) => d > 1000).length;
const over2000 = duraciones.filter((d) => d > 2000).length;
console.log('\nRequests > 500ms : ' + over500 + ' (' + ((over500 / duraciones.length) * 100).toFixed(3) + '%)');
console.log('Requests > 1000ms: ' + over1000 + ' (' + ((over1000 / duraciones.length) * 100).toFixed(3) + '%)');
console.log('Requests > 2000ms: ' + over2000 + ' (' + ((over2000 / duraciones.length) * 100).toFixed(3) + '%)');
console.log('\nFuente: ' + file);
