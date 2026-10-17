# Parte de Situación Estratégica — Frente 2

> **Glass World Studio (GWS) busca Alianzas Estratégicas: Inversores, Desarrolladores y Logística.**
> Orden de prioridad: 1) Inversores y capital · 2) Desarrolladores · 3) Logística (pilar operativo).
> Estado de situación del motor de alianzas.
> **Fecha:** 16-10-2026 · **Elaborado por:** Agente Principal GWS (relevamiento del repositorio).
> **Alcance:** inspección de `docs/outreach`, `docs/logistica`, generadores, `packages/mail-cleanup`,
> `tools/` y estado en Git. **Método:** lectura directa de fuentes internas; **cero datos inventados**.

---

## 0. Resumen ejecutivo

El **contenido estratégico está construido y es de alta calidad**, pero el **outreach está en 0
envíos**: todo el pipeline está en estado `a validar` / `nuevo`. Existe **material listo para ~144
contactos** (98 devs + 28 logísticos + 18 institucionales) y un **motor de generación** funcional,
con **seis brechas estratégicas**, **bloqueos operativos** y **un hallazgo crítico de seguridad**
que obliga a rotar credenciales antes de seguir.

| Dimensión | Estado |
|---|---|
| Documentación estratégica (kits, deck, secuencias, manifiesto) | ✅ **Completa** |
| Listas de prospección (volumen) | ✅ **Construidas** (98 + 28 + 35) |
| Piezas de contacto redactadas | ✅ **144 envíos + formularios** |
| Motor de generación (scripts Node) | ✅ **Operativo** |
| Higiene de la casilla de correo (Frente 1) | ✅ **392 correos a Trash · 23 bajas** |
| Envíos efectivamente realizados | 🔴 **0** |
| Respuestas / conversaciones | 🔴 **0** |
| Alianzas firmadas | 🔴 **0** |
| Bloqueos de envío (credenciales del runner) | 🟠 **1 parcial** (IMAP OK; faltan API keys del runner) |
| Riesgos de seguridad | 🔴 **1 crítico abierto (S1)** |
| Brechas estratégicas (definiciones) | 🟠 **6 abiertas** |

> **Diagnóstico en una línea:** la fábrica está montada y las piezas de contacto, fabricadas; falta
> **definir cuatro decisiones estratégicas**, **desbloquear el canal** y **apretar el botón** (a mano).

> ⚠️ **Hallazgo crítico (S1):** el parte técnico `docs/outreach/herramientas/GWS_Parte_Tecnico_IMAP_MCP.md`
> (§1.2) dejó **credenciales en texto plano** (2 contraseñas de aplicación de Gmail + 2 contraseñas de
> cuenta) **commiteadas en Git**. Requiere **rotación inmediata** y redacción del documento. Detalle
> en §4 (S1) y §7.

---

## 1. Mapa de activos (inventario por pilar)

| Pilar | Documento núcleo | Lista de contactos | Piezas de contacto | Generador |
|---|---|---|---|---|
| **Inversores / Alianza** | `inversores/README.md` · `GWS_Pitch_Deck_Inversores.md` · `GWS_Secuencia_Outreach_Inversores.md` · `GWS_Guia_Prospeccion_Inversores.md` | `linkedin/prospects.csv` (**35 organismos**) | `GWS_Correos_Institucionales.md` (**18**) · `GWS_Manifiesto_Condensado_Formulario.md` · `GWS_Tanda4_Inversores_Industria.md` | `generate-drafts.mjs` · `generate-correos-institucionales.mjs` |
| **Desarrolladores / Arquitectos** | `desarrolladores/README.md` · `GWS_Secuencia_Outreach_Desarrolladores.md` · `GWS_Perfil_Tecnico_Buscado.md` | `prospects_devs.csv` (**98 perfiles**) · `agencias_tech.csv` (11) | `GWS_Envio_Devs.md` (**98**) · `drafts_devs.md` | `harvest-github.mjs` · `generate-envios.mjs` · `generate-drafts.mjs` |
| **Logística / Cadena de suministro** | `logistica/README.md` · `GWS_Logistica_Marketplace.md` · `GWS_Matriz_Proveedores_Logisticos.md` · `GWS_Priorizacion_Logistica.md` | `logistica_aliados.csv` (**28 organizaciones**) | `GWS_Correos_Logistica.md` (10) · `GWS_Correos_Forwarders.md` (8) · `GWS_Correos_Logistica_Cierre.md` (10) | `generate-correos-logistica.mjs` |
| **Marco común** | `manifiesto_convocatoria.md` (ES/EN) · `GWS_Reaparicion_*` · `GWS_Alianzas_Estrategicas_*` · `GWS_Modelo_Alianza_*` | — | — | — |
| **Frente 1 — Higiene de correo** | `herramientas/GWS_Parte_Tecnico_IMAP_MCP.md` · `GWS_Reporte_Ranking_Correo.md` · `GWS_Herramientas_Limpieza_Correo.md` | 2 casillas · 180 remitentes | — | `packages/mail-cleanup` · `tools/imap-mcp` |

