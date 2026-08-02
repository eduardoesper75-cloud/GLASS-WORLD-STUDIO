# Informe Maestro de Estética y Experiencia de Usuario — Glass World Studio

> **Orden Suprema de Radiografía Estética, Visual y Experiencial · 2026-08-02**
> Objetivo: revelar al detalle absoluto con qué se encuentra el navegante — del
> joven artista al coleccionista, del director de planta al industrial de la tercera
> edad — al pisar la plataforma.
> Método: auditoría de los artefactos reales (`design-system/`, skill Vetas de Luz,
> manifiesto UX del backend) con evidencia `file:line`. Nada inferido, nada decorado.
> Lenguaje del informe: el de la casa — el Código del Fuego.

---

## PREÁMBULO · La tesis que sostiene todo el frente visual

> *"El circuito impreso y la veta de plomo de un vitral son la misma forma: un camino
> que se ramifica en ángulos, transportando algo (electrones / luz)."*
> — Skill `gws-vetas-de-luz` (`.claude/skills/gws-vetas-de-luz/SKILL.md:17-25`)

GWS no simula una fábrica de vidrio con dos capas separadas (tecnología por un lado,
artesanía por otro). Usa **un único patrón** que se lee simultáneamente como circuito
y como plomo de vitral, con un pulso lento que simula datos y fuego corriendo dentro
del vidrio caliente. Esa es la fusión conceptual central de la marca — y cada decisión
que sigue se origina en ella.

Sobre esa tesis descansa el segundo pilar: la **Tecnología Invisible** (CLAUDE.md §2).
La interfaz no debe sentirse como "una web de IA genérica": prioriza predictibilidad y
respeto al tiempo del usuario por sobre el impacto visual. Este informe documenta cómo
se materializa — y cómo no — cada eje de esa promesa.

---

## EJE 1 · EL UMBRAL Y LA PORTADA CINEMATOGRÁFICA (`portada-umbral.html`)

### 1.1 · La llegada: obsidiana translúcida, no negro plano

El fondo de la portada no es un negro "de página oscura". Es **obsidiana**: la roca
pulida del oficio, con veladuras de color en los bordes como la masa de vidrio caliente.

- **Veladuras de profundidad** — tres `radial-gradient` superpuestos sobre `--bg-void`
  (`#07080a`):
  - violeta profundo en el borde superior derecho `rgba(46,38,92,0.22)`,
  - un rescoldo ámbar en el inferior izquierdo `rgba(120,60,24,0.18)` — *la huella
    térmica del horno que nunca se ve pero se siente*,
  - y una columna azul-profundo inferior `rgba(14,22,34,0.9)` que hunde la escena.
  — `portada-umbral.html:26-39`.

- **Grano de obsidiana** — una turbulencia SVG (`feTurbulence fractalNoise`) a opacidad
  0.05 puesta encima: la micro-rugosidad de la roca pulida, invisible a la distancia,
  presente al acercarse. `portada-umbral.html:41-50`.

- **Vetas de Luz** — el patrón de marca vive en la librería de componentes (`.gw-app::before`):
  trazas SVG ramificadas en ángulo (`stroke-opacity 0.04–0.07`, nodos de 1.8–2.4px) que se
  leen como PCB y como plomo de vitral, con un **pulso de 18 s** (opacidad 0.045→0.09) que
  es "el fuego corriendo dentro del vidrio". `gws-components.css:34-54`.

### 1.2 · El gesto de marca: fuego de soplete

La palabra "Studio" del título usa **`flame-text`**: el degradé del soplete
ámbar → cobre → oro → blanco caliente aplicado como texto recortado
(`background-clip: text`, `color: transparent`) con un halo `drop-shadow` ámbar suave
— el gesto de marca del soplete, presente en la primera línea que lee el navegante.
`portada-umbral.html:52-64` · token `--flame-gradient` en `gws-design-tokens.css:72-75`.

### 1.3 · Entrada cinematográfica del hero

