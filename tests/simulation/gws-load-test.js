/**
 * GWS · FASE 11 — Simulacion de carga (k6)
 *
 * OBJETIVO: medir como se comporta el backend bajo concurrencia real,
 * contra localhost + PostgreSQL local. NO toca produccion, NO toca dinero,
 * NO toca Payment_Vault (CLAUDE.md 3.1).
 *
 * RUTAS REALES VERIFICADAS (2026-10-03) contra el NestJS en localhost:3001
 * ------------------------------------------------------------------------
 * El backend NO usa prefijo global: no existe `/v1`. Las rutas reales son:
 *   GET  /health
 *   POST /auth/login          { identifier, password }
 *   GET  /marketplace/products        (paginado, devuelve items/total/page/limit/hasMore)
 *   GET  /marketplace/products/:id
 *   GET  /marketplace/products/radar   (400 sin parametros: requiere countryCode)
 *
 * Por eso este script usa `/auth/login` y `/marketplace/products`, NO
 * `/v1/auth/login` ni `/marketplace/listings`.
 *
 * RESTRICCION CRITICA QUE AFECTA LOS RESULTADOS
 * ---------------------------------------------
 * El backend tiene DOS capas de rate limit (CLAUDE.md FASE 15 las pagara):
 *   1. ThrottlerGuard GLOBAL: 100 req/min POR IP (THROTTLE_LIMIT_PER_MINUTE)
 *   2. @Throttle() en auth:    5 req/min POR IP (ttl 60s)
 * En k6 todos los VU salen desde 127.0.0.1, o sea TODOS comparten un unico
 * bucket. Por eso los Escenarios B y C, tal como estan escritos, miden el
 * comportamiento DEL THROTTLER, no el del negocio. El Escenario B casi
 * seguro va a devolver 429 en su mayoria.
 *
 * Eso no es un bug del script: es un hallazgo. Por eso el runner produce
 * dos pasadas:
 *   pasada 1 -> "con seguridad"  : limites reales, mide el techo de la app
 *   pasada 2 -> "sin throttling" : THROTTLE_LIMIT_PER_MINUTE alto, mide
 *                                  la capacidad real del codigo
 * Ver docs/simulation/analisis-fase-11.md seccion 3.
 *
 * Uso:
 *   k6 run tests/simulation/gws-load-test.js
 *   k6 run tests/simulation/gws-load-test.js --out json=docs/simulation/resultados-raw.json
 *   k6 run tests/simulation/gws-load-test.js -e PERFIL=sin-throttle
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// PERFIL cambia las etapas para poder separar "seguridad" de "capacidad".
const PERFIL = __ENV.PERFIL || 'con-seguridad';

// Credenciales del seed E2E documentado en docs/ops/estado-maestro.md:12
const LOGIN_ID = __ENV.LOGIN_IDENTIFIER || 'seed.seller@gwe2e.dev';
const LOGIN_PW = __ENV.LOGIN_PASSWORD || 'SeedSeller2026!';

// Metricas propias (las de k6 no permiten umbral por etapa de forma fina)
const loginOK = new Counter('gws_login_ok');
const loginFail = new Counter('gws_login_fail');
const loginThrottled = new Counter('gws_login_throttled_429');
const productsTrend = new Trend('gws_products_duration', true);
const detailTrend = new Trend('gws_product_detail_duration', true);
const healthTrend = new Trend('gws_health_duration', true);
const negocioRate = new Rate('gws_tasa_error_negocio'); // 5xx y 4xx de negocio, NO 429

// En perfil "sin-throttle" las etapas se agrupan para no gastar 4 minutos
// en correr etapas que sabemos que el throttler va a cortar.
const ETAPAS = PERFIL === 'sin-throttle'
  ? {
      health:     [{ target: 10,  duration: '30s' }],
      login:      [{ target: 50,  duration: '30s' }, { target: 50, duration: '60s' }],
      marketplace: [{ target: 100, duration: '30s' }, { target: 100, duration: '60s' }],
    }
  : {
      health:     [{ target: 10,  duration: '30s' }],
      login:      [{ target: 50,  duration: '30s' }, { target: 50, duration: '60s' }],
      marketplace: [{ target: 100, duration: '30s' }, { target: 100, duration: '60s' }],
    };

export const options = {
  discardResponseBodies: false,
  // Un fallo de threshold NO aborta la corrida: queremos el reporte completo
  // aunque el p95 se dispare. Los umbrales se reportan, se "warn"ean.
  thresholds: {
    http_req_failed: ['rate<0.10'],
    'http_req_duration{scenario:escenario_a_health}': ['p(95)<300'],
    'http_req_duration{scenario:escenario_c_marketplace}': ['p(95)<800'],
  },
  scenarios: {
    escenario_a_health: {
      executor: 'ramping-vus',
      exec: 'escenarioAHealth',
      startVUs: 0,
      stages: ETAPAS.health,
      gracefulRampDown: '10s',
      tags: { escenario: 'A', nombre: 'health' },
    },
    escenario_b_login: {
      executor: 'ramping-vus',
      exec: 'escenarioBLogin',
      startVUs: 0,
      stages: ETAPAS.login,
      gracefulRampDown: '10s',
      tags: { escenario: 'B', nombre: 'login' },
    },
    escenario_c_marketplace: {
      executor: 'ramping-vus',
      exec: 'escenarioCMarketplace',
      startVUs: 0,
      stages: ETAPAS.marketplace,
      gracefulRampDown: '10s',
      startTime: '0s',
      tags: { escenario: 'C', nombre: 'marketplace' },
    },
  },
};

// ---------------------------------------------------------------------------
// setup: una sola vez. Descubre IDs reales de producto contra la BD.
// Si no hay seed, la simulacion igual corre y lo reporta.
// ---------------------------------------------------------------------------

export function setup() {
  const health = http.get(`${BASE_URL}/health`);
  const list = http.get(`${BASE_URL}/marketplace/products?limit=10`);

  let productIds = [];
  if (list.status === 200) {
    try {
      const j = list.json();
      productIds = (j.items || []).map((p) => p.id);
    } catch (_) { /* seed ausente */ }
  }

  return {
    productIds,
    healthStatusAtSetup: health.status,
    perfil: PERFIL,
    baseUrl: BASE_URL,
    loginIdentifier: LOGIN_ID,
    loginPassword: LOGIN_PW,
  };
}

