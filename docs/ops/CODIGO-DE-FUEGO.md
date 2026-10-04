# Código de Fuego — Reglas de trabajo para agentes de IA

> **Estado: INCOMPLETO · 2026-10-03**
> **Autoridad:** Jorge Eduardo Esper (Comandante en Jefe / Founder)
> **Alcance:** reglas operativas que gobiernan cómo trabaja cualquier agente de
> IA (Claude, Verdent, u otro) sobre este repositorio.

---

## ⚠️ Aviso de completitud — leer antes de usar

Este documento esta **incompleto a proposito**. Se planeo asi en lugar de
inventar el contenido faltante:

- **Sección 2 (las 42 reglas CF-01…CF-42): PENDIENTE.** El texto original fue
  provisto por Jorge en una sesión anterior, cuyo contenido ya no está
  disponible en el contexto actual. **No se transcribió de memoria ni se
  generaron reglas plausibles:** una regla de gobernanza inventada es peor que
  una ausente, porque da autoridad aparente a algo que nadie aprobó.
- **Sección 1 (los 8 pasos) y la sección 3 (las 10 reglas de trabajo):
  PENDIENTES** por la misma razón.

Para completar este documento, hace falta que Jorge vuelva a pegar el texto
original, o que se reconstruya desde la fuente que lo originó.

---

## 1 · Las 42 reglas del Código de Fuego (CF-01 … CF-42)

**PENDIENTE — no disponible.**

Se espera: 42 reglas numeradas `CF-01` a `CF-42`, cada una con su fundamento.
Cuando esten disponibles, reemplazar esta seccion y eliminar este aviso.

---

## 2 · Los 8 pasos

**PENDIENTE — no disponible.**

---

## 3 · Las 10 reglas de trabajo

**PENDIENTE — no disponible.**

### 3-bis · Las 10 reglas verificables derivadas de `CLAUDE.md`

> **Esto NO es el texto original de la sección 3.** Ese sigue pendiente y no se
> sustituye. Lo que sigue es una **derivación de `CLAUDE.md`**, que sí está
> disponible y es la fuente de verdad vigente (`§4.1`). Son reglas **comprobables
> mecánicamente**: cada una se puede auditar sin memoria ni interpretación.

| # | Regla | Fuente | Cómo se verifica |
|---|---|---|---|
| R1 | Cero lectura de credenciales de tesorería (Mercado Pago, Stripe, banco) | `CLAUDE.md` §3.1 | El agente no puede leer ni imprimir esas claves en ninguna sesión |
| R2 | Cero escritura en `Payment_Vault` | `CLAUDE.md` §3.1 | `git log` sin commits de IA sobre ese path |
| R3 | Cero cambio autónomo de tarifas, comisiones o condiciones | `CLAUDE.md` §3.1 | Cada cambio de precio pasa por "agente propone → Jorge confirma → se ejecuta" |
| R4 | Cero acceso a configuración raíz de infra (SSH, secretos de entorno) | `CLAUDE.md` §3.1 | El agente no ejecuta `ssh` ni edita `.env` en producción |
| R5 | Prohibido el contacto automatizado en masa | `CLAUDE.md` §3.2 | Toda salida a un lead pasa por revisión humana previa |
| R6 | Toda publicación a nombre de GWS requiere aprobación humana | `CLAUDE.md` §3.2 | Cada email/post queda como borrador hasta que Jorge lo aprueba |
| R7 | El Código Rojo es una acción de infraestructura, no una orden al agente | `CLAUDE.md` §3.3 | Ningún diseño depende de que el agente "decida detenerse" |
| R8 | Todo cambio pasa por staging → validación → canary → producción, **con rollback definido antes** | `CLAUDE.md` §3.4 | No se aplica un cambio sin responder "¿cómo se revierte?" |
| R9 | Toda sesión arranca en el menor privilegio; la elevación a `admin` re-autentica y **expira sola** (20-30 min) | `CLAUDE.md` §3.5 | `elevated-session` con expiración; log inmutable por acción |
| R10 | Toda negociación ocurre dentro de la plataforma; bloqueo **server-side** | `CLAUDE.md` §3.6 | `contact-leak-filter.ts` devuelve HTTP 400 antes de guardar |

**Por qué esto no contradice el aviso de completitud:** las 42 reglas `CF-01…CF-42`
siguen sin existir y no se inventaron. Lo que se agrega son 10 reglas que salen
de un documento **disponible y autoritativo**, que además ya estaba citado en
`§4.1`. Si Jorge pega el texto original de la sección 3, esta subsección se
elimina sin pérdida.

