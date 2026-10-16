# Secuencia de Outreach — Desarrolladores y Arquitectos (3 pasos)

> **Glass World Studio** · Flecha 2 — Núcleo técnico
> Copy listo para copiar y pegar. **Humano en el bucle:** lo envía Eduardo, a mano.
>
> **Objetivo:** que un dev clave evalúe **sumarse a construir el núcleo técnico** de GWS.
> No buscamos un CV: buscamos a alguien que quiera **dejar su huella en algo real y global**.
>
> **Regla de oro:** hablamos entre pares. Nada de "estimado candidato". Preguntamos, no vendemos.

---

## El anzuelo (hook) — el Big Data de taller

> Lo que vamos a construir **no es "una web de vidrio"**: es la **infraestructura que cartografía en
> tiempo real un mercado que hoy es invisible** —el ~60% del vidrio que las consultoras no miden—.
> Eso significa **ingesta de datos de campo, matching, orquestación de agentes (MCP) y un motor de
> ingeniería predictiva (termia / COE)**. Para un dev, es el raro caso de un producto **con datos
> propios y difíciles de replicar**. Usalo como `hook` cuando el perfil sea de **datos / IA /
> arquitectura**.

---

## Reglas de la campaña

| Regla | Detalle |
|---|---|
| **Máximo de toques** | 3. Nunca un cuarto mensaje. |
| **Ritmo** | Humano: 1 toque cada 3–7 días. |
| **Personalización obligatoria** | El `hook` cita **su** stack o su especialidad real (multi-agente, B2B, front). Sin eso, no se envía. |
| **Longitud** | Nota ≤ 300 caracteres. Mensajes: ≤ 100 palabras. |
| **Canal** | **LinkedIn** es el principal (ahí vive el talento técnico). Email como alternativa. |
| **Tono** | De dev a dev. Curiosidad técnica, cero reclutador genérico. |
| **Cierre** | Sin respuesta tras el Paso 3 → archivar. Reintento en 3–6 meses. |

**El error que mata la campaña:** mandar un "buscamos programadores" sin leer su perfil. Un dev
detecta el mensaje enlatado en dos líneas y no responde. **El `hook` técnico es todo.**

---

## Los tres sub-perfiles

El motor (`generate-drafts.mjs`) elige la variante según la columna `perfil` del CSV:

| `perfil` | Para quién | Qué enfatiza |
|---|---|---|
| `fullstack` | Full-stack / producto | Que lo lleve **de punta a punta**; el rol se adapta a lo que más le guste. |
| `b2b` | Backend / marketplaces B2B | Plataformas **transaccionales**: matching, licitaciones, pagos, trazabilidad. |
| `multiagente` | Arquitectos de IA / MCP | **Enjambre de agentes**, orquestación, los 5 satélites de ingeniería predictiva. |
| *(vacío)* | Cualquier dev / a clasificar | Neutro: "una plataforma B2B real". |

---

## Paso 1 — Primer contacto

**Cuándo:** Día 0 · **Objetivo:** abrir con una pregunta técnica, no con una oferta.

### LinkedIn (invitación)

**`fullstack`**
> Hola {name}, vi tu experiencia en {hook}. Estoy armando el núcleo técnico de Glass World Studio, un marketplace vertical del vidrio, y busco un full-stack que lo lleve de punta a punta. Me gustaría conectar. Eduardo, fundador.

**`b2b`**
> Hola {name}, vi tu experiencia en {hook}. Estoy armando el núcleo técnico de Glass World Studio, un marketplace B2B vertical, y busco gente que haya construido plataformas transaccionales. Me gustaría conectar. Eduardo, fundador.

**`multiagente`**
> Hola {name}, vi tu experiencia en {hook}. Estoy armando el núcleo técnico de Glass World Studio (marketplace vertical del vidrio) sobre arquitectura multi-agente. Me gustaría conectar. Eduardo, fundador.

**Neutro (sin `perfil`)**
> Hola {name}, vi tu experiencia en {hook}. Estoy armando el núcleo técnico de Glass World Studio, un marketplace vertical del vidrio a escala global. Busco un dev que quiera construirlo. Me gustaría conectar. Eduardo, fundador.

