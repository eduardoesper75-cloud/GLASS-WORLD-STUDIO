# Playbook de outreach en LinkedIn — Glass World Studio

> **Documento operativo de Eduardo Esper.** Humano en el bucle: las acciones en LinkedIn
> las ejecuta una persona. Este playbook solo prepara el contenido y la disciplina.

---

## 1. Principios no negociables

1. **Nada de automatización de la cuenta.** No extensiones, no bots, no iniciar sesión en
   herramientas de terceros. Todas violan el Acuerdo de Usuario (§8.2) y en 2026 LinkedIn
   aplica restricciones masivas y bajas de vendors completos. Tu cuenta es un activo que no
   se reemplaza.
2. **Ritmo humano.** Nada de ráfagas ni intervalos fijos. LinkedIn penaliza el
   *comportamiento* (velocidad, volumen, baja aceptación), no solo la herramienta.
3. **Personalización real.** Cada nota parte de un detalle verdadero del prospecto (`hook`).
   Sin hook, el mensaje es spam.
4. **Descubrimiento primero (Mom Test).** Preguntar por su mundo antes de presentar. Nunca
   pedir una reunión en el primer mensaje.
5. **Voz de Eduardo.** Primera persona, cercano, frases cortas, sin jerga corporativa, sin
   promesas infladas.

---

## 2. Límites humanos prudentes (guía, no garantía)

> LinkedIn **no** publica "límites seguros" porque el problema es el comportamiento. Estos
> rangos son conservadores a propósito. Ante la duda, menos.

| Acción | Recomendado |
|---|---|
| Invitaciones/día (semana 1) | **5–10**, subir gradualmente |
| Invitaciones/día (estable) | **≤ 20–25**, y nunca más del ~**3%** de tus contactos |
| Mensajes/día | **muy por debajo** del tope de tu plan (50 gratis · 75 Premium · 250 Sales Navigator) |
| Espaciado | acciones repartidas en bloques, sin intervalos fijos |
| Tasa de aceptación | si cae por debajo de ~30%, **frenar** y revisar personalización |
| Respuesta a quien contesta | **< 24 h** |

**Señales para parar ese día:** avisos de "actividad inusual", aceptación en caída, o
cualquier mensaje de advertencia de LinkedIn.

---

## 3. Las 3 flechas (objetivo de cada conversación)

- **Flecha 1 — Inversores / Alianza estratégica:** que entiendan la oportunidad y el estado
  (INPI, 6 galaxias, 5 satélites) y que capten que **no pedimos capital pasivo**: traemos el
  mercado, la arquitectura y la plataforma, y buscamos un socio que financie o ejecute el
  desarrollo técnico. Resultado buscado: una charla de 20 minutos.
- **Flecha 2 — Desarrolladores / Arquitectos:** que evalúen sumarse al núcleo técnico
  (multi-agente, 5 satélites).
- **Flecha 3 — Logística / Cadena de suministro:** que imaginen integrarse a la red de
  distribución real.

**Priorización sugerida:** empezar por los perfiles con `hook` más fuerte y relación más
cercana (2.º grado), y por quien tenga más injerencia real en su ámbito.

---

## 4. Las secuencias

Estructura por prospecto: **Nota de invitación** (≤ 300 caracteres) → tras aceptar,
**Apertura** (descubrimiento) → si no responde, **Seguimiento 1** (+3–4 días) →
**Seguimiento 2** (cierre amable, +5–6 días). **Máximo 3 toques.** Si no hay respuesta,
se archiva y se sigue.

El script `generate-drafts.mjs` genera las cuatro piezas ya rellenadas con `name`,
`company` y `hook`. Además, la columna opcional `perfil` afina el registro dentro de una
flecha (hoy sólo `inversores`). Abajo, el texto canónico de cada una.

### Flecha 1 — Inversores / Alianza estratégica

El espectro es **abierto**: fondos, ángeles e industriales. La columna `perfil`
(`fondo` | `angel` | `industrial`, o vacío = neutro) ajusta el registro. El mensaje de
fondo es el mismo en las cuatro variantes: **el gancho de mercado** (USD 450.000 millones
al año · +50 millones de personas), **la trilogía** como caso de valor y **el no-ask**
(ponemos mercado + arquitectura + plataforma; buscamos socio, no capital pasivo).

