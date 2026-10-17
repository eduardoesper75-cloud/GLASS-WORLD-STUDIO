# S1 — Remediación de credenciales expuestas (protocolo)

> **Motivo:** el 16-10-2026 se detectó que `docs/outreach/herramientas/GWS_Parte_Tecnico_IMAP_MCP.md`
> §1.2 contenía **4 credenciales en texto plano** (2 contraseñas de aplicación de Gmail + 2
> contraseñas de cuenta) y estaba **versionado en Git**. Este documento es el procedimiento de
> remediación: saneamiento de archivos, **rotación**, saneamiento de historial y verificación.
>
> **Estado:** archivos saneados (`37c3fd8`) + placeholder estandarizado · **historial reescrito y
> adoptado ✅** (escáner limpio sobre 52 commits) · **rotación: pendiente** a cargo del titular, con
> helper listo (`tools/security/rotate-app-password.ps1`).

---

## 0. Alcance de la exposición

| Qué | Dónde | Estado |
|---|---|---|
| 2 contraseñas de aplicación (casilla `eduardoesper75`) | `GWS_Parte_Tecnico_IMAP_MCP.md` §1.2 | Redactadas en HEAD · **purgadas del historial ✅** |
| 2 contraseñas de cuenta (Google) | ídem | Ídem · **rotación pendiente** (titular) |
| Riesgo de propagación | **Repo sin remoto** (`git remote -v` vacío) → la fuga es **local** | Mitigado (historial saneado; rotación pendiente) |

> Las casillas están ligadas a servicios financieros (banca, billeteras, cripto) → el impacto
> potencial es **alto**. Prioridad: **rotar ya**.

---

## 1. Saneamiento de archivos (hecho)

- ✅ `.env.local` y cualquier `.env.*` están **ignorados** (`.gitignore` línea 16: `.env.*` con
  excepciones `!.env.example` y `!.env.production.example`).
- ✅ `data/mail-cleanup/` (PII del correo) **ignorado** (`.gitignore` línea 45).
- ✅ El documento con credenciales quedó **redactado** con placeholders `<IMAP_PASSWORD_HIDDEN>`.
- ✅ Escaneo del árbol rastreado: **0 coincidencias** de patrones de secretos.

### Regla permanente
> Ninguna credencial en Markdown, código, issues, capturas ni chats. **Solo** en `.env` / `.env.local`
> (ignorados). El código debe leer por `process.env.*` o equivalente.

---

## 2. Rotación de credenciales (paso a paso)

> Hay que rotar **por casilla**. Google **no** muestra la contraseña de aplicación una vez creada:
> se **revoca** y se **genera una nueva**.

### 2.1 Contraseñas de aplicación (IMAP)

Para la casilla de Gmail (**`eduardoesper75@gmail.com`**):

> La casilla institucional (`edu.esper@glassworldstudio.com.ar`) corre en **Don Web, no en
> Google**: su contraseña se gestiona en el panel del proveedor (ver `GWS_Checklist_Salida_Operativa.md` §1),
> no como contraseña de aplicación.

1. Ingresar a la cuenta y verificar que la **verificación en dos pasos (2FA)** esté activa:
   `https://myaccount.google.com/security`.
2. Abrir **Contraseñas de aplicaciones**: `https://myaccount.google.com/apppasswords`.
3. **Revocar** la contraseña existente (la que estaba en el documento):
   > El nombre con que se creó suele ser *"GWS OpenOutreach"* / *"Mail"* / *"IMAP"*.
   > Revocarla invalida de inmediato el valor filtrado.
4. **Crear** una nueva: nombre sugerido **`GWS IMAP <casilla>`** (para distinguirlas).
5. Copiar el código de **16 letras sin espacios**.

### 2.2 Contraseñas de cuenta (Google)

1. `https://myaccount.google.com/signinoptions/password` → **Cambiar contraseña**.
2. Usar una contraseña **larga y única** (gestor de contraseñas).
3. Revisar **sesiones activas** (`https://myaccount.google.com/device-activity`) y cerrar las
   desconocidas.
4. Revisar **accesos de terceros** (`https://myaccount.google.com/connections`).

### 2.3 Actualizar los secretos en los `.env` (nunca en git)

| Archivo | Clave | Valor |
|---|---|---|
| `<repo>\.env.local` | `IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_PASSWORD` | *(nueva contraseña de app)* |
| `C:\Users\eduesper\AppData\Local\gws-tools\openoutreach\.env` | `OUTSEND_MAILBOX_PASSWORD` | *(nueva contraseña de app de la casilla de envío)* |

