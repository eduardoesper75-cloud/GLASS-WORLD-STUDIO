/**
 * GWS · Analítica local (privacidad) — eventos anónimos sin red externa.
 * Se acumulan en localStorage y un export opcional los descarga como JSON.
 */

export type GwEvent =
  | { type: 'page_view'; path: string }
  | { type: 'auth'; action: 'register' | 'login' | 'logout' | 'session_restored' }
  | { type: 'plan'; galaxy: string; months: number; quoteUsd: number }
  | { type: 'subscribe_intent'; galaxy: string; months: number }
  | { type: 'marketplace'; action: 'search' | 'filter' | 'open_product' | 'add_to_cart' }
  | { type: 'vault'; action: string };

interface StoredEvent {
  id: string;
  ts: string;
  event: GwEvent;
}

const KEY = 'gws_events';
const MAX = 500;

export function track(ev: GwEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) ?? '[]') as StoredEvent[];
    list.push({ id: Math.random().toString(36).slice(2), ts: new Date().toISOString(), event: ev });
    const trimmed = list.slice(-MAX);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* analítica no bloquea la app */
  }
}

export function getEvents(): StoredEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '[]') as StoredEvent[];
  } catch {
    return [];
  }
}

export function clearEvents(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}

export function exportEventsJson(): string {
  return JSON.stringify(getEvents(), null, 2);
}