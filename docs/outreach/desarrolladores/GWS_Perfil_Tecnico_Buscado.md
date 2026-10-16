# Perfil Técnico Buscado — Núcleo de Glass World Studio

> **Flecha 2 — Desarrolladores y Arquitectos**
> Documento para compartir con devs en la conversación (no va en el primer mensaje).
> Última actualización: 16-10-2026

Buscamos **pocas personas, muy buenas**, para construir el núcleo técnico de un marketplace
vertical a escala global. Esto no es un puesto corporativo: es una **etapa fundacional**.

---

## 1. Qué es Glass World Studio (en 30 segundos)

Un marketplace vertical integral para la **industria global del vidrio** — un sector milenario
(vidrio plano: **USD 323.200 M en 2025 → USD 450.200 M en 2033**), hoy completamente fragmentado y
sin infraestructura digital común. Y con un **mercado real de taller (~60%) que las consultoras no
miden**: nace para **cartografiarlo** y ser dueño de ese dato.

Se apoya en una arquitectura viva:

- **6 Galaxias** (la masa): Maestros · Comercio · Comunidad · Bono Silicato & Envases ·
  Industria · Materiales/Componentes.
- **5 Satélites** (los servicios): Radar de Oferta y Demanda · Radar de Ingeniería Predictiva
  (Termia/COE) · Portal de Profesionales · Rincón del Usado · Bóveda del Conocimiento.

La plataforma está **en producción** (`/novedades`, `/umbral`, membresía con credencial), con
visión y arquitectura definidas. Lo que falta es **motorizar los motores reales**.

---

## 2. Los roles que buscamos

### 2.1 Full-stack / Producto
- **Qué harías:** llevar features de punta a punta — de la UI al modelo de datos.
- **Foco:** catálogo, perfiles de usuario, credencial de pertenencia, paneles.
- **Buscamos:** alguien que le guste **resolver producto**, no sólo escribir componentes.
- **Stack:** ver sección 3.

### 2.2 Backend / Plataformas B2B y transaccionales
- **Qué harías:** el corazón transaccional del marketplace.
- **Foco:** oferta y demanda en tiempo real, **licitaciones**, matching, trazabilidad, pagos.
- **Buscamos:** experiencia real construyendo **marketplaces o plataformas transaccionales**.
- **Pregunta de filtro:** ¿qué parte es la más difícil de hacer bien: matching, licitaciones,
  pagos o trazabilidad?

### 2.3 Arquitectura multi-agente / MCP / IA
- **Qué harías:** el **enjambre de agentes** detrás de los satélites de servicio.
- **Foco:** orquestación de agentes, MCP, los 5 satélites de ingeniería predictiva
  (Termia / COE).
- **Buscamos:** experiencia real en **sistemas multi-agente** y orquestación, no sólo prompts.
- **Pregunta de filtro:** ¿con qué stack y orquestación venís construyendo multi-agente, y qué
  es lo que más te cuesta?

---

## 3. Stack actual (verificado)

| Capa | Tecnología |
|---|---|
| Lenguaje | **TypeScript** (estricto) |
| Monorepo | **pnpm workspaces** (`apps/web`, `packages/schemas`, `packages/taxonomy`) |
| Web | **Next.js** (App Router) |
| Validación / contratos | **Zod** — fuente única de verdad (esquemas y taxonomía) |
| Datos | `[COMPLETAR: definir motor — hoy la web es estática; la persistencia del marketplace está por definirse]` |
| Agentes / IA | **MCP** y orquestación multi-agente (`[COMPLETAR: stack de orquestación a confirmar]`) |
| Estilos | CSS propio con variables de diseño (no hay framework de utilidades hoy) |
| Deploy | **Vercel** (proyecto `glass-world-studio`) |
| Repositorio | **Privado** (acceso se otorga al sumarse) |

**Principios de ingeniería del proyecto:**
- TypeScript + Zod en todo. Sin `any` sueltos.
- **Separación de capas:** la UI no conoce los datos; el motor no conoce la UI.
- Nada de plantillas genéricas: cada nodo del dominio es real y validado.
- Datos **nunca** hardcodeados en la UI.

---

## 4. Qué ofrecemos (sin humo)

- **Trabajo real y visible:** no es un MVP de juguete. Es un proyecto con marca en trámite ante
  el INPI y una visión global.
- **Rol de base:** entrar a **construir el núcleo**, no a mantener lo que otro hizo.
- **Autonomía técnica:** quien construye, decide sobre su terreno.
- **Modelo de participación:** por ser etapa fundacional, la **participación y las condiciones se
  pactan** de común acuerdo. `[COMPLETAR: definir rango de participación / esquema de compensación antes de prometerlo]`
- **Flexibilidad:** remoto, horarios a convenir.

---

## 5. Qué NO prometemos (guardarraíles de honestidad)

- ❌ Un salario de empresa grande. Es etapa fundacional.
- ❌ Un equipo armado. Hoy somos pocos y lo estamos formando.
- ❌ Métricas de usuarios o ingresos que todavía no existen.
- ❌ Un producto terminado. Lo que hay es **arquitectura + visión + base en producción**.

Prometemos exactamente lo que hay: un problema grande, una arquitectura definida y la
posibilidad de **dejar huella** en algo global.

---

## 6. Cómo seguimos

1. Una charla de **20–30 minutos**, técnica, sin guion.
2. Si hay match: acceso al repositorio y una **primera tarea concreta** (a modo de prueba mutua).
3. Si funciona para los dos: se define el rol y **se pactan las condiciones**.

**Contacto:** Eduardo Esper · Fundador · esper.eduardo@gmail.com · WhatsApp +54 9 385 582-6289 · Web <https://glassworldstudio.com.ar>

---

## Pendientes internos (antes de enviarlo)

- `[COMPLETAR]` Stack de orquestación multi-agente y de persistencia.
- `[COMPLETAR]` Esquema de participación / compensación para el rol fundacional.
- `[COMPLETAR]` Confirmar si se mantiene el CSS propio o se migra a utilidades.
