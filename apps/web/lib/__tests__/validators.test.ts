import { registerSchema, loginSchema, rangeSchema } from '@/lib/validators';

function parseOk<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T } }, v: unknown): T {
  const r = schema.safeParse(v);
  if (!r.success) throw new Error('expected success');
  return r.data as T;
}

describe('validators (forms)', () => {
  it('registerSchema acepta el payload válido de un socio', () => {
    const data = parseOk(registerSchema, {
      fullName: 'Eduardo Esper',
      email: 'esper.eduardo@gmail.com',
      username: 'eduardo_esper',
      password: 'secret-pass-123',
      privacyAccepted: true,
      preferredLanguage: 'es',
    });
    expect(data.username).toBe('eduardo_esper');
  });

  it('registerSchema rechaza sin privacyAccepted:true (obligatorio backend)', () => {
    const r = registerSchema.safeParse({
      fullName: 'Eduardo Esper',
      email: 'esper.eduardo@gmail.com',
      username: 'edo',
      password: 'secret-pass-123',
      privacyAccepted: false,
      preferredLanguage: 'es',
    });
    expect(r.success).toBe(false);
  });

  it('registerSchema rechaza email, username y password inválidos', () => {
    expect(registerSchema.safeParse({ fullName: 'A', email: 'x', username: 'u', password: '1', privacyAccepted: true, preferredLanguage: 'es' }).success).toBe(false);
    expect(
      registerSchema.safeParse({ fullName: 'Eduardo Esper', email: 'a@b.co', username: 'bad name!', password: 'secret-pass-123', privacyAccepted: true, preferredLanguage: 'es' }).success,
    ).toBe(false);
    expect(registerSchema.safeParse({ fullName: 'Eduardo Esper', email: 'a@b.co', username: 'valid_name', password: '1234567', privacyAccepted: true, preferredLanguage: 'es' }).success).toBe(false);
  });

  it('loginSchema exige identifier y password no vacíos', () => {
    expect(parseOk(loginSchema, { identifier: 'eduardo', password: 'p' }).password).toBe('p');
    expect(loginSchema.safeParse({ identifier: '', password: '' }).success).toBe(false);
  });

  it('rangeSchema rechaza min > max', () => {
    const r = rangeSchema.safeParse({ min: 30, max: 10 });
    expect(r.success).toBe(false);
    expect(rangeSchema.safeParse({ min: 10, max: 30 }).success).toBe(true);
  });
});