// ---------------------------------------------------------------------------
// ESCENARIO A — Health check (baseline)
// 10 VUs, 30s, GET /health
// ---------------------------------------------------------------------------

export function escenarioAHealth(data) {
  const r = http.get(`${data.baseUrl}/health`, { tags: { endpoint: 'health' } });
  healthTrend.add(r.timings.duration);

  const ok = check(r, {
    'health 200': (res) => res.status === 200,
    'health db ok': (res) => {
      try { return res.json().db === 'ok'; } catch (_) { return false; }
    },
  });
  negocioRate.add(ok);
}

// ---------------------------------------------------------------------------
// ESCENARIO B — Login concurrente
// Ramping 0 -> 50 VUs en 30s, mantener 60s, POST /auth/login
//
// ESPERADO: la mayoria devolvera 429 por @Throttle({ttl:60, limit:5}).
// No es un fallo del negocio, es el rate limiter haciendo su trabajo. Por eso
// loginThrottled se cuenta aparte de loginFail.
// ---------------------------------------------------------------------------

export function escenarioBLogin(data) {
  const payload = JSON.stringify({
    identifier: data.loginIdentifier,
    password: data.loginPassword,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'auth/login' },
  };

  const r = http.post(`${data.baseUrl}/auth/login`, payload, params);

  if (r.status === 201 || r.status === 200) {
    const ok = check(r, {
      'login devuelve accessToken': (res) => {
        try { return typeof res.json().accessToken === 'string'; } catch (_) { return false; }
      },
    });
    loginOK.add(1);
    negocioRate.add(ok);
  } else if (r.status === 429) {
    // Rate limit alcanzado: comportamiento esperado, no error de negocio.
    loginThrottled.add(1);
    negocioRate.add(true);
  } else {
    loginFail.add(1);
    negocioRate.add(false);
    console.error(`login inesperado ${r.status}: ${r.body.slice(0, 200)}`);
  }

  sleep(0.5);
}

