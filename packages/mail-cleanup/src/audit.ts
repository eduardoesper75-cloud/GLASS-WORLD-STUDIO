// =====================================================================
// Auditoría: agregación de remitentes, clasificación y render del informe
// =====================================================================

import { isOneClick, parseListUnsubscribeValue } from './list-unsubscribe.js';
import type {
  AuditReport,
  MessageHeader,
  SenderKind,
  SenderStats,
} from './types.js';

type NonOtherKind = Exclude<SenderKind, 'otro'>;

/** Palabras clave (minúsculas) usadas para clasificar por asunto/remitente. */
const KIND_KEYWORDS: Record<NonOtherKind, readonly string[]> = {
  cobros: [
    'invoice', 'factura', 'receipt', 'recibo', 'payment', 'pago', 'billing',
    'cargo', 'debit', 'purchase', 'compra', 'order', 'pedido', 'stripe',
    'paypal', 'mercadopago', 'cuota', 'cobro',
  ],
  boletines: [
    'newsletter', 'bulletin', 'boletin', 'boletín', 'digest', 'weekly',
    'monthly', 'semanal', 'mensual', 'marketing', 'promo', 'oferta',
    'descuento', 'news', 'novedades',
  ],
  suscripcion: [
    'subscription', 'suscripci', 'membership', 'membres', 'renew', 'renov',
    'subscribed', 'tu plan', 'your plan',
  ],
  trial: ['trial', 'prueba', 'demo', 'free', 'gratis'],
  spam: [
    'lottery', 'winner', 'ganaste', 'viagra', 'casino', 'bitcoin', 'crypto',
    'loan', 'préstamo', 'prestamo', 'forex',
  ],
};

/** Clasifica un mensaje por coincidencia de palabras clave. */
export function classifySender(subject: string, fromName: string): SenderKind {
  const haystack = `${subject} ${fromName}`.toLowerCase();
  let best: SenderKind = 'otro';
  let bestScore = 0;
  for (const [kind, keywords] of Object.entries(KIND_KEYWORDS) as Array<
    [NonOtherKind, readonly string[]]
  >) {
    let score = 0;
    for (const keyword of keywords) {
      if (haystack.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = kind;
    }
  }
  return best;
}

interface SenderAccumulator {
  address: string;
  name: string;
  domain: string;
  messages: MessageHeader[];
  kinds: Partial<Record<SenderKind, number>>;
}

/** Agrupa los mensajes por remitente y calcula el ranking. */
export function aggregateSenders(messages: readonly MessageHeader[]): SenderStats[] {
  const groups = new Map<string, SenderAccumulator>();

  for (const message of messages) {
    const key = message.fromAddress || message.domain || '(desconocido)';
    let group = groups.get(key);
    if (!group) {
      group = {
        address: message.fromAddress,
        name: message.fromName,
        domain: message.domain,
        messages: [],
        kinds: {},
      };
      groups.set(key, group);
    }
    group.messages.push(message);
    if (!group.name && message.fromName) group.name = message.fromName;
    const kind = classifySender(message.subject, message.fromName);
    group.kinds[kind] = (group.kinds[kind] ?? 0) + 1;
  }

  const stats: SenderStats[] = [];
  for (const group of groups.values()) {
    const sorted = [...group.messages].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0]?.date ?? '';
    const last = sorted[sorted.length - 1]?.date ?? '';

    const withUnsub = group.messages.filter((m) => m.listUnsubscribe !== undefined);
    const oneClick = withUnsub.some((m) => isOneClick(m.listUnsubscribePost));
    const sample = withUnsub[0];
    const parsed = sample?.listUnsubscribe
      ? parseListUnsubscribeValue(sample.listUnsubscribe)
      : { mailto: [], https: [] };

    let dominant: SenderKind = 'otro';
    let dominantCount = -1;
    for (const [kind, count] of Object.entries(group.kinds) as Array<[SenderKind, number]>) {
      if (count > dominantCount) {
        dominantCount = count;
        dominant = kind;
      }
    }

    stats.push({
      address: group.address,
      name: group.name,
      domain: group.domain,
      count: group.messages.length,
      kinds: group.kinds,
      kind: dominant,
      hasUnsubscribe: withUnsub.length > 0,
      oneClick,
      ...(parsed.mailto[0] !== undefined ? { unsubscribeMailto: parsed.mailto[0] } : {}),
      ...(parsed.https[0] !== undefined ? { unsubscribeHttp: parsed.https[0] } : {}),
      firstDate: first,
      lastDate: last,
    });
  }

  return stats.sort((a, b) => b.count - a.count || a.address.localeCompare(b.address));
}

export interface AccountMeta {
  key: string;
  address: string;
  scanned: number;
  mailboxTotal: number;
}

