import { cn, clamp, formatUsd, formatUsdTable, initials, normalizeId, uid, debounce, retryWithBackoff } from '@/lib/utils';

describe('utils', () => {
  it('cn une clases y descarta falsy', () => {
    expect(cn('a', false, 'b', null, undefined, '')).toBe('a b');
  });

  it('clamp limita el rango', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it('formatUsd / formatUsdTable', () => {
    expect(formatUsd(24)).toBe('$24.00');
    expect(formatUsdTable(129)).toBe('$129');
    expect(formatUsdTable(24.5)).toBe('$24.50');
  });

  it('initials y normalizeId', () => {
    expect(initials('Eduardo Esper')).toBe('EE');
    expect(initials('')).toBe('?');
    expect(normalizeId('  Edu.ardo_Esper ')).toBe('edu.ardo_esper');
  });

  it('uid genera prefijo + sufijo', () => {
    expect(uid('cart').startsWith('cart_')).toBe(true);
  });

  it('debounce llama una sola vez tras el intervalo', async () => {
    const fn = jest.fn();
    const d = debounce(fn, 30);
    d();
    d();
    d();
    await new Promise((r) => setTimeout(r, 60));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retryWithBackoff reintenta y lanza tras agotarse', async () => {
    let n = 0;
    const ok = await retryWithBackoff(async () => {
      n += 1;
      if (n < 2) throw new Error('boom');
      return 'ok';
    }, 3, 5);
    expect(ok).toBe('ok');
    await expect(
      retryWithBackoff(async () => {
        throw new Error('nope');
      }, 2, 5),
    ).rejects.toThrow('nope');
  });
});