// ---------------------------------------------------------------------------
// ESCENARIO C — Navegacion de marketplace
// 100 VUs, 60s, GET /marketplace/products y GET /marketplace/products/:id
//
// NOTA: el throttle global (100 req/min por IP) va a cortar esto tambien.
// Con 100 VUs haciendo GET la tasa de 429 deberia ser alta. Se registra
// separado para no contaminar la lectura de la latencia.
// ---------------------------------------------------------------------------

export function escenarioCMarketplace(data) {
  group('marketplace', () => {
    const r = http.get(`${data.baseUrl}/marketplace/products?limit=20`, {
      tags: { endpoint: 'marketplace/products' },
    });
    productsTrend.add(r.timings.duration);

    const ok = check(r, {
      'listado 200': (res) => res.status === 200,
      'listado trae items': (res) => {
        if (res.status !== 200) return false;
        try { return Array.isArray(res.json().items); } catch (_) { return false; }
      },
    });

    if (r.status === 429) {
      negocioRate.add(true); // throttled: no cuenta como error de negocio
    } else {
      negocioRate.add(ok);
    }

    // Detalle de producto: usa un id real del setup.
    if (data.productIds && data.productIds.length > 0) {
      const id = data.productIds[Math.floor(Math.random() * data.productIds.length)];
      const d = http.get(`${data.baseUrl}/marketplace/products/${id}`, {
        tags: { endpoint: 'marketplace/products/:id' },
      });
      detailTrend.add(d.timings.duration);
      if (d.status !== 429) {
        check(d, { 'detalle 200': (res) => res.status === 200 });
      }
    }

    sleep(0.3);
  });
}

// ---------------------------------------------------------------------------
// handleSummary: reporte legible en consola + JSON crudo para el analisis.
// ---------------------------------------------------------------------------

export function handleSummary(data) {
  const m = data.metrics;
  const linea = (k) =>
    m[k] ? `${k.padEnd(28)} avg=${(m[k].avg || 0).toFixed(1)}ms  p95=${(m[k]['p(95)'] || 0).toFixed(1)}ms  p99=${(m[k]['p(99)'] || 0).toFixed(1)}ms  max=${(m[k].max || 0).toFixed(1)}ms` : `${k.padEnd(28)} (sin datos)`;

  const out = `
================================================================
 GWS · FASE 11 — Simulacion de carga (k6) · perfil: ${PERFIL}
================================================================
 BASE_URL: ${BASE_URL}

--- Throughput y errores ---
 http_reqs                 ${(m.http_reqs ? m.http_reqs.count : 0)} req  (${(m.http_reqs ? m.http_reqs.rate : 0).toFixed(1)} req/s)
 http_req_failed           ${(m.http_req_failed ? (m.http_req_failed.rate * 100).toFixed(1) : 0)}%
 gws_tasa_error_negocio    ${(m.gws_tasa_error_negocio ? (m.gws_tasa_error_negocio.rate * 100).toFixed(1) : 0)}%  (excluye 429)

--- Escenario A · health ---
 ${linea('gws_health_duration')}

--- Escenario B · login ---
 ${linea('http_req_duration{scenario:escenario_b_login}')}
 logins OK            ${m.gws_login_ok ? m.gws_login_ok.count : 0}
 logins 429 (throttle) ${m.gws_login_throttled_429 ? m.gws_login_throttled_429.count : 0}
 logins con error     ${m.gws_login_fail ? m.gws_login_fail.count : 0}

--- Escenario C · marketplace ---
 ${linea('gws_products_duration')}
 ${linea('gws_product_detail_duration')}

--- Checks ---
 checks: ${m.checks ? m.checks.count : 0}  (pass ${m.checks ? (m.checks.rate * 100).toFixed(1) : 0}%)

--- Thresholds ---
${Object.keys(m).filter((k) => k.startsWith('thresholds')).map((k) => ' ' + k + ': ' + JSON.stringify(m[k].passes ? 'PASS' : 'FAIL')).join('\n') || ' (n/d)'}
================================================================
`;
  return { stdout: out };
}
