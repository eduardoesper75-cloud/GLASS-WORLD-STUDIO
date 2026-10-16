// =====================================================================
// Tipos compartidos del CLI @gws/mail-cleanup
// =====================================================================

/** Cuenta de correo resuelta desde el entorno (credenciales de aplicación). */
export interface MailboxAccount {
  /** Clave canónica derivada del nombre de cuenta (ej. `EDUARDOESPER75`). */
  key: string;
  /** Dirección de correo (usada como `from` en las bajas por `mailto:`). */
  address: string;
  /** Usuario IMAP (normalmente la misma dirección). */
  username: string;
  /** Contraseña de aplicación de Gmail. NUNCA se registra en logs. */
  password: string;
  host: string;
  port: number;
}

/** Clasificación heurística de un remitente. */
export type SenderKind =
  | 'cobros'
  | 'boletines'
  | 'suscripcion'
  | 'trial'
  | 'spam'
  | 'otro';

/** Cabecera mínima de un mensaje, suficiente para auditar, dar de baja y purgar. */
export interface MessageHeader {
  accountKey: string;
  /** Carpeta IMAP de origen (habitualmente `INBOX`). */
  mailbox: string;
  uid: number;
  fromName: string;
  fromAddress: string;
  domain: string;
  subject: string;
  /** Fecha ISO 8601 (del envelope `date`, o internalDate si falta). */
  date: string;
  listUnsubscribe?: string;
  listUnsubscribePost?: string;
}

/** Agregado por remitente para el ranking del informe. */
export interface SenderStats {
  address: string;
  name: string;
  domain: string;
  count: number;
  kinds: Partial<Record<SenderKind, number>>;
  /** Tipo dominante (el de mayor conteo). */
  kind: SenderKind;
  hasUnsubscribe: boolean;
  /** Tiene `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058). */
  oneClick: boolean;
  unsubscribeMailto?: string;
  unsubscribeHttp?: string;
  firstDate: string;
  lastDate: string;
}

/** Informe completo de una pasada de auditoría (solo lectura). */
export interface AuditReport {
  generatedAt: string;
  lookbackDays: number;
  accounts: Array<{ key: string; address: string; scanned: number; mailboxTotal: number }>;
  senders: SenderStats[];
  messages: MessageHeader[];
}

/** Acción de baja resuelta a partir de las cabeceras. */
export type UnsubscribeMethod = 'one-click' | 'mailto' | 'manual';

export interface UnsubscribeTarget {
  domain: string;
  address: string;
  method: UnsubscribeMethod;
  /** Endpoint HTTP (one-click) o dirección `mailto:`. */
  endpoint?: string;
  /** Enlace del cuerpo para baja manual (sin cabecera usable). */
  manualLink?: string;
}

/** Resultado de intentar una baja. */
export interface UnsubscribeResult {
  domain: string;
  method: UnsubscribeMethod;
  endpoint?: string;
  status: 'ok' | 'error' | 'skipped';
  detail: string;
}