**Totales con pieza lista:** `98 devs + 28 logísticos + 18 institucionales = 144 envíos` (+ formularios web).

> **Aclaración de frentes.** El **Frente 1** (desarrollo/plataforma) ya entregó el CLI `@gws/mail-cleanup`
> y la integración MCP `imap` (herramientas operativas). Este parte cubre el **Frente 2** (búsqueda
> estratégica y outreach), usando la higiene de la casilla como contexto habilitante.

---

## 2. Estado por pilar

### 2.1 Inversores y alianza estratégica

**Qué está construido**
- **Pitch Deck (5 slides)** con mensaje clave / contenido / notas del orador; tesis "no capital pasivo".
- **Secuencia de 3 toques** (email + LinkedIn), con criterios de avance/descarte y "qué NO hacer".
- **Guía de prospección**: espectro (`fondo` / `angel` / `industrial`), fuentes conformes, cómo cargar el CSV.
- **Trilogía comunicacional publicada** en el sitio (Reaparición · Alianzas · Modelo).
- **Carta Convocatoria Institucional** + **18 correos institucionales** con firma oficial.
- **Manifiesto condensado** (versión A ~750 car. y versión B micro) para formularios web.
- **Tanda 4**: 15 organismos nuevos (8 con correo directo: cámaras del vidrio europeas, ABIVIDRO, Inveready, FORUM Family Office).

**La lista** — `prospects.csv` (35 organismos): **12 fondos** · **4 redes de ángeles** · **19 industriales/cámaras**.
Casi todas las filas son **a nivel organización**; **18 de 35** tienen correo directo, el resto formulario.

**Brecha clave del pilar:** falta la **persona** (socio/analista) detrás de cada fondo. En fuentes abiertas
no existe vía legítima para obtener emails personales a escala (Crunchbase/PitchBook/AngelList bloqueados o
de pago). La ruta correcta sigue siendo **introducción cálida**.

### 2.2 Desarrolladores y arquitectos

**Qué está construido**
- **Secuencia de 3 toques LinkedIn-first** (nota ≤300 car., apertura de descubrimiento, desafío técnico, cierre).
- **Perfil Técnico Buscado**: 3 roles (fullstack / b2b / multiagente), stack verificado, "qué ofrecemos" y guardarraíles.
- **Pool de 98 perfiles** cosechados de la **API pública de GitHub** (4 tandas), cada uno con `hook` y fuente citable.
  - Distribución: `arquitecto` 40 · `fullstack` 25 · `b2b` 17 · `seguridad` 8 · `multiagente` 7 · `datos` 1.
- **98 envíos redactados** (`GWS_Envio_Devs.md`) + borradores LinkedIn (`drafts_devs.md`).
- **11 agencias tech** de LatAm (`agencias_tech.csv`), casi todas sin correo (`[COMPLETAR]`).

**Brecha clave del pilar:** la **tanda 5 está definida pero no ejecutada** (ejes: MCP/agéntico, datos/BI, i18n).
Además, la línea LinkedIn de devs no tiene perfiles nominales (solo GitHub público, sin email).

### 2.3 Logística y cadena de suministro

