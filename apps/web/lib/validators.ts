import { z } from 'zod';

/** Validación de formularios (zod). el flag de privacidad del RegisterDto
 * exige explícitamente true (el backend rechaza sin él: 400). */

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'carta.fullsRequired').max(80),
    email: z.string().email('carta.emailInvalid'),
    username: z
      .string()
      .min(3, 'carta.usernameMin')
      .max(30)
      .regex(/^[a-z0-9_.-]+$/i, 'carta.usernameChars'),
    password: z.string().min(8, 'carta.passwordMin'),
    privacyAccepted: z.literal(true, { message: 'carta.privacyRequired' }),
    preferredLanguage: z.enum(['es', 'en']),
  })
  .strict();

export const loginSchema = z
  .object({
    identifier: z.string().min(1, 'carta.identifierRequired'),
    password: z.string().min(1, 'carta.passwordRequired'),
  })
  .strict();

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;

/** Números técnicos del marketplace (ej: COE, temperatura). */
export const rangeSchema = z
  .object({
    min: z.coerce.number().min(0).optional(),
    max: z.coerce.number().min(0).optional(),
  })
  .refine((v) => v.min === undefined || v.max === undefined || v.min <= v.max, {
    message: 'carta.rangeInvalid',
  });