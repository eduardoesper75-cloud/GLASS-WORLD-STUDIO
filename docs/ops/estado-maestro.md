# Estado Maestro GWS + Tropa

Última actualización: 2026-09-22 13:20

## Frente 1 — GWS

- Fase actual: 10 (OpenAPI/Swagger)
- Fases completadas: 0-9 (backend 20 módulos / 26 tests, PostgreSQL local OK, frontend web FASE 1-9 UI completo + checkout real + órdenes, 19 tests incl. integración backend real)
- FASE 9 (checkout real): hook `use-orders.ts` (createOrder idempotente + useOrder + useMyOrders + cancelOrder), checkout con formulario de dirección + método de pago → `POST /orders` con Idempotency-Key, páginas `/orders` (lista) y `/orders/[id]` (detalle + cancelar), bloque de traducciones `orders` en 7 idiomas, matcher de middleware protege `/orders/*`. Ejecutado contra backend real: login, crear orden (idempotente), cancelar — verificado en BD gws_dev (órdenes pending/cancelled reales).
- Últimos commits: `0e449f8` (estado maestro), `6c63fcf` (fix build Nest), `60567aa` (frontend FASE 1-8)
- Backend: corriendo en http://localhost:3001 (health 200, JWT_SECRET en .env local git-ignored), PostgreSQL 5432 OK
- Seed E2E en gws_dev: `seed.seller@gwe2e.dev` / `SeedSeller2026!` (subscriber) + 2 productos activos
- Bloqueos: ninguno (deploy FASE 18 aguarda aprobación de Jorge)
- Próximo paso: FASE 10 — documentación OpenAPI/Swagger del backend

## Frente 2 — Tropa

- Ofertas detectadas: 10 (2 `draft_ready`, 8 `discarded`)
- Postulaciones activas: 0 (modo REVISIÓN C3 — ninguna enviada sin aprobación)
- Pendientes de Jorge: 2 posts manuales (Chek, n8n)
- Próximo ciclo: escaneo cada 4 h · correo cada 2 h · seguimiento 14:00 · reporte diario 20:00

## Escalados pendientes

- `@inboxapi/cli` 0.3.18 → 0.3.23 disponible (informado a Jorge)
- `npm audit` del toolchain frontend (9 findings) — pendiente decisión de Jorge