El hero no aparece: **fluye desde la profundidad**. Cada línea usa el keyframe
`gw-enter` (opacidad 0 → 1, `translateY(22px) → 0`, `blur(6px) → 0`) con la curva de
vidrio fundido `--fx-ease-cinema: cubic-bezier(0.22,1,0.36,1)` — entra rápido, frena
suave — y delays escalonados (0 / 0.12 / 0.26 / 0.40 s) que marcan el ritmo de lectura.
`portada-umbral.html:404-417` · `gws-components.css:480-483`.

La tipografía del título es `clamp(3rem, 9vw, 7rem)` — escala líquida que respeta al
teléfono sin sacrificar la monumentalidad del escritorio. `portada-umbral.html:71-75`.

### 1.4 · Las capas de profundidad (glassmorphism único)

El sistema de vidrio es **uno solo, no inventado por componente** (regla dura §2 y §4):
- `.glass` — `rgba(255,255,255,0.045)` + `blur(18px) saturate(140%)` + borde `0.12`.
- `.glass--strong` — el doble de cuerpo (`0.08`), borde `0.28`: para maestros y CTAs.
- `.glass-edge` — el **borde de refracción**: un hairline que se separa en el color de
  la Galaxia activa al hacer hover/focus, con `mask-composite: exclude`. La luz
  partiéndose al cruzar el vidrio. Uso restringido a jerarquía alta (nav activo, CTA,
  tarjetas "Ícono") — abusar de él le resta jerarquía a lo importante.
  `gws-design-tokens.css:99-146` · `SKILL.md:64-86`.

---

## EJE 2 · EXPERIENCIAS DE VIDEO DE INICIO Y VISOR INMERSIVO

### 2.1 · El estándar: 16:9 inmersivo, sin subir archivos

El visor es un panel modal de **`aspect-ratio: 16/9`** (`portada-umbral.html:930`) sobre
fondo `#05070d`, con iframe/video ocupando el 100% del stage. Apertura en
`position: fixed; inset: 0; z-index: 120` con cortina `rgba(4,6,12,0.9)` — el navegante
"entra" al contenido como a una sala oscura. `portada-umbral.html:919-940`.

El estándar es vitrina de URLs, **nunca subida de binarios al servidor**: el maestro o
industrial guarda sus embeds con `POST /catalog/media` y la vitrina los reproduce con
un clic. `portada-umbral.html:953-957` · manifiesto UX `media_vitrine`/`sovereign_embeds`
(`src/ux/ux.const.ts:82-91`).

### 2.2 · Sincronización de URLs — el resolver de medios

El visor es **espejo del resolver del backend** (`src/common/media`), y el backend es la
autoridad. Cobertura:

| Tipo | Reconocimiento | Destino del embed |
|---|---|---|
| **YouTube** | `youtube.com` / `youtu.be`; IDs desde `watch?v=`, `youtu.be/<id>`, `/embed/`, `/live/`, `/shorts/` | `https://www.youtube-nocookie.com/embed/<id>` — *modo privacidad* |
| **Canal de YouTube** | `/@usuario`, `/channel/`, `/c/` | **NO se reproduce**: se muestra como botón "Ver en origen" — nunca un canal dentro de una vitrina |
| **Vimeo** | `vimeo.com` / `video/<id>` | `https://player.vimeo.com/video/<id>` |
| **CDN propio** | `.mp4` / `.webm` / `.mov` / `.m3u8` | reproducción directa |

Evidencia: `portada-umbral.html:1555-1596` (JS cliente) y, en el backend endurecido,
`GWS_MEDIA_HOSTS` + `GWS_MEDIA_STREAM_EXTENSIONS` + `GWS_MEDIA_IMAGE_EXTENSIONS`
(`src/common/media/gws-media.const.ts`) con la validación estricta de
`gws-media.validate.ts` (solo HTTPS, sin credenciales embebidas, sin puertos exóticos,
sin IP literal, sin backslash — el cierre de la brecha E5 del Blindaje Total).

### 2.3 · La allowlist soberana (defensa §3.6, no adorno)

El allowlist no es una lista de "permitidos para reproducir": es la **frontera de
soberanía** de la plataforma. Regla en dos capas:

