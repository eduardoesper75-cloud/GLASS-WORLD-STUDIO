# Flujo de Alta del Búnker — Registro de Ingenieros (UX)

> **Qué**: formulario maestro de matriculación de ingenieros del Búnker en la
> portada (`design-system/portada-umbral.html`).
> **Objetivo de producto**: red de demanda de ingenieros del vidrio, perfil
> verificado por élite, **0 % comisión**, membresía USD 50/mes.
> **Métrica real de UX**: la orden de marketing pedía "máximo 3 clics". CLAUDE.md
> rechaza "3 clics" como métrica (es un mito de cuantificación) → aquí se
> implementa el flujo en 3 pasos estructurales (compatible con la directiva)
> pero se mide **tiempo-a-acción** y **reducción de ambigüedad** (abandonos por
> paso, errores de validación corregidos).

---

## 1. Los 3 pasos del flujo

| Paso | Pantalla | Campos | Puerta de salida |
|---|---|---|---|
| 1 · Perfil | `#bk-s1` | Intro + nombre público | "Continuar" → paso 2 |
| 2 · Datos | `#bk-s2` | fullName, email, teléfono E.164, país ISO alpha-2, región, título, matrícula, institución, años, especialidades (≥1), soportes (≥1) | "Revisar" → paso 3 (validación) |
| 3 · Verificación | `#bk-s3` | Términos + resumen | "Registrar" → POST `/bunker/specialists` |

Los pasos 2 y 3 arrancan `hidden`; el stepper `.bk-step` marca el paso activo
(`is-active`).

## 2. Validación en tiempo real

- **email**: `type="email"` + `required`.
- **teléfono**: `pattern="^\\+[1-9]\\d{1,14}$"` (E.164 estricto) — el backend
  lo valida igual (`Matches(/^\\+[1-9]\\d{1,14}$/)`).
- **años**: `type="number"` `min=0` `max=60`.
- **país**: select poblado por JS con códigos ISO alpha-2 (`#bk-country`).
- **especialidades y soportes**: checkboxes `.bk-check`; al menos 1 de cada
  uno; el click en la tarjeta alterna `input.checked` y la clase `.sel`.
- **Validación previa al paso 3**: `bkValidateStep2()` corre
  `checkValidity()` sobre los campos requeridos y exige ≥1 especialidad y ≥1
  soporte; si algo falla, `reportValidity()` apunta al campo y no avanza.

## 3. Alta y verificación (contrato con el backend)

`bkSubmit()` envía `POST /bunker/specialists` con payload:
`publicName` (= fullName), `fullName`, `professionalEmail`, `phoneE164`,
`nationality`, `academicTitle`, `registrationNumber`, `issuingInstitution`,
`yearsExperience`, `headline` (título · años), `credentials: []`,
`specialties`, `supportTypes`, `countryCode`, `region`, `hourlyRateUsd: null`.

- Respuesta `2xx` → nota verde: "Perfil creado (id …) · pendiente de
  verificación élite por el comando."
- `401/403` → nota ámbar de sesión (demo queda como pendiente local).
- Red/`4xx/5xx` → nota ámbar de backend offline (demo local pendiente).

**Soberanía**: el alta SIEMPRE crea `pending`. El sello élite (`verified`)
solo lo emite el comando vía `PUT /bunker/specialists/:id/verify` (elevación
ADMIN + audit). El directorio público nunca expone `professionalEmail`,
`phoneE164` ni datos de matriculación (`listSpecialists` los filtra).

## 4. Arquitectura de referencia

- Frontend: `design-system/portada-umbral.html` → sección `#bunker`, bloque
  `.bk-alta` (JS: `bkInit`, `bkGo`, `bkValidateStep2`, `bkSubmit`).
- Backend: `src/bunker/` (entity, DTOs, service, controller, const).
- Migración: `src/database/migrations/1739000000000-BunkerSchema.ts`.

## 5. Métricas a instrumentar (lo que mide el éxito real)

1. **Tiempo-a-acción**: media desde que abre el formulario hasta que toca
   "Registrar" (reemplaza el mito de "3 clics").
2. **Abandonos por paso**: dónde se queda la gente (paso 2 es el candidato
   natural por cantidad de campos).
3. **Errores corregidos**: validaciones disparadas y resueltas (email/teléfono
   E.164 son los esperados).
4. **Verificación élite**: tasa `pending → verified` por el comando.

## 6. Pendientes

- [ ] Instrumentar tiempo-a-acción y abandonos por paso (analítica propia,
      sin terceros).
- [ ] Revisión visual de la portada (paso final del hito).