**Qué está construido**
- **Arquitectura logística del marketplace** (12 secciones): familias de carga, matriz de decisión
  (fragilidad × valor × peso), empaque técnico (A-frame/crating), modos, flujo en 7 pasos, **RACI**, seguros, métricas.
- **Matriz preliminar de proveedores** (9 categorías) y **priorización en 6 niveles** (28 organizaciones).
- **4 sets de correos** con firma oficial: prioridades 1-2 (arte frágil + crating), 3 (forwarders), 4-6 (navieras/courier/seguro).
- **Manifiesto condensado de logística** para los formularios web.

**Estado:** **28 organizaciones**, **18 con canal directo**, **10 por formulario**. Todas en `a validar`.

**Brecha clave del pilar:** **0 operadores contactados**. La matriz es de **candidatos**, sin acuerdos ni
costos confirmados. La prioridad 1 (arte frágil) es el núcleo y está sin validar.

---

## 3. Motor operativo y estado de envío

### 3.1 Generadores (Node, sin dependencias)
| Script | Entrada → Salida |
|---|---|
| `linkedin/generate-drafts.mjs` | `prospects.csv` → borradores LinkedIn (4 piezas por prospecto, por flecha/perfil) |
| `desarrolladores/harvest-github.mjs` | queries GitHub API → candidatos crudos |
| `desarrolladores/generate-envios.mjs` | `prospects_devs.csv` → envíos con marco + firma |
| `inversores/generate-correos-institucionales.mjs` | carta → correos institucionales |
| `logistica/generate-correos-logistica.mjs` | CSV + prioridades → correos de logística |

### 3.2 Runner OpenOutreach (automatización de descubrimiento + envío)
- Provisto: `run.ps1` (`status` / `find` / `send` / `run`), `env.example`, `context.yaml`, `product.md`, `target.md`, `signature.txt`, `reply-template.md`.
- **Estado: PARCIALMENTE HABILITADO.** Las **contraseñas de aplicación de Gmail** ya existen y validan
  por IMAP (ver §7); siguen pendientes las **API keys de LLM** (`OPENOUTFIND_*` / `OUTSEND_*`) y
  **BetterContact** (leads) para el runner de descubrimiento.
- **Decisión de política vigente:** el outreach es **humano** (máximo 3 toques, ritmo humano, nunca automatizar cuentas).

### 3.3 Estado en Git
- **Versionado:** kits, manifiesto, secuencias, playbook, pitch deck, generadores, `prospects.template.csv`, reportes, CLI/partes de correo.
- **Ignorado (PII, correcto):** `prospects.csv`, `prospects_devs.csv`, `github-tanda*.csv`, `drafts*.md`,
  `GWS_Envio_Devs.md`, `logistica_aliados.csv`, `agencias_tech.csv`, `data/mail-cleanup/`, `.env.local`.
- ✅ **Fuga de secretos (S1) — RESUELTO (16-10-2026):** credenciales redactadas (`<REDACTADO>`) e
  **historial saneado y adoptado**; escáner limpio (árbol + 48 commits). Falta solo la **rotación
  manual** de las 4 credenciales (usuario). Ver `docs/security/GWS_S1_Remediacion_Credenciales.md`.
- ✅ **Checklist de salida** (`GWS_Checklist_Salida_Operativa.md`): **redeploy hecho (16-10-2026)**.
  Contacto oficial publicado en `/novedades` (`edu.esper@glassworldstudio.com.ar`), sin correo viejo. Brecha
  menor: el **teléfono** `+54 9 385 622-8400` **no está en la web** (nunca estuvo).

---

## 4. Brechas y faltantes (consolidado)