---

## 4 · Lo que SÍ está vigente hoy

Mientras las 42 reglas no se incorporen, la gobernanza efectiva de este
repositorio está en otro documento. Estas son las reglas **confirmadas y
verificadas**, todas ya vigentes:

### 4.1 Fuente de verdad

- `CLAUDE.md` es la **única** fuente de verdad del proyecto. Se lee
  automáticamente al iniciar sesión.
- Si una instrucción puntual contradice `CLAUDE.md`, la sesión debe **señalar
  el conflicto explícitamente** antes de proceder. La regla general gana
  salvo que Jorge la modifique en el propio archivo (§6 de `CLAUDE.md`).

### 4.2 Zona de exclusión — sin excepción (§3.1)

- Cero acceso a credenciales de tesorería (API keys de Mercado Pago / Stripe,
  credenciales bancarias).
- Cero escritura en `Payment_Vault`. Solo Jorge, con elevación + 2FA.
- Cero cambios autónomos de tarifas, comisiones o términos de suscripción.
- Cero acceso a configuración raíz de servidor o infraestructura (llaves SSH,
  secretos de entorno).

### 4.3 Zona de acción — autonomía parcial (§3.2)

- Identificación de leads públicos: permitido. **Contacto automatizado en masa:
  prohibido** (riesgo legal: ToS, Ley 25.326, GDPR).
- Marketing y contenido: el agente puede generar borradores; **toda
  publicación a nombre de GWS requiere aprobación humana previa**.
- Soporte de primera línea: permitido, siempre con escalamiento a humano
  disponible.

### 4.4 Código Rojo (§3.3)

El kill switch **no es una instrucción que un agente obedezca**. Es una acción
de infraestructura ejecutada por Jorge: revocar credenciales desde el lado
humano. Un diseño que dependa de que el agente "se decida a parar" está mal
diseñado y debe rechazarse.

### 4.5 Despliegue (§3.4)

Ningún cambio se aplica directo a producción:
**desarrollo → staging → validación → canary → producción.**

Antes de aplicar cualquier corrección debe estar definido el **mecanismo de
rollback**. Si no se puede responder "¿cómo se revierte esto?", no se aplica.

### 4.6 RBAC en capas (§3.5)

`viewer` → `moderator_gN` → `admin`. Toda sesión arranca en el **menor
privilegio** disponible para esa cuenta. La elevación a `admin` requiere
**re-autenticación (contraseña + TOTP)** y expira sola (20-30 min). Toda
acción en modo elevado queda en log inmutable y dispara notificación por un
**canal distinto** al usado.

### 4.7 Soberanía de plataforma — el chat interno es la única vía (§3.6)

Todo contacto, negociación y cierre ocurre **dentro** de GWS. Bloqueo
**server-side**, no advertencia: `src/community/anti-leak/contact-leak-filter.ts`
rechaza con HTTP 400 antes de guardar.

Prohibido integrar canales externos (WhatsApp API, email externo, redes) como
vía de negociación.

### 4.8 Convenciones de código (§5)

- Comentarios explicando el **por qué** de una decisión de diseño o negocio,
  no solo el qué.
- Nombres de entidades y variables en **inglés**; contenido de cara al usuario
  en **español**. Sin idiomas adicionales sin traducciones de Jorge.
- **Nunca** API keys o secretos en texto plano bajo ninguna circunstancia.

### 4.9 Blindaje jurídico y comercial

Vigente y completo en **`docs/manual/codigo-del-fuego.md`** (288 líneas): comisiones
por Galaxia, matriz de liberación de escrow, embalaje certificado, blindaje
jurídico, settlement USD/USDT.

> **Nota de nomenclatura:** ese manual y este documento comparten el nombre
> "Código del Fuego" pero **son distintos**. El manual es un documento de
> producto para usuarios; este es un contrato de trabajo para agentes de IA.
> Mantenerlos separados es deliberado: mezclarlos haría que una regla de
> gobernanza pareciera una cláusula comercial.

---

## 5 · Trazabilidad

| Sección | Estado | Fuente |
|---|---|---|
| 1 · 42 reglas (CF-01…CF-42) | ❌ PENDIENTE | texto no disponible |
| 2 · 8 pasos | ❌ PENDIENTE | texto no disponible |
| 3 · 10 reglas de trabajo | ❌ PENDIENTE | texto no disponible |
| 4 · Gobernanza vigente | ✅ COMPLETA | `CLAUDE.md` + `docs/manual/codigo-del-fuego.md` |

**B16 permanece abierto** hasta que las secciones 1-3 se completen.