import { z } from 'zod';

// =====================================================================
// Validación de variables de entorno
// ---------------------------------------------------------------------
// Fuente de verdad única para claves de API. Ver `.env.example` en la raíz.
// =====================================================================

/** Trata la cadena vacía como "no definido" (evita fallos al copiar `.env.example`). */
const optionalSecret = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Google Cloud / Drive & Docs REST API
  GOOGLE_DRIVE_FOLDER_ID: optionalSecret,
  GOOGLE_SERVICE_ACCOUNT_EMAIL: optionalSecret,
  GOOGLE_PRIVATE_KEY: optionalSecret,
  GOOGLE_APPLICATION_CREDENTIALS: optionalSecret,

  // YouTube Data API v3
  YOUTUBE_API_KEY: optionalSecret,
  YOUTUBE_CHANNEL_ID: optionalSecret,

  // Capa de presentación
  NEXT_PUBLIC_API_BASE_URL: optionalSecret,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Valida `process.env` (o la fuente inyectada) y falla con un mensaje accionable. */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Configuración de entorno inválida:\n${issues}`);
  }
  return result.data;
}

export interface GoogleDriveCredentials {
  folderId: string;
  /** Ruta a JSON de credenciales o `undefined` si se usa cuenta de servicio inline. */
  credentialsPath?: string;
  serviceAccountEmail?: string;
  privateKey?: string;
}

/** Extrae credenciales de Google Drive y exige que existan. */
export function requireGoogleDrive(env: ServerEnv): GoogleDriveCredentials {
  if (!env.GOOGLE_DRIVE_FOLDER_ID) {
    throw new Error('Falta GOOGLE_DRIVE_FOLDER_ID en el entorno.');
  }
  const hasJsonPath = Boolean(env.GOOGLE_APPLICATION_CREDENTIALS);
  const hasServiceAccount = Boolean(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY);
  if (!hasJsonPath && !hasServiceAccount) {
    throw new Error(
      'Define GOOGLE_APPLICATION_CREDENTIALS o el par GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY.',
    );
  }
  return {
    folderId: env.GOOGLE_DRIVE_FOLDER_ID,
    ...(env.GOOGLE_APPLICATION_CREDENTIALS
      ? { credentialsPath: env.GOOGLE_APPLICATION_CREDENTIALS }
      : {}),
    ...(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY
      ? {
          serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          privateKey: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
      : {}),
  };
}

export interface YouTubeCredentials {
  apiKey: string;
  channelId: string;
}

/** Extrae credenciales de YouTube Data API v3 y exige que existan. */
export function requireYouTube(env: ServerEnv): YouTubeCredentials {
  if (!env.YOUTUBE_API_KEY || !env.YOUTUBE_CHANNEL_ID) {
    throw new Error('Faltan YOUTUBE_API_KEY y/o YOUTUBE_CHANNEL_ID en el entorno.');
  }
  return { apiKey: env.YOUTUBE_API_KEY, channelId: env.YOUTUBE_CHANNEL_ID };
}