> El runner OpenOutreach y el CLI `@gws/mail-cleanup` leen de estos `.env` externos. Tras rotar,
> **revalidar** (ver §4).

> **Helper (recomendado, lo corre el titular):** tras crear la nueva app password, en vez de editar a
> mano ejecutá:
> ```powershell
> powershell -ExecutionPolicy Bypass -File tools/security/rotate-app-password.ps1 -Account eduardoesper75 -Validate
> ```
> Pide la nueva app password por **entrada segura** (nunca se muestra ni se versiona), actualiza
> `.env.local` y el `.env` del runner, y (con `-Validate`) prueba la autenticación IMAP. El agente
> nunca ve el valor. Ver también la regla §8.2.

---

## 3. Saneamiento del historial de Git

> **Estrategia segura:** reescribir el historial **en un clon** (no en el repo en vivo), para no
> arriesgar el trabajo sin commitear (hoy: 39 archivos). El repo en vivo se adopta **después**.

### 3.1 Ejecutar el saneamiento (script incluido)

```powershell
# 1) Escaneo previo (debe reportar las credenciales en el historial):
powershell -ExecutionPolicy Bypass -File tools/security/scan-secrets.ps1

# 2) Reescritura en clon + verificación (no toca el repo en vivo):
powershell -ExecutionPolicy Bypass -File tools/security/scrub-git-history.ps1 `
    -ExtraSecrets "<contrasena-cuenta-vieja-1>","<contrasena-cuenta-vieja-2>"
```

El script:
1. recolecta los secretos (**app passwords** desde `.env.local`, cuenta desde `-ExtraSecrets`);
2. crea un **bundle de respaldo** (`backup-antes-de-scrub-*.bundle`);
3. clona el repo a `%LOCALAPPDATA%\Temp\opencode\gws-scrub\gws-scrubbed`;
4. descarga `git-filter-repo` (script Python de un solo archivo) si falta;
5. aplica `--replace-text` (cada secreto → `<REDACTED>`);
6. **verifica** que no quede ninguno;
7. empaqueta el clon saneado (`gws-scrubbed-*.bundle`).

### 3.2 Adoptar el historial saneado (`adopt-scrubbed-history.ps1`)

> El script hace **todo** con respaldo y **preservación de tu trabajo pendiente** (stash automático).
> Por defecto corre en **preflight** (no toca nada); con `-Execute` aplica.

```powershell
# 1) Preflight: muestra el plan y los refs del bundle (NO modifica nada)
powershell -ExecutionPolicy Bypass -File tools/security/adopt-scrubbed-history.ps1

# 2) Aplicar: respaldo -> stash -u -> swap de `main` -> stash pop -> reflog+gc -> verificación
powershell -ExecutionPolicy Bypass -File tools/security/adopt-scrubbed-history.ps1 -Execute
```

En orden: 1) bundle de seguridad del repo en vivo; 2) `git stash push -u` del trabajo pendiente;
3) `git fetch` del bundle + **swap** de `main` (aborta si el árbol no coincide); 4) `git stash pop`;
5) `reflog expire --expire=now` + `gc --prune=now` (purga los objetos con secretos); 6) verificación.

> **Restaurar respaldo** (si algo saliera mal):
> `git clone <backup-antes-de-adopt-*.bundle> repo-restaurado`

---

## 4. Verificación post-remediación

```powershell
# a) Sin secretos en el árbol rastreado:
git grep -n -I -E "AIza[0-9A-Za-z_-]{30,}|sk-[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----"

# b) Sin rastro en el historial (reemplazar <SECRETO>):
git log --oneline -S "<SECRETO>" --all      # debe salir vacío

# c) Escáner del repo:
powershell -ExecutionPolicy Bypass -File tools/security/scan-secrets.ps1