**Neutro (sin `perfil`) — la base:**
- **Nota:** `Hola {name}, sigo el trabajo de {company}{ y tu foco en {hook}}. El vidrio mueve USD 450.000 millones al año y sigue sin plataforma que lo una. Construyo Glass World Studio. Me gustaría conectar. Eduardo Esper, fundador.`
- **Apertura:** `Gracias por conectar, {nombre}. Sin vueltas: medio billón de dólares moviéndose a mano. ¿Qué te haría prestar atención hoy a un marketplace vertical industrial?`
- **Seguimiento 1 (Paso 2 — caso de valor + alianza):** `Sin apuro, {nombre}. Te dejo los tres comunicados con los que abrimos la nueva etapa: {trilogía}. Y una aclaración de entrada: no busco capital pasivo. Pongo el mercado, la arquitectura y la plataforma; busco un socio que financie o ejecute el desarrollo, con participación generosa.`
- **Seguimiento 2 (Paso 3 — la charla):** `Cierro sin insistir, {nombre}. Si te interesa, 20 minutos con tres puntos: el mercado, la arquitectura y qué pongo yo sobre la mesa. Te paso franjas si me decís que sí.`

**`fondo`** — institucional («Les dejo»): la nota abre por *la tesis de {company}*, la apertura pregunta qué necesita un marketplace vertical para entrar en su tesis, y el cierre habla de *qué ponemos nosotros*.

**`angel`** — cercano («te»): *sigo tu recorrido {hook}*, apertura sobre apostar personalmente, cierre en primera persona.

**`industrial`** — respetuoso (usted): *sigo el trabajo de {company} en el rubro*, apertura sobre qué le falta a la industria del vidrio, pasos en «Le dejo» y *un socio fundacional*.

### Flecha 2 — Desarrolladores
- **Nota:** `Hola {name}, vi tu experiencia en {hook}. Estoy armando el núcleo técnico de Glass World Studio (marketplace vertical del vidrio) sobre arquitectura multi-agente. Me gustaría conectar. Eduardo, fundador.`
- **Apertura:** `Gracias por conectar, {nombre}. ¿Con qué stack y orquestación venís construyendo sistemas multi-agente, y qué es lo que más te cuesta en ese tipo de arquitecturas?`
- **Seguimiento 1:** `Te comparto el desafío, por si te resulta interesante: motorizar 5 satélites de ingeniería predictiva sobre una arquitectura de agentes. ¿Cómo lo encararías vos?`
- **Seguimiento 2:** `Sin apuro, {nombre}. Si te interesa sumarte a la base técnica del proyecto, avisame y te cuento más. Buena semana.`

### Flecha 3 — Logística y cadena de suministro
- **Nota:** `Hola {name}, me interesa cómo {company} mueve carga frágil e insumos industriales. Estoy construyendo Glass World Studio, marketplace vertical del vidrio. Me gustaría conectar. Eduardo Esper, fundador.`
- **Apertura:** `Gracias por conectar, {nombre}. Hoy, ¿qué es lo más difícil de mover en el rubro (vidrio artístico, refractarios, materia prima) y cómo lo resolvés?`
- **Seguimiento 1:** `Te comparto la visión: integrar logística y cadena de suministro como aliado estratégico de una red que conecta oferta y demanda del vidrio a nivel global. ¿Le ves encaje?`
- **Seguimiento 2:** `Sin apuro, {nombre}. Si te interesa explorar una alianza, avisame y coordinamos. Buena semana.`

### Genérico (si no encaja en una flecha)
- **Nota:** `Hola {name}, me gustaría conectar. Estoy construyendo Glass World Studio, un marketplace vertical para la industria global del vidrio. Eduardo Esper, fundador.`
- **Apertura:** `Gracias por conectar, {nombre}. Me interesa entender tu trabajo: ¿en qué estás enfocado hoy?`
- **Seguimiento 1:** `En una frase: Glass World Studio une arte, industria y comercio del vidrio en un solo ecosistema. ¿Te resuena?`
- **Seguimiento 2:** `Sin apuro, {nombre}. Quedo a disposición si querés saber más.`

---

## 5. Rutina diaria sugerida

1. **Bloque de 20–30 min.** Máximo ~10–15 acciones. Después, cerrá LinkedIn y seguí con otra cosa.
2. Por cada prospecto: leé su perfil 30 segundos, ajustá el `hook` si hace falta, enviá la nota.
3. Al aceptar: enviá la **Apertura** y respondé rápido.
4. Registrá en `prospects.csv` el estado (`invitado`, `aceptado`, `respondio`, `archivado`) y la fecha del próximo toque.
5. A los que responden, contestales **como persona** (el playbook es punto de partida, no un guion rígido).

---

## 6. Qué NO hacer

- ❌ Instalar extensiones o bots "para ahorrar tiempo".
- ❌ Pegar el mismo texto idéntico a decenas de personas.
- ❌ Compartir tu contraseña de LinkedIn con ninguna herramienta.
- ❌ Seguir insistiendo más allá de 3 toques.
- ❌ Prometer cosas que GWS no puede cumplir hoy.

---

## 7. Cumplimiento

Este playbook existe precisamente para operar **dentro** de las reglas: el trabajo
repetitivo (redactar) se hace en tu máquina; las acciones en la plataforma las hace una
persona. Complementa —no reemplaza— al canal de **email** de OpenOutreach.