1. **Cliente** (`portada-umbral.html:1545-1553`): `FORBIDDEN` bloquea whatsapp, telegram,
   instagram, facebook, messenger, discord, signal, acortadores (bit.ly, tinyurl, goo.gl,
   t.co, shorturl) y `mailto` — "host bloqueado por soberanía — no se permiten canales de
   contacto".
2. **Backend** (autoridad): `GWS_MEDIA_FORBIDDEN_HOSTS` ampliada con TikTok/X/Snapchat y
   los dominios de contacto modernos (Blindaje Total E5), aplicada en el `@IsGwsMediaArray()`
   antes de persistir cualquier vitrina.

La intención es clara en la UI misma: *"allowlist soberano: exhibición, nunca canales de
contacto"* (`portada-umbral.html:964`). La vitrina exhibe la obra; el contacto de
negociación vive dentro de la plataforma — jamás fuera (CLAUDE.md §3.6).

### 2.4 · El visor en los flujos de mayor valor

Dos presets de alto valor prueban el estándar:
- **G1 · Bóveda · Masterclass magistral** — el curso del maestro entra al visor con un
  clic; el catálogo lista nivel y duración, nunca "dura 2 horas" ambiguo
  (flujo `view_course`, `src/ux/ux.const.ts:172-196`).
- **G5 · Gran Industria · Demo técnica** — una máquina pesada se entiende sin leer: el
  video de la mesa operando (corte por agua en vivo) es el paso central de la auditoría
  de maquinaria (flujo `audit_machine`, `src/ux/ux.const.ts:198-222`).

En ambos casos el iframe se abre con `allow="accelerometer; autoplay; clipboard-write;
encrypted-media; gyroscope; picture-in-picture; fullscreen"` y poster + botón único
(manifiesto UX `standard`, `src/ux/ux.const.ts:232-238`).

---

## EJE 3 · EL SISTEMA DE DISEÑO Y ACCESIBILIDAD — el estándar de navegación

### 3.1 · Reconciliación del dogma: "3 clics" como techo, no como métrica

La Orden pide el "Estándar de 3 Clics". GWS lo audita así, documentado en
`docs/ux/estandar-3-clics.md` y en el manifiesto UX del backend
(`src/ux/ux.const.ts:7-17, 53-59`):

- El mandato **"toda operación crítica en ≤3 clics"** entra en conflicto con CLAUDE.md §2
  (la regla de los "3 clics" es un mito de UX sin sustento empírico). La resolución:
  `clickBudget = 3` es una **directriz de navegación superficial** (prohibidos los menús
  anidados infinitos; techo de 3 niveles de anidamiento), y el **KPI de verificación** es
  el de §2: *tiempo hasta completar la acción* + *cada paso reduce la ambigüedad respecto
  del anterior*.
- Cada flujo crítico del manifiesto lleva ambos campos: `clickBudget: 3` **y** un paso con
  `reducesAmbiguity` explícito. Ejemplos: comprar (elegir producto → checkout transparente
  → confirmar), suscribirse, publicar obra, ver masterclass, auditar máquina
  (`src/ux/ux.const.ts:93-223`).

### 3.2 · Navegación superficial y vías rápidas

- **Nav sticky con vidrio**: `position: sticky; top: 0` + `backdrop-filter: var(--glass-blur)`
  + borde inferior `rgba(255,255,255,0.12)`. El enlace activo marca la Galaxia con un anillo
  del color core (borde de refracción). `gws-components.css:81-123`.
- **Vías rápidas** en la portada: sección propia donde *cada operación crítica* está
  resuelta en una tarjeta con sus pasos numerados — "Navegación superficial, sin menús
  anidados: desde acá se compra, se suscribe, se publica una obra, se ve una masterclass y
  se audita una máquina pesada" (`portada-umbral.html:475-515`).
- **Menús flotantes sin drag**: las alertas de elevación/estado usan `.gw-toast`
  (fijo, esquina inferior derecha, `z-index: 50`, sombra profunda); el visor, cortina
  completa. Nada de capas de menú anidadas que escondan la salida.

### 3.3 · Tipografía dual y legibilidad industrial

- **Display** — `Instrument Serif` itálica (fallback Georgia): gestos, títulos, nombres
  propios. Referencia al trazo del vidrio soplado: orgánico, no geométrico.