# d) Credenciales nuevas válidas (IMAP):
pnpm --filter @gws/mail-cleanup start audit --days 1
#    -> debe autenticar sin error en ambas casillas.
```

---

## 5. Fase 0 — Lista corta para "salir a la calle"

Una vez cerrado S1:

| # | Pendiente | Acción concreta | Evidencia de cierre |
|---|---|---|---|
| **B1** | ~~Fuente citable de las cifras de mercado~~ **✅ CERRADO (16-10-2026)** | Resuelto en `docs/outreach/GWS_B1_Fuentes_Cifras_Mercado.md`: vidrio plano USD 323.200 M (2025) → USD 450.200 M (2033), Grand View Research; se retira “+50 M” | Fuente nombrable en la 1.ª conversación (ver §6) |
| **O1** | **API keys del runner** (OpenOutreach) | Cargar `OPENOUTFIND_LLM_API_KEY`, `OUTSEND_LLM_API_KEY` y `OPENOUTFIND_BETTERCONTACT_API_KEY` en su `.env` | `run.ps1 status` sin pendientes |
| **O2** | ~~Redeploy del sitio~~ **✅ CERRADO (16-10-2026)** | `npx vercel --prod` ejecutado (deploy `READY`) | Contacto `edu.esper@glassworldstudio.com.ar` en vivo en `/novedades`, sin correo viejo. Pendiente menor: el **teléfono** `+54 9 385 622-8400` no está en la web |
| **B2** | **Esquema participación/compensación** | Definir rango fundacional + esquema inversor | Documento interno |
| **B7** | **Tanda 5 de devs** | Correr `harvest-github.mjs` (MCP/datos/i18n) y curar | Pool ampliado |

---

## 6. B1 — Candidatos de fuente para las cifras de mercado

> Estas cifras hoy **no tienen fuente citable** y son el gancho del deck. Verificar y citar **una**.

1. **Fortune Business Insights / Grand View Research / Mordor Intelligence** — reportes de
   *"Glass Manufacturing Market"* / *"Flat Glass Market"* (suelen dar USD y CAGR; ver el **año** y el
   **alcance**).
2. **Glass Alliance Europe** (`glassallianceeurope.eu`) — *Key data* / *Glass Facts* de la industria.
3. **NSG / Corning / Saint-Gobain / Owens-Illinois (O-I)** — informes anuales con tamaño de mercado.
4. **UNIDO / OIT / Statista** — empleo del sector (la cifra de "+50 M de personas" exige una fuente
   de **empleo**, no de mercado; probablemente haya que **ajustar o quitar** esa cifra).

> **Regla:** si no se consigue fuente, **no se afirma el número**. Mejor poco dato real que mucho
> inventado.

---

## 7. Hallazgo secundario (S2) — tokens/PII en el informe de ranking

Durante la verificación de entorno se detectó que
`docs/outreach/herramientas/GWS_Reporte_Ranking_Correo.md` (versionado) incluía, en la columna
**Destino**, **61 URLs de baja** con tokens de un solo uso y, en al menos un caso, el correo del
titular codificado en base64 (`ZWR1YXJkb2VzcGVyNzVAZ21haWwuY29t` → `eduardoesper75@gmail.com`).

- **Riesgo:** quien lea el informe podría dar de baja suscripciones del titular (molestia) y se
  expone PII. Severidad **baja** (no compromete cuentas), pero contraria a la regla de PII del proyecto.
- **Corrección aplicada:**
  1. **Redacción** de las 61 URLs en el informe → `<UNSUBSCRIBE_URL_HIDDEN>` (PII verificada ausente).
  2. **Saneo del generador** `packages/mail-cleanup/src/audit.ts`: el informe **ya no emite** los
     destinos (los deja como placeholder). Los valores crudos siguen sólo en `data/mail-cleanup/`
     (ignorado por git) para las operaciones reales. Tests: **9/9 OK**.
- **Residual:** las URLs siguen en el **historial** de Git (igual que S1). Se cubren con el mismo
  saneamiento (§3) si se decide reescribirlo.

---

## 8. Reglas permanentes (para no repetir)

1. **Secretos sólo en `.env`.** Nunca en Markdown, código, issues, capturas, chats ni commits.
2. **El titular rota sus credenciales** manualmente; el agente **nunca** las maneja ni las escribe.
3. **Los informes generados no publican tokens/PII**: sólo rankings y etiquetas; los datos crudos
   viven en carpetas ignoradas (`data/…`).
4. Antes de publicar/`push`, correr `tools/security/scan-secrets.ps1`.
5. Ante una fuga: **rotar primero** (invalida el dato filtrado), **sanear el historial después**.

---

**Contacto oficial**
Eduardo Esper — Fundador, Glass World Studio
E-mail: edu.esper@glassworldstudio.com.ar · WhatsApp / Tel: +54 9 385 622-8400
Santiago del Estero, República Argentina
