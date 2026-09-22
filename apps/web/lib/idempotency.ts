/** Idempotencia (CS-01/CF-01): toda POST con efecto de dinero/latencia
 * lleva un Idempotency-Key único en el cliente; el gateway la reenvía
 * al backend para que una reintento no duplique la operación. */
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `ik_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}