| # | Brecha | Impacto | Pilar |
|---|---|---|---|
| **S1** | **Credenciales en texto plano commiteadas** (2 contraseñas de app + 2 de cuenta) en `GWS_Parte_Tecnico_IMAP_MCP.md`. | 🔴 **Crítico (seguridad)** | Transversal |
| **B1** | ~~Cifras de mercado sin fuente citable~~ **✅ RESUELTO** (`GWS_B1_Fuentes_Cifras_Mercado.md`): vidrio plano USD 323.200 M (2025) → USD 450.200 M (2033); se retira “+50 M”. | ✅ Cerrado | Transversal |
| **B2** | **Esquema de participación/compensación** sin definir (inversores y devs). | 🔴 Crítico | Inv + Dev |
| **B3** | **Stack de orquestación multi-agente y de persistencia** sin definir. | 🟠 Alto | Dev (+ pitch) |
| **B4** | **Modelo de ingresos/monetización** sin definir (comisión/suscripción/datos). | 🟠 Alto | Inv |
| **B5** | **Inversores a nivel organización**: falta la persona (socio/analista). | 🟠 Alto | Inv |
| **B6** | **Logística sin validar en la realidad**: 0 operadores contactados, matriz preliminar. | 🟠 Alto | Log |
| **O1** | **Envío del runner**: IMAP ya validado; faltan **API keys de LLM** y **BetterContact**. | 🟠 Parcial | Transversal |
| **O2** | ~~Sitio sin redeploy~~ **✅ RESUELTO (16-10-2026)**: contacto oficial en vivo en `/novedades`; sin correo viejo. Pendiente menor: sumar el **teléfono** a la web. | ✅ Cerrado (salvo tel.) | Transversal |
| **B7** | **Tanda 5 de devs** definida, no ejecutada. | 🟡 Medio | Dev |
| **B8** | **Formularios web** (10 inversores + 10 logística) sin completar. | 🟡 Medio | Inv + Log |
| **B9** | **Agencias tech** casi sin correo (`[COMPLETAR]`). | 🟡 Medio | Dev |
| **B10** | Sin métricas de tracción (usuarios/transacciones/ingresos) — **declarado honestamente**. | 🟡 Medio | Transversal |

---

## 5. Plan de acción propuesto

### Fase 0 — Desbloquear (habilitadores) · *1–2 días*
1. **Cerrar S1 (URGENTE)**: **rotar** las 4 credenciales expuestas y **redactar** el documento
   (reemplazar por `[REDACTADO]`), y evaluar la limpieza del historial de Git (§7).
2. **Cerrar B1**: conseguir el informe/estudio citable de las cifras de mercado (el gancho no se sostiene sin fuente).
3. **Cerrar O1**: cargar las **API keys de LLM** (y BetterContact si se usa el runner) en el `.env` externo.
4. **Cerrar O2**: `vercel --prod` y verificar el contacto oficial en el sitio.

### Fase 1 — Salir a la calle (envíos manuales prioritarios) · *2–3 semanas*
5. **Logística (primero):** contactar **Prioridad 1 (arte frágil, 6)** y **Prioridad 2 (crating, 4)**, 2–3 por semana.
6. **Devs (foco):** enviar primero a los **más afines** — `multiagente` (7) y `b2b` (17) y arquitectos clave.
7. **Inversores:** arrancar por **red cálida** + los **18 correos institucionales**; completar los formularios `[COMPLETAR]`.

### Fase 2 — Cerrar definiciones estratégicas (no se puede prometer lo indefinido)
8. **Cerrar B2** (participación/compensación): rango para rol fundacional y esquema inversor.
9. **Cerrar B3** (stack multi-agente/persistencia) y **B4** (modelo de ingresos).
10. **Cerrar B5** (persona por fondo) vía red cálida y referidos.

### Fase 3 — Escalar (solo con resultados de Fase 1)
11. Ejecutar **tanda 5 de devs** (MCP/agéntico, datos/BI, i18n) → ampliar pool.
12. Registrar avances en los CSV (`nuevo → invitado → aceptado → respondio → archivado`) y **ajustar el copy**
    según las primeras 5 conversaciones.

### Regla de oro (ya vigente en los kits)
> **Máximo 3 toques · ritmo humano · personalización real (`hook`) · nunca automatizar cuentas · mejor poco dato real que mucho inventado.**

---

## 6. Anexo — Inventario de archivos del Frente 2

