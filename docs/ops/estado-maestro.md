# Estado Maestro GWS + Tropa

Última actualización: 2026-09-22 13:05

## Frente 1 — GWS

- Fase actual: 9 (checkout real)
- Fases completadas: 0-8 (backend 20 módulos / 26 tests, PostgreSQL local OK, frontend web FASE 1-8 UI completo, 16 tests)
- Últimos commits: `6c63fcf` (fix build Nest excluye apps/), `60567aa` (frontend FASE 1-8)
- Backend: corriendo en http://localhost:3001 (health 200), PostgreSQL 5432 OK
- Bloqueos: ninguno (deploy FASE 18 aguarda aprobación de Jorge)
- Próximo paso: FASE 9 — conectar checkout a `POST /orders` con Idempotency-Key (hook `useCreateOrder`), pantalla `/orders/[id]`, tests E2E con backend real

## Frente 2 — Tropa

- Ofertas detectadas: 10 (2 `draft_ready`, 8 `discarded`)
- Postulaciones activas: 0 (modo REVISIÓN C3 — ninguna enviada sin aprobación)
- Pendientes de Jorge: 2 posts manuales (Chek, n8n)
- Próximo ciclo: escaneo cada 4 h · correo cada 2 h · seguimiento 14:00 · reporte diario 20:00

## Escalados pendientes

- `@inboxapi/cli` 0.3.18 → 0.3.23 disponible (informado a Jorge)
- `npm audit` del toolchain frontend (9 findings) — pendiente decisión de Jorge