- **Cuerpo** — `Inter`: no compite con el display.
- **Mono** — `IBM Plex Mono`: **regla dura**, la más frecuentemente violada por IA sin
  skill: todo dato técnico (COE, pureza, MOQ, lote, precio, presión de corte) va SIEMPRE
  en mono, NUNCA en la display itálica. `gws-design-tokens.css:45-48` · `SKILL.md:51-62` ·
  micro-fricción `tech_data_in_display` (`src/ux/ux.const.ts:228`).

### 3.4 · Contraste y accesibilidad (todas las generaciones)

- **Base de contraste**: texto `--text-primary: #f3f1ec` (blanco cálido, nunca `#fff`)
  sobre `--bg-void: #07080a` — contraste alto por diseño, sin excusas de "estética oscura".
  Muted `#9aa0a8` para secundarios con ratio suficiente sobre el fondo.
- **Foco visible de Galaxia**: `:focus-visible { outline: 2px solid var(--galaxy-glow) }`
  en botones e inputs — el teclado navega la plataforma sabiendo en qué Galaxia está.
  `gws-components.css:202, 312-318`.
- **Movimiento con freno**: TODA animación (pulso de vetas, reveal, shimmer, seal,
  catch-light, melt) tiene su clausura en `@media (prefers-reduced-motion: reduce)` —
  el contenido queda visible, estático, funcional. `gws-components.css:52-54, 410, 485-491`
  · `portada-umbral.html:420-425`.
- **Escala líquida**: títulos `clamp()` y grids `auto-fit/minmax(260px,1fr)` — el
  industrial de tercera edad con un móvil de gama media no recibe una página reventada.

---

## EJE 4 · TOKENS DE COLOR Y ATMÓSFERA VISUAL — especificación técnica

### 4.1 · La paleta por Galaxia (core / glow) — `gws-design-tokens.css:21-43`

| Galaxia | Core | Glow | Concepto |
|---|---|---|---|
| G1 · Artistas | `#e8a54b` | `#f4c77e` | Oro fundido de horno |
| G2 · Marketplace | `#4fa8d8` | `#7fc4ea` | Azul borosilicato |
| G3 · Comunidad | `#e36e80` | `#f09aa8` | Coral humano |
| G4 · Instituciones | `#8577e0` | `#aba1ee` | Violeta institucional |
| G5 · Gran Industria | `#9ba5b3` | `#c7ceda` | Acero (+ señal ámbar `#d98a3d`) |
| G6 · Ingeniería Predictiva | `#52e0c4` | `#8cf0dc` | Fósforo de dato |
| Satélite (transversal) | `#f2545b` | `#ff8288` | Alertas/licitaciones — no es Galaxia |

Regla dura: cada Galaxia usa SOLO su color; no reutilizar ni inventar tonos
(`gws-design-tokens.css:10-12`). El alcance se propaga por contenedor `[data-galaxy='gN']`,
que define `--galaxy-core`/`--galaxy-glow` para todo lo que vive dentro
(`gws-design-tokens.css:88-94`).

### 4.2 · El vidrio en alta temperatura — transparencias y efectos lumínicos

- **Sistema de vidrio** (`:50-56`): `--glass-bg` 0.045 → `--glass-strong-bg` 0.08;
  `--glass-blur: blur(18px) saturate(140%)`; `--glass-radius: 16px`. Un solo sistema,
  tres niveles de cuerpo.
- **Reflejo interno (catch light)**: un `linear-gradient(115deg)` que barre botones en
  hover (`translateX(-130%) → 130%`) con la curva cinematográfica — la luz atravesando el
  vidrio. `gws-design-tokens.css:78-80` · `gws-components.css:157-167`.
- **Sellado térmico**: en `:active`, un anillo `box-shadow` se expande en el glow de la
  Galaxia y se funde (`gw-seal`, 0.5s) — el vidrio "sella" la operación.
  `gws-components.css:173-181`.
- **Halo de Ícono**: `radial-gradient` con el tint de la Galaxia detrás de la tarjeta de
  nivel alto (`gws-card--icon::before`), `z-index: -1`. `gws-components.css:224-231`.
