'use client';

/**
 * GWS · Hooks de órdenes (FASE 9).
 * Rutas REALES del backend NestJS (sin prefijo /v1):
 *   POST /orders                    -> crea orden (requiere Idempotency-Key)
 *   GET  /orders                    -> mis órdenes (auth)
 *   GET  /orders/:id                -> detalle (auth)
 *   POST /orders/:id/cancel         -> cancelar (auth)
 * Todas las rutas protegidas viajan por `/api/gateway/*`; el token en
 * cookie httpOnly nunca llega al navegador.
 */

import useSWR from 'swr';
import { api } from '@/lib/api';
import { newIdempotencyKey } from '@/lib/idempotency';
import type { CreateOrderPayload, OrderResponse } from '@/lib/types';
import { useAuth } from '@/lib/hooks/use-auth';

export interface CreateOrderInput {
  items: CreateOrderPayload['items'];
  address: CreateOrderPayload['address'];
  paymentMethod: CreateOrderPayload['paymentMethod'];
}

/** Crea una orden con Idempotency-Key generada en el cliente. */
export async function createOrder(input: CreateOrderInput): Promise<OrderResponse> {
  const payload: CreateOrderPayload = {
    ...input,
    idempotencyKey: newIdempotencyKey(),
  };
  return api.post<OrderResponse>('/orders', payload, { viaGateway: true, idempotencyKey: payload.idempotencyKey });
}

export function useOrder(id: string | null) {
  const enabled = !!id;
  const { data, error, isLoading, mutate } = useSWR<OrderResponse>(enabled ? `/orders/${id}` : null, (k: string) =>
    api.get<OrderResponse>(k, { viaGateway: true }),
  );
  return { order: data, loading: isLoading, error, refresh: mutate };
}

export function useMyOrders() {
  const { user } = useAuth();
  const enabled = !!user;
  const { data, error, isLoading, mutate } = useSWR<OrderResponse[]>(enabled ? '/orders' : null, (k: string) =>
    api.get<OrderResponse[]>(k, { viaGateway: true }),
  );
  return { orders: data ?? [], loading: isLoading, error, refresh: mutate };
}

/** Cancela una orden pendiente; revalida el detalle si se pasa mutate. */
export async function cancelOrder(id: string): Promise<OrderResponse> {
  return api.post<OrderResponse>(`/orders/${id}/cancel`, {}, { viaGateway: true, idempotencyKey: newIdempotencyKey() });
}