### Apertura (tras aceptar)

- **`fullstack`:** `Gracias por conectar, {nombre}. ¿Preferís construir producto (front + back) o resolver infraestructura? Te lo pregunto porque el rol se puede adaptar a lo que más te guste.`
- **`b2b`:** `Gracias por conectar, {nombre}. ¿Qué parte de un marketplace B2B te parece la más difícil de construir bien: matching, licitaciones, pagos o trazabilidad?`
- **`multiagente`:** `Gracias por conectar, {nombre}. ¿Con qué stack y orquestación venís construyendo sistemas multi-agente, y qué es lo que más te cuesta en ese tipo de arquitecturas?`
- **Neutro:** `Gracias por conectar, {nombre}. Antes de contarte nada: ¿qué es lo que más te gusta construir hoy, y con qué stack lo resolvés?`

---

## Paso 2 — El desafío técnico (sin pedir nada)

**Cuándo:** Día +3/4 · **Objetivo:** mostrar que el problema es **grande y real**, y que él tiene algo que decir.

- **`fullstack`:** `Te comparto el desafío: un marketplace completo (catálogo, licitaciones, perfiles, credenciales) sobre una arquitectura multi-agente. ¿Lo encararías de punta a punta?`
- **`b2b`:** `Te comparto el desafío: oferta y demanda del vidrio en tiempo real, licitaciones y un catálogo multigalaxia. ¿Qué resolverías primero?`
- **`multiagente`:** `Te comparto el desafío: motorizar 5 satélites de ingeniería predictiva sobre una arquitectura de agentes. ¿Cómo lo encararías vos?`
- **Neutro:** `Te comparto el desafío, por si te resulta interesante: una plataforma B2B real (6 galaxias, 5 satélites) con un enjambre de agentes detrás. ¿Le ves lugar para vos?`

**Opcional (adjunto):** el perfil técnico buscado (`GWS_Perfil_Tecnico_Buscado.md`) si te lo piden.

---

## Paso 3 — La conversación

**Cuándo:** Día +5/7 · **Objetivo:** abrir la charla del rol, con salida elegante.

- **`fullstack`:** `Sin apuro, {nombre}. Si te interesa, te cuento el rol y las condiciones. Buena semana.`
- **`b2b`:** `Sin apuro, {nombre}. Si le ves encaje, te cuento el rol y las condiciones. Buena semana.`
- **`multiagente`:** `Sin apuro, {nombre}. Si te interesa sumarte a la base técnica, avisame y te cuento más. Buena semana.`
- **Neutro:** `Sin apuro, {nombre}. Si te interesa sumarte a la base técnica del proyecto, avisame y te cuento más. Buena semana.`

---

## Criterios de avance y descarte

| Señal del interlocutor | Acción |
|---|---|
| Responde con preguntas técnicas | **Señal fuerte.** Pasar al Paso 2 al toque y proponer una llamada. |
| Pide el stack / la arquitectura | Compartir el perfil técnico y proponer 20 minutos con vos. |
| "¿Es pago?" / "¿Qué ofrecen?" | Responder con la verdad: es una **etapa fundacional**, las condiciones se pactan. Ver el perfil técnico (sección "Qué ofrecemos"). |
| "Estoy full de laburo" | Agradecer y ofrecer quedar en contacto para más adelante. No insistir. |
| Silencio tras el Paso 3 | Archivar. Reintento en 3–6 meses con un avance concreto. |

---

## Qué NO hacer

1. **No sonar a reclutador.** Nada de "oportunidad única" ni "buscamos talento". Hablá de **problemas técnicos**.
2. **No prometer sueldos ni porcentajes** que no estén pactados. Decí "las condiciones las charlamos" y cumplí.
3. **No mandar el mismo mensaje a todos.** El `hook` técnico es obligatorio.
4. **No pedir un CV.** Pedí una opinión sobre el desafío.
5. **No automatizar el envío.** Es una conversación entre personas.