- **Color vivo sin nuevo token**: `color-mix(in srgb, var(--galaxy-core) N%, transparent)`
  para tintes y hairlines — la Galaxia activa tiñe controles sin derivar la paleta.
  `gws-components.css:122, 178, 187-198, 313-317`.
- **Fuego de soplete** (`--flame-gradient`, `:72-75`): `#fdf6e3 → #fbbf24 → #f59e0b →
  #ea580c → #b91c1c → #fdf2f8` — el degradé de alta temperatura, usado como **acento en
  texto/reflejos, nunca como relleno de datos técnicos**.

### 4.3 · El cine de la interfaz — movimiento con intención

Tokens de movimiento (`gws-design-tokens.css:58-67`): `--fx-ease-cinema` (vidrio fundido),
`--fx-duration-fast 0.18s` (micro-estados), `med 0.42s`, `slow 0.8s` (reveal de
secciones), `hero 1.1s` (entrada de la portada). Reveals en scroll con `IntersectionObserver`
y delays escalonados `--d1/d2/d3` (`gws-components.css:449-463`). El contador "fundido"
(`gw-count.is-melting`) interpola cifras con blur+escala que se asienta — el número se
derrite y se solidifica (`:467-475`).

### 4.4 · Sonido de la casa (capa experiencial)

`gws-fx.js` sintetiza **100% en el navegador** (Web Audio, sin archivos): `click()`
= cortavidrios marcando la pieza ("zzzip", bandpass 5400→2400 Hz); `access()` = corte de
hoja de diamante (gliss de aire + doble ting de vidrio grueso + golpe sordo) — confirma
elevación/suscripción; `error()` = tensión previa a la ruptura; `whoosh()` = transición
de Galaxias; `tick()` = micro-contador auto-limitado a 1/90 ms. Volumen bajo + compresor,
arranca solo con la primera interacción (autoplay policy) y `GWSEffects.enabled(false)`
lo silencia por completo. `gws-fx.js:1-246`.

---

## CIERRE · LA POSTAL DEL IMPERIO DEL VIDRIO

Lo que el navegante encuentra — resumen ejecutivo del recorrido:

1. **Pisa obsidiana** translúcida con veladuras de horno y un grano de roca pulida;
   sobre ella, el patrón de marca "Vetas de Luz" pulsa lento como fuego en el vidrio.
2. **"Glass World Studio"** se enciende con el degradé del soplete y entra línea a línea
   desde la profundidad, con la curva de vidrio fundido y respeto a
   `prefers-reduced-motion`.
3. **No hay laberinto**: vías rápidas superficiales, cada paso reduce ambigüedad,
   techo de 3 niveles, y un manifiesto UX auditable en el backend que marca como defecto
   cualquier fricción que lo viole.
4. **El valor se ve**: masterclass de un maestro y maquinaria de G5 entran a un visor
   16:9 inmersivo con sincronización de URLs (YouTube en modo privacidad, Vimeo, CDN
   propio) protegido por la allowlist soberana — exhibición sí, fuga de contacto jamás.
5. **El dato técnico es sagrado**: COE, pureza, lote y precio en mono, con el color de
   la Galaxia como acento. Quien compra por temperatura decide por temperatura.

**Evidencia auditada**: `design-system/gws-design-tokens.css` (canónico) ·
`gws-components.css` · `gws-fx.js` · `portada-umbral.html` · `vetas-de-luz-demo.html` ·
`manual-codigo-del-fuego.html` · `.claude/skills/gws-vetas-de-luz/SKILL.md` ·
`src/ux/ux.const.ts` (manifiesto v1.0.0, 2026-08-02) · `src/common/media/*` (allowlist
endurecido E5) · `docs/ux/estandar-3-clics.md`.

**Invariantes respetados**: un solo glassmorphism · un solo patrón de fondo ·
`--font-mono` para todo dato técnico · Tecnología Invisible (§2) · soberanía §3.6 ·
payment real fuera de alcance de cualquier IA (§3.1).

> *La interfaz no se siente como una web de IA genérica: se siente como entrar al taller
> donde la luz todavía está caliente.*
