# Integración MCP de correo — `imap-mcp-server`

Capa de conexión IMAP para auditar y purgar las casillas oficiales de Glass
World Studio usando [`nikolausm/imap-mcp-server`](https://github.com/nikolausm/imap-mcp-server)
(MIT, TypeScript) como servidor MCP de OpenCode.

## Piezas

| Archivo | Rol |
|---|---|
| `launch.mjs` | Arranca el servidor MCP cargando los secretos desde `.env`/`.env.local` y forzando **READ-ONLY** por defecto. |
| `provision-accounts.mjs` | Da de alta las casillas en `~/.imap-mcp/accounts.json` en modo *credenciales gestionadas por entorno* (sin guardar secretos). |

El servidor está instalado **fuera del repo**, junto al resto del tooling MCP:

```
%LOCALAPPDATA%\gws-tools\imap-mcp-server\node_modules\imap-mcp-server\dist\index.js
```

## Puesta en marcha

1. **Instalar el servidor** (si aún no está):

   ```powershell
   $dir = "$env:LOCALAPPDATA\gws-tools\imap-mcp-server"
   New-Item -ItemType Directory -Force -Path $dir | Out-Null
   Set-Location $dir; npm init -y | Out-Null; npm install imap-mcp-server
   ```

2. **Dar de alta las casillas** (crea `~/.imap-mcp/accounts.json`, sin secretos):

   ```powershell
   node tools/imap-mcp/provision-accounts.mjs
   ```

3. **Definir credenciales en `.env.local`** (nunca versionado). Las claves son
   contraseñas de aplicación de Gmail (requieren verificación en dos pasos):

   ```dotenv
   # eduardoesper75@gmail.com
   IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_USERNAME=eduardoesper75@gmail.com
   IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_PASSWORD=xxxxxxxxxxxxxxxx

   # esper.eduardo@gmail.com
   IMAP_MCP_ACCOUNT_ESPER_EDUARDO_IMAP_USERNAME=esper.eduardo@gmail.com
   IMAP_MCP_ACCOUNT_ESPER_EDUARDO_IMAP_PASSWORD=xxxxxxxxxxxxxxxx
   ```

4. **Registrar el MCP en OpenCode**: ya está hecho en `.opencode/opencode.json`
   (servidor `imap`, apuntando a `launch.mjs`).

## Requisitos de credenciales (importante)

Gmail **no acepta la contraseña normal de la cuenta** por IMAP, ni siquiera
cuando es correcta: con verificación en dos pasos activa, el servidor responde
`Application-specific password required` y rechaza el login. Hace falta una
**contraseña de aplicación** de 16 caracteres (una por casilla):

1. Entrar en https://myaccount.google.com/apppasswords (requiere 2FA activo).
2. Crearla para cada casilla y copiarla (sin espacios) en `.env.local`.

Diagnóstico rápido de la respuesta del servidor:

| Respuesta | Significado |
|---|---|
| `Application-specific password required` | La contraseña de cuenta es correcta, pero hay que usar una de aplicación. |
| `Invalid credentials` | Usuario o contraseña incorrectos. |
| `self-signed certificate in certificate chain` | Falta el CA del sistema (ver TLS abajo). |

## TLS con antivirus o proxy (Avast y similares)

Si un antivirus (p. ej. **Avast Mail Shield**) o un proxy inspecciona TLS, la
cadena de certificados incluye un CA raíz propio que Node no confía por
defecto; el error es `self-signed certificate in certificate chain`.

- El CLI arranca con `--use-system-ca` (Node ≥ 22.15), que agrega el almacén
  de certificados de Windows al bundle de Node.
- El launcher MCP exporta `NODE_OPTIONS=--use-system-ca` al servidor.

Alternativa: excluir `node.exe` del escaneo de correo del antivirus.

## Modo lectura (Fase 1) y purga (Fase 4)

`launch.mjs` arranca con `IMAP_MCP_READ_ONLY=true`: el agente solo ve las tools
seguras de lectura (`search_emails`, `domain_stats`, `check_spam`,
`list_spam_domains`, `list_folders`, `get_email`, …). Ninguna tool de borrado,
movimiento o envío se expone.

Para la purga aprobada hay que salir del modo lectura de forma **explícita**.
Como los guardrails viven en el entorno y no en código, la vía recomendada es
no relajar el MCP general, sino usar el CLI `@gws/mail-cleanup` (que mueve a
Trash con dry-run y confirmación). Si aun así se quiere habilitar el MCP para
borrado, se arranca una vez con:

```dotenv
IMAP_MCP_READ_ONLY=false
```

## Variables reconocidas

| Variable | Efecto |
|---|---|
| `IMAP_MCP_READ_ONLY` | `true` (por defecto) limita a tools de lectura. |
| `IMAP_MCP_ENABLED_TOOLS` | Allowlist explícita de tools (tiene prioridad). |
| `IMAP_MCP_SERVER_ENTRY` | Ruta al `dist/index.js` si se instala en otro sitio. |
| `GWS_IMAP_ENV_FILE` | `.env` adicional de menor prioridad. |

## Seguridad

- Los secretos se leen **solo** de `.env`/`.env.local`; no se escriben en
  `opencode.json`, en el repo ni en `accounts.json` (usuario/clave vacíos).
- `~/.imap-mcp/.key` + `accounts.json` son locales y de solo-propietario.
- Diagnóstico del launcher por **stderr**; stdout queda limpio para el protocolo.
