# @gws/mail-cleanup

CLI de **auditoría, baja y purga controlada** de las casillas oficiales de
Glass World Studio. Complementa al servidor MCP [`imap-mcp-server`](../../tools/imap-mcp/README.md):
el MCP aporta el escaneo interactivo; este CLI aporta la **baja automática
`List-Unsubscribe` / RFC 8058** (que el MCP no trae) y una purga reproducible.

## Comandos

```powershell
pnpm --filter @gws/mail-cleanup start accounts       # cuentas detectadas en .env
pnpm --filter @gws/mail-cleanup start audit          # escaneo (solo lectura) + informe
pnpm --filter @gws/mail-cleanup start unsubscribe    # bajas (dry-run por defecto)
pnpm --filter @gws/mail-cleanup start purge          # mover a Trash (dry-run)
```

Durante el desarrollo, con `tsx` directo:

```powershell
pnpm --filter @gws/mail-cleanup exec tsx src/index.ts audit --days 180 --top 40
```

### `audit`
Conecta por IMAP (`imap.gmail.com:993`), lee cabeceras (`From`, `Subject`, `Date`,
`List-Unsubscribe`, `List-Unsubscribe-Post`) y genera:

- `data/mail-cleanup/audit-<fecha>.json` — datos completos (para las fases 3 y 4).
- `docs/outreach/herramientas/GWS_Reporte_Ranking_Correo.md` — informe con el
  ranking de remitentes, tipo de notificación y presencia de `List-Unsubscribe`.

Opciones: `--days`, `--limit`, `--mailbox`, `--top`, `--accounts`, `--out`, `--report`.

### `unsubscribe`
Resuelve la baja de cada remitente según sus cabeceras:

1. `List-Unsubscribe-Post: List-Unsubscribe=One-Click` → **POST RFC 8058**.
2. `mailto:` → correo de baja por SMTP (`smtp.gmail.com:465`).
3. Solo URL, sin one-click → se reporta como **baja manual** (no se fuerza).

Por defecto es **dry-run**: no envía nada. Para ejecutar de verdad: `--apply`.

### `purge`
Mueve a la **Papelera** (`Trash`) los correos de los remitentes seleccionados.
Nunca borra de forma permanente. Exige `--apply --yes` para actuar.

Opciones de selección (compartidas): `--senders <dominios/remitentes>`,
`--kinds cobros,boletines,suscripcion,trial,spam,otro`, `--from <audit.json>`.

## Credenciales

Solo desde `.env` / `.env.local` (nunca en código). Por cada casilla:

```dotenv
IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_USERNAME=eduardoesper75@gmail.com
IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_PASSWORD=<contraseña de aplicación>
```

> La casilla institucional `edu.esper@glassworldstudio.com.ar` no es de Gmail: se
> configura con el IMAP del proveedor del dominio (Don Web).

## Flujo recomendado (fases 2 → 4)

```powershell
# 1) Auditoría en modo lectura
pnpm --filter @gws/mail-cleanup start audit

# 2) Revisar el informe y aprobar dominios, entonces dar de baja
pnpm --filter @gws/mail-cleanup start unsubscribe --senders dominio1.com,dominio2.com --apply

# 3) Purga a Trash de los remitentes aprobados (con confirmación)
pnpm --filter @gws/mail-cleanup start purge --senders dominio1.com,dominio2.com --apply --yes
```

## Seguridad

- Sin `--apply` (y `--yes` en purga) todo es simulacro.
- La purga mueve a Trash; el borrado permanente es un paso aparte y explícito.
- Ningún secreto se registra en logs ni se escribe en los informes.