/** Construye el informe completo (estructura serializable a JSON). */
export function buildReport(
  accounts: readonly AccountMeta[],
  messages: readonly MessageHeader[],
  lookbackDays: number,
): AuditReport {
  return {
    generatedAt: new Date().toISOString(),
    lookbackDays,
    accounts: [...accounts],
    senders: aggregateSenders(messages),
    messages: [...messages],
  };
}

const KIND_LABEL: Record<SenderKind, string> = {
  cobros: 'Cobros',
  boletines: 'Boletines',
  suscripcion: 'Suscripción',
  trial: 'Trial',
  spam: 'Spam',
  otro: 'Otro',
};

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function unsubscribeLabel(sender: SenderStats): string {
  if (!sender.hasUnsubscribe) return '—';
  if (sender.oneClick) return '✅ One-Click';
  if (sender.unsubscribeMailto !== undefined && sender.unsubscribeHttp === undefined) {
    return '✅ mailto';
  }
  if (sender.unsubscribeHttp !== undefined) return '✅ URL';
  return '✅';
}

function sortLabel(a: SenderStats, b: SenderStats): number {
  return a.kind.localeCompare(b.kind) || b.count - a.count;
}

/** Render en Markdown del informe de ranking, listo para aprobación humana. */
export function renderMarkdown(report: AuditReport, top: number): string {
  const generated = report.generatedAt.replace('T', ' ').slice(0, 19);
  const lines: string[] = [];

  lines.push('# Auditoría de suscripciones y remitentes — GWS');
  lines.push('');
  lines.push(`- **Generado:** ${generated} UTC`);
  lines.push(`- **Ventana analizada:** últimos ${report.lookbackDays} días`);
  lines.push(`- **Modo:** solo lectura (READ-ONLY)`);
  lines.push('');
  lines.push('## Casillas auditadas');
  lines.push('');
  lines.push('| Casilla | Mensajes analizados | Total en INBOX |');
  lines.push('|---|---:|---:|');
  for (const account of report.accounts) {
    lines.push(`| ${account.address} | ${account.scanned} | ${account.mailboxTotal} |`);
  }
  lines.push('');

  const ranking = report.senders.slice(0, top);
  lines.push(`## Ranking de remitentes (Top ${ranking.length})`);
  lines.push('');
  lines.push('| # | Remitente / Dominio | Correos | Tipo | List-Unsubscribe | Acción de baja |');
  lines.push('|---:|---|---:|---|---|---|');
  ranking.forEach((sender, index) => {
    const who = sender.address || sender.domain;
    const action =
      sender.oneClick && sender.unsubscribeHttp
        ? 'POST RFC 8058'
        : sender.unsubscribeMailto
          ? 'correo mailto'
          : sender.unsubscribeHttp
            ? 'enlace manual'
            : '—';
    lines.push(
      `| ${index + 1} | ${escapeCell(who)} | ${sender.count} | ${KIND_LABEL[sender.kind]} | ${unsubscribeLabel(sender)} | ${escapeCell(action)} |`,
    );
  });
  lines.push('');

  const subs = report.senders.filter((sender) => sender.hasUnsubscribe).sort(sortLabel);
  lines.push(`## Suscripciones con baja automática disponible (${subs.length})`);
  lines.push('');
  // Higiene de datos: el destino (URL/mailto de baja) suele incluir tokens de un
  // solo uso y, a veces, el correo embebido (PII). NO se publica en el informe
  // versionado: se reemplaza por un placeholder. Los valores crudos quedan sólo
  // en `data/mail-cleanup/` (ignorado por git) para las operaciones reales.
  lines.push('> 🔒 Los destinos de baja se omiten deliberadamente (contienen tokens/PII).');
  lines.push('');
  lines.push('| Remitente / Dominio | Correos | Tipo | Método | Destino |');
  lines.push('|---|---:|---|---|---|');
  for (const sender of subs) {
    const method = sender.oneClick ? 'one-click' : sender.unsubscribeMailto ? 'mailto' : 'manual';
    const hasTarget = sender.unsubscribeHttp !== undefined || sender.unsubscribeMailto !== undefined;
    const destination = hasTarget ? '<UNSUBSCRIBE_URL_HIDDEN>' : '—';
    lines.push(
      `| ${escapeCell(sender.address || sender.domain)} | ${sender.count} | ${KIND_LABEL[sender.kind]} | ${method} | ${escapeCell(destination)} |`,
    );
  }
  lines.push('');

  const noUnsub = report.senders.filter((sender) => !sender.hasUnsubscribe);
  lines.push(`## Remitentes sin cabecera de baja (${noUnsub.length})`);
  lines.push('');
  lines.push('| Remitente / Dominio | Correos | Tipo |');
  lines.push('|---|---:|---|');
  for (const sender of noUnsub.slice(0, top)) {
    lines.push(
      `| ${escapeCell(sender.address || sender.domain)} | ${sender.count} | ${KIND_LABEL[sender.kind]} |`,
    );
  }
  lines.push('');

  return lines.join('\n');
}
