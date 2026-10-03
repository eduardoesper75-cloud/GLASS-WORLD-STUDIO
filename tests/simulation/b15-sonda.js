/**
 * Sonda de B15 — mide el impacto de bcrypt concurrente sobre endpoints de
 * lectura que NO tienen nada que ver con autenticacion.
 *
 * Por que un guion propio y no el de FASE 11: este necesita (a) menos
 * scenarios, (b) HTTP request blocks para medir round-trip real, y (c) poder
 * apuntar a un puerto distinto sin tocar el guion compartido.
 *
 * Uso: k6 run tests/simulation/b15-sonda.js
 */
import http from 'k6/http';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';
const LOGIN = JSON.stringify({
  identifier: __ENV.LOGIN_IDENTIFIER || 'seed.seller@gwe2e.dev',
  password: __ENV.LOGIN_PASSWORD || 'SeedSeller2026!',
});

const healthTrend = new Trend('b15_health_ms', true);
const loginTrend = new Trend('b15_login_ms', true);

export const options = {
  discardResponseBodies: true,
  scenarios: {
    // Lecturas coexisten con 50 logins concurrentes. Si el event loop se
    // bloquea, esto se nota como latencia alta en un endpoint trivial.
    coexistencia: {
      executor: 'ramping-vus',
      exec: 'coexistencia',
      startVUs: 0,
      stages: [
        { target: 10, duration: '5s' },
        { target: 50, duration: '20s' },
        { target: 0, duration: '5s' },
      ],
      startTime: '10s',
      gracefulRampDown: '10s',
    },
    // Solo lecturas: baseline comparable sin bcrypt en vuelo.
    solo_lecturas: {
      executor: 'constant-vus',
      exec: 'soloLecturas',
      vus: 20,
      duration: '30s',
      startTime: '40s',
    },
  },
};

export function coexistencia() {
  const r = http.post(`${BASE_URL}/auth/login`, LOGIN, {
    headers: { 'Content-Type': 'application/json' },
  });
  loginTrend.add(r.timings.duration);

  const h = http.get(`${BASE_URL}/health`);
  healthTrend.add(h.timings.duration);
}

export function soloLecturas() {
  const p = http.get(`${BASE_URL}/marketplace/products?limit=20`);
  healthTrend.add(p.timings.duration);
}