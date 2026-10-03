import { throttleOptions, ThrottleEnv } from './throttle.config';

/**
 * B12 — Regresión de la conversión de unidades del rate limiting.
 *
 * El bug original: `ttl` se pasaba en segundos (`60`) donde la librería
 * espera milisegundos, dejando una ventana de 60 ms. Estos tests fijan la
 * conversion en el unico lugar donde ocurre, que ahora es `throttleOptions()`.
 *
 * Nota sobre por qué esto vive acá y no en el spec del controller: la config
 * global no se puede observar desde un controller con decorador, porque el
 * decorador la pisa. Ver throttle.config.ts.
 */

describe('throttleOptions (B12)', () => {
  it('convierte 60 segundos a 60.000 ms (no 60)', () => {
    const cfg = throttleOptions({});
    expect(cfg.ttl).toBe(60_000);
    expect(cfg.limit).toBe(100);
  });

  it('la ventana por defecto NO es de 60 ms', () => {
    // Si alguien reintroduce `60` sin multiplicar, este test lo frena.
    expect(throttleOptions({}).ttl).toBeGreaterThan(1_000);
  });

  it('respeta THROTTLE_TTL_SECONDS del entorno y lo convierte a ms', () => {
    expect(throttleOptions({ THROTTLE_TTL_SECONDS: '30' }).ttl).toBe(30_000);
    expect(throttleOptions({ THROTTLE_TTL_SECONDS: '5' }).ttl).toBe(5_000);
  });

  it('respeta THROTTLE_LIMIT_PER_MINUTE del entorno', () => {
    expect(throttleOptions({ THROTTLE_LIMIT_PER_MINUTE: '250' }).limit).toBe(250);
  });

  it('un ttl de 60 en el entorno significa 60 segundos, no 60 ms', () => {
    // Este es el escenario exacto del bug: el operador (o el codigo) pone 60
    // esperando segundos. La funcion tiene que devolver 60.000.
    const cfg = throttleOptions({ THROTTLE_TTL_SECONDS: '60' });
    expect(cfg.ttl).toBe(60_000);
    expect(cfg.ttl).not.toBe(60);
  });

  describe('rechaza valores invalidos en vez de dejar el throttler sin efecto', () => {
    it('lanza con ttl no numerico', () => {
      expect(() => throttleOptions({ THROTTLE_TTL_SECONDS: 'sesenta' })).toThrow(
        /THROTTLE_TTL_SECONDS/,
      );
    });

    it('lanza con ttl cero o negativo', () => {
      expect(() => throttleOptions({ THROTTLE_TTL_SECONDS: '0' })).toThrow();
      expect(() => throttleOptions({ THROTTLE_TTL_SECONDS: '-5' })).toThrow();
    });

    it('lanza con limite no numerico', () => {
      expect(() => throttleOptions({ THROTTLE_LIMIT_PER_MINUTE: 'muchos' })).toThrow(
        /THROTTLE_LIMIT_PER_MINUTE/,
      );
    });
  });
});