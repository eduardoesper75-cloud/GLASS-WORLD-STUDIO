/* @jest-environment node */
/**
 * FASE 9 · Test de integración contra el backend REAL (NestJS, localhost:3001).
 * - Valida el contrato de órdenes: login → POST /orders (idempotente) →
 *   GET /orders/:id → POST /orders/:id/cancel.
 * - Si el backend no está vivo, la suite pasa en vacío (guard), sin romper CI.
 *
 * Correr con el backend arrancado:
 *   cd apps/web && npx jest lib/__tests__/orders.integration.test.ts
 */

const API_URL = process.env.GWS_E2E_API_URL ?? 'http://localhost:3001';
const SEED_EMAIL = 'seed.seller@gwe2e.dev';
const SEED_PASSWORD = 'SeedSeller2026!';
const FALLBACK_PRODUCT_ID = 'c388dd3f-af34-4c00-95c7-d587a7a4902a';

interface AuthRes {
  user: { id: string; email: string };
  accessToken: string;
}
interface OrderRes {
  id: string;
  status: string;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  items: Array<{ productId: string; productName: string; quantity: number; unitAmount: number; lineTotal: number }>;
  payments: Array<{ id: string; status: string; amount: number; paymentMethod: string }>;
  createdAt: string;
}

async function backendAlive(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(`${API_URL}/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

async function json<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T }> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* keep raw */
  }
  return { status: res.status, body: body as T };
}

async function login(): Promise<AuthRes> {
  const { status, body } = await json<AuthRes>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: SEED_EMAIL, password: SEED_PASSWORD }),
  });
  if (status !== 201 || !body.accessToken) throw new Error(`login failed: ${status}`);
  return body;
}

async function pickupProductId(token: string): Promise<string> {
  const { status, body } = await json<{ items?: Array<{ id: string }> }>(`/marketplace/products?limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (status === 200 && Array.isArray(body.items) && body.items.length > 0) return body.items[0].id;
  return FALLBACK_PRODUCT_ID;
}

function orderPayload(idempotencyKey: string, productId: string) {
  return {
    idempotencyKey,
    items: [{ productId, quantity: 2 }],
    address: {
      fullName: 'Test Buyer',
      line1: 'Av. Prueba 123',
      city: 'Santiago del Estero',
      region: 'SDE',
      postalCode: '4200',
      countryCode: 'AR',
    },
    paymentMethod: 'card_usd',
  };
}

describe('orders · integración con backend real', () => {
  let live = false;

  beforeAll(async () => {
    live = await backendAlive();
  });

  it('login del seed devuelve accessToken (contrato auth)', async () => {
    if (!live) return;
    const res = await login();
    expect(res.accessToken).toBeTruthy();
    expect(res.user.email).toBe(SEED_EMAIL);
  });

  it('POST /orders crea una orden y es idempotente (misma key → misma orden)', async () => {
    if (!live) return;
    const { accessToken } = await login();
    const productId = await pickupProductId(accessToken);

    const key = `jest-e2e-${Date.now()}`;
    const payload = orderPayload(key, productId);

    const first = await json<OrderRes>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(first.status).toBe(201);
    expect(first.body.id).toBeTruthy();
    expect(first.body.status).toBe('pending');
    expect(first.body.currency).toBe('USD');
    expect(first.body.items.length).toBeGreaterThan(0);
    expect(first.body.total).toBeGreaterThan(0);

    const replay = await json<OrderRes>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(replay.body.id).toBe(first.body.id);
  });

  it('GET /orders/:id devuelve el detalle; cancelar una pendiente la pasa a cancelled', async () => {
    if (!live) return;
    const { accessToken } = await login();
    const productId = await pickupProductId(accessToken);

    const { status, body: created } = await json<OrderRes>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload(`jest-e2e-cancel-${Date.now()}`, productId)),
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(status).toBe(201);

    const detail = await json<OrderRes>(`/orders/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(detail.status).toBe(200);
    expect(detail.body.id).toBe(created.id);
    expect(detail.body.status).toBe('pending');

    const cancelled = await json<OrderRes>(`/orders/${created.id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(cancelled.body.status).toBe('cancelled');
  });
});