```text
docs/outreach/
├── manifiesto_convocatoria.md                 (ES/EN, fundacional)
├── GWS_Reaparicion_Eduardo_Esper.md           (comunicado 1)
├── GWS_Alianzas_Estrategicas_Eduardo_Esper.md (comunicado 2)
├── GWS_Modelo_Alianza_Eduardo_Esper.md        (comunicado 3)
├── GWS_Checklist_Salida_Operativa.md          (pendientes técnicos)
├── GWS_Reporte_Prospeccion_OpenWeb.md         (reporte de prospección)
├── GWS_Parte_Situacion_Outreach.md            (este documento)
├── inversores/    (README, Pitch Deck, Secuencia, Guía, Carta, Correos, Manifiesto condensado, Tanda 4)
├── desarrolladores/ (README, Secuencia, Perfil técnico, CSVs, Envíos, Drafts, harvest/generate)
├── linkedin/      (README, Playbook, generate-drafts, plantilla de prospectos)
├── openoutreach/  (run.ps1, env.example, context.yaml, product, target, signature, reply-template)
└── herramientas/  (Frente 1: Parte técnico IMAP/MCP, Ranking de correo, Evaluación de herramientas)
docs/logistica/    (README, Arquitectura, Matriz, Priorización, Correos ×3, Manifiesto condensado, generate)

Frente 1 — código de soporte (Frente: desarrollo/plataforma)
├── packages/mail-cleanup/   (CLI: audit / unsubscribe / purge — 9/9 tests)
└── tools/imap-mcp/          (launcher MCP + provision-accounts; READ-ONLY por defecto)
```

---

## 7. Frente 1 — Higiene de correo y seguridad (contexto habilitante)

**Ejecutado el 2026-10-16** con autorización del titular y **lista blanca** estricta.

| Métrica | Valor |
|---|---:|
| Casillas auditadas | **2 / 2** |
| Correos analizados | **1.296** (573 + 723) |
| Remitentes distintos | **180** |
| Remitentes con `List-Unsubscribe` | **82** (731 correos) |
| Bajas ejecutadas | **23** (22 *one-click* RFC 8058 + 1 `mailto`) |
| Correos movidos a `Trash` | **392** (145 + 247) |
| Borrado permanente | **0** (solo `Trash`, recuperable 30 días) |

- **Lista blanca respetada:** cripto/financiero (Binance, Coinbase, PayPal, Stripe, Mercado Pago,
  Naranja X, BNA, Ualá, Brubank, …), hosting (DonWeb, GWS, GitHub, NVIDIA, Railway, Neon), redes
  (Facebook) y cuentas/seguridad Google. **Ningún dominio protegido fue tocado.**
- Detalle y evidencia: `docs/outreach/herramientas/GWS_Parte_Tecnico_IMAP_MCP.md`.

### S1 — Riesgo de seguridad abierto (acción requerida)
- **Qué pasó:** en §1.2 del parte técnico quedaron **4 credenciales en texto plano** (2 contraseñas de
  aplicación de Gmail y 2 contraseñas de cuenta) y el documento **está versionado** en Git.
- **Exposición:** el repo **no tiene remoto configurado** hoy (`git remote -v` vacío) → la fuga es
  **local**, pero quedará en el historial si se publica. Las casillas están ligadas a servicios
  financieros → el impacto potencial es **alto**.
- **Remediación propuesta (Fase 0, urgente):**
  1. **Rotar** las 2 contraseñas de aplicación en Google y **cambiar** la contraseña de cuenta.
  2. **Redactar** §1.2 del documento (dejar sólo `[REDACTADO]` / referencia a `.env`).
  3. **Higiene de historial:** como no hay remoto, evaluar reescritura (`git filter-repo`) o, mínimo,
     mantener el repo sin publicar hasta rotar.
  4. **Regla permanente:** ninguna credencial en documentos ni en Markdown; sólo en `.env` (ya ignorado).

---

**Contacto oficial**
Eduardo Esper — Fundador, Glass World Studio
E-mail: edu.esper@glassworldstudio.com.ar · eduardoesper75@gmail.com · WhatsApp / Tel: +54 9 385 622-8400
Web: <https://www.glassworldstudio.com.ar>
Santiago del Estero, República Argentina
