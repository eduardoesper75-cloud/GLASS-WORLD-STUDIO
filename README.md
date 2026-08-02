# GWS Backend — Mes 1: Cimientos (Auth + RBAC) + Galaxia 3 (Comunidad)

## Qué es esto, honestamente

Este es el código fuente real del cimiento del backend de Glass World
Studio, escrito para que lo integres a tu repositorio real gestionado
con Claude Code. **No corrió en ningún servidor todavía** — es el punto
de partida, no una demo funcionando.

## Cómo instalarlo en tu máquina (Mes 1 del plan de trabajo)

1. Instalá Node.js LTS y Docker Desktop si no los tenés.
2. Copiá esta carpeta a tu repositorio de Git real (el que vas a abrir
   con Claude Code). Poné ahí también el `CLAUDE.md` y la carpeta
   `.claude/skills/` que ya generamos antes.
3. `cp .env.example .env` y completá `JWT_SECRET` con un valor generado
   localmente (`openssl rand -base64 48`), nunca el placeholder.
4. `docker compose up -d` — levanta PostgreSQL local, sin costo.
5. `npm install`
6. `npm run start:dev` — el backend queda escuchando en
   `http://localhost:3001`.

## Qué probar primero

- `POST /auth/register` con `fullName`, `email`, `username`, `password`,
  `privacyAccepted: true`, `preferredLanguage`.
- `POST /auth/login` con `identifier` (email o username) y `password`.
- Con el `accessToken` devuelto, `POST /community/channels/general/messages`
  con `{ "content": "hola" }` — y `GET /community/channels/general/messages`
  para verlo persistido en la base real.

## Qué falta a propósito (no es un olvido)

- **Verificación de email real** (hoy `emailVerified` queda en `false`
  y no bloquea nada — decidir en el Mes 2 si debe bloquear el login).
- **Rate limiting** sobre `/auth/login` y `/auth/register` (mitigar
  fuerza bruta) — pendiente antes de exponer esto fuera de tu red local.
- **Endpoint para habilitar TOTP** (`totpEnabled`/`totpSecret`) — el
  `AuthService.elevate()` ya lo exige, pero falta el flujo de setup
  (generar secreto, mostrar QR, confirmar primer código). Se agrega
  cuando definas quién va a tener rol admin además de vos.
- **Migraciones versionadas de TypeORM** en vez de `synchronize: true`
  — obligatorio antes de tocar una base con datos reales (ver
  comentario en `app.module.ts`).

## Antes de escribir una sola línea más sobre esto

Corré este código contra el checklist de `.claude/skills/gws-security-hardening/SKILL.md`
antes de exponerlo fuera de tu máquina — varios puntos de ese checklist
(secretos, rate limiting) todavía no están resueltos acá a propósito,
para no darte una falsa sensación de "ya está listo para producción".
