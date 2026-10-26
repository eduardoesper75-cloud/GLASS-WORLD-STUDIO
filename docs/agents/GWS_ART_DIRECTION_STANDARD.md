# GWS — Estándar de dirección de arte

> Documento **normativo** de dirección de arte de Glass World Studio (GWS). Gobierna el
> tratamiento visual del **Umbral de Acceso Global**, la **Landing de Bienvenida**, las
> **seis galaxias**, los **cinco satélites transversales** y toda superficie pública.
> **Sin secretos.** **No contiene código de producto**: los fragmentos CSS que aparecen son
> **valores de referencia de diseño**, no implementación.

| Dato | Valor |
|---|---|
| Versión | `1.1` (propuesta) |
| Fecha | 2026-10-18 |
| Autoridad | `gws-art-experience-director` (Director de Arte y Experiencia) |
| Cuadrilla | `[ART-SQUAD-01]` … `[ART-SQUAD-05]` |
| Estado | **Pendiente de aprobación humana** |
| Ámbito | Presentación (UX/UI, sistema visual). **No** gobierna backend, datos, pagos ni seguridad técnica |
| Concepto rector | **Fusión Industrial y Alta Tecnología Translúcida** |
| Gobierno relacionado | `docs/agents/GWS_AGENT_GOVERNANCE.md` |
| Flujo relacionado | `docs/agents/GWS_WORKFLOW.md` |
| Plantillas de informe | `docs/agents/GWS_REPORT_TEMPLATES.md` |
| Verificador estructural | `tools/governance/verify-agents.mjs` |

---

## 1. Propósito y alcance

Este estándar existe para que el **Director de Arte** y su cuadrilla `[ART-SQUAD]` dispongan
de reglas **verificables y no ambiguas** sobre cómo se ve, se siente y se comporta GWS. Su
objetivo es la **coherencia narrativa y perceptual** entre superficies, no la decoración
aislada.

El estándar gobierna, como mínimo:

- Landing de Bienvenida;
- Umbral de Acceso Global;
- galaxias;
- satélites transversales;
- dashboards;
- formularios;
- tarjetas;
- chats;
- galerías;
- fondos cinematográficos;
- design tokens;
- microinteracciones;
- responsive;
- accesibilidad visual (perceptual);
- estados de interfaz;
- coherencia espacial;
- jerarquía visual.

Es **obligatorio** para:

```text
gws-art-experience-director
gws-ux-information-architecture-agent
gws-visual-system-agent
gws-galaxy-experience-agent
gws-motion-interaction-agent
gws-responsive-accessibility-agent
```

Toda revisión visual de cualquiera de esas superficies se realiza contra este documento.

## 2. Concepto visual GWS

Concepto rector:

```text
Fusión Industrial y Alta Tecnología Translúcida
```

Expresa el contraste entre dos mundos que conviven en una misma superficie:

**Mundo del oficio** (cálido, material, tangible):

```text
oficio artesanal
fuego
crisol
herramientas
ladrillo refractario
metal
laboratorio
borosilicato
```

**Mundo de la plataforma** (frío, preciso, translúcido):

```text
interfaces translúcidas
precisión
trazabilidad
jerarquía
datos
control
alta gama
```

### 2.1 Criterio de diseño (interpretación Taste Skill)

La estética debe interpretarse como **criterio**, no como estilo importado:

- intencional;
- sobrio;
- preciso;
- atento a los microdetalles;
- con movimiento funcional;
- sin saturación;
- sin plantillas genéricas;
- sin efectos decorativos arbitrarios.

### 2.2 Prohibición de copia

**No** se copian interfaces externas ni se reproducen diseños de terceros. Las referencias de
mercado se usan solo como **contexto**, nunca como plantilla. Si una referencia no puede
justificarse desde la narrativa y el sistema de GWS, se descarta.

## 3. Autoridad del Director de Arte

**Puede:**

- aprobar;
- rechazar;
- solicitar correcciones;
- declarar `VISUAL_PASS`;
- declarar `VISUAL_PASS_WITH_CONDITIONS`;
- declarar `VISUAL_REJECTED`;
- declarar `VISUAL_REQUIRES_DECISION`;
- bloquear una entrega visual.

**No puede:**

- modificar backend;
- modificar base de datos;
- modificar pagos;
- modificar autenticación;
- modificar migraciones;
- aprobar seguridad técnica.

El Director de Arte es la autoridad visual, **no** el implementador. No escribe código de
producción y no se auto-aprueba lo que él mismo construye. Tampoco emite afirmaciones
jurídicas: la estética nunca sustituye una verificación legal o técnica.

## 4. Regla de Inmersión Visual y Coherencia Contextual

Principio obligatorio (literal):

```text
El fondo fotográfico, renderizado o cinematográfico no es un elemento
decorativo aleatorio. Debe ser consecuente con la narrativa técnica,
comercial y espacial de la sección en la que se encuentra el usuario.

Cada entorno debe comunicar inmediatamente:
- qué actividad ocurre;
- qué materia domina;
- qué tipo de usuario participa;
- qué temperatura emocional corresponde;
- qué acción profesional o comercial se espera.
```

### 4.1 Continuidad de marca entre galaxias (lo que **no** cambia)

- identidad GWS;
- tipografía;
- tokens;
- estructura de navegación;
- lenguaje de estados;
- contraste;
- calidad de interacción;
- sobriedad institucional.

### 4.2 Diferenciación entre galaxias (lo que **sí** cambia)

- materia;
- temperatura;
- textura;
- densidad;
- iconografía;
- actividad;
- prioridad funcional;
- contexto comercial.

**Regla de oro:** no se reutiliza el mismo fondo en todas las galaxias salvo **justificación
narrativa explícita** (documentada en el informe de arte). El fondo es parte del mensaje, no
un relleno.

## 5. Contexto visual por entorno

Cada contexto define el mundo que el usuario debe reconocer de inmediato. El fondo debe ser
**propio del contexto**; se prohíbe una imagen genérica de laboratorio o marketplace como
comodín.

### 5.1 Umbral de Acceso Global

- taller industrial clásico;
- horno refractario encendido;
- chispas contenidas;
- vitral de recepción;
- acceso multilingüe;
- señalización multilingüe;
- bienvenida institucional.

Titular obligatorio:

```text
Glass World Studio (GWS) — Una plataforma con alma de taller,
que se fortalece con tu crecimiento.
```

### 5.2 Galaxia 1 — Iconos y Maestros

- maestro vidriero;
- caña;
- vidrio candente;
- crisol incandescente;
- herramientas de banco;
- moldes;
- taller activo;
- legado y maestría.

### 5.3 Galaxia 2 — Marketplace de Insumos y Materiales

- depósito especializado;
- inventario ordenado;
- estanterías;
- pigmentos;
- esmaltes;
- materiales dicroicos;
- barras de vidrio;
- abastecimiento y descubrimiento.

> Las referencias a *Hobby Times* y *Bea Color* son **referencias de contexto de mercado**, no
> instrucciones para copiar marcas, fotografías o interfaces.

### 5.4 Galaxia 3 — Comunidad y Atelier Abierto

- mesa colaborativa;
- planos;
- herramientas manuales;
- creadores;
- aprendizaje;
- intercambio;
- atelier abierto.

### 5.5 Galaxia 4 — Borosilicato y Envases

- laboratorio de precisión;
- iluminación fría o blanca;
- frascos graduados;
- microscopios;
- tubos;
- ampollas;
- borosilicato;
- precisión científica.

### 5.6 Galaxia 5 — Maquinarias, Hornos y Herramientas Pesadas

- planta industrial;
- hornos de gran porte;
- termocuplas;
- tableros;
- metal;
- repuestos;
- potencia;
- control.

### 5.7 Galaxia 6 — Servicios, Logística y Resguardo

- estudio profesional;
- embalaje técnico;
- cajas de transporte;
- trazabilidad;
- resguardo institucional;
- protección de obras;
- logística especializada.

> **Regla legal:** no se afirma que la estética de seguridad equivalga a una protección legal
> o técnica real. La imagen de resguardo comunica una intención, no crea un derecho.

> **Resumen:** seis **áreas contextuales de galaxia** (1–6) más el **Umbral de Acceso
> Global**. Un cambio de fondo que contradiga su contexto es causal de `VISUAL_REJECTED`.

## 6. Superficies y glassmorphism

### 6.1 Superficies

Lenguaje base —**cristal esmerilado**— a usar con criterio, **no** de forma indiscriminada:

- paneles de cristal esmerilado;
- translucidez;
- profundidad;
- capas;
- blur;
- bordes sutiles;
- jerarquía entre superficie primaria y secundaria.

Valores de referencia:

```css
backdrop-filter: blur(16px);
/* opacidad de superficies: 15%–40% */
```

Estos valores deben validarse contra:

- contraste;
- legibilidad;
- fotografía de fondo;
- densidad;
- rendimiento;
- dispositivo;
- tamaño del texto.

**No** se usa glassmorphism en cada elemento. Debe reservarse preferentemente para:

- navegación;
- paneles de decisión;
- agrupaciones;
- formularios;
- tarjetas destacadas;
- contenedores contextuales.

### 6.2 Bordes y acentos

Tokens base:

```text
ámbar candente:      #F0A500
cian borosilicato:   #00E5FF
grafito/carbón:      #0A0D14
```

El brillo debe comunicar alguno de estos significados:

- interactividad;
- selección;
- jerarquía;
- estado;
- relación contextual.

**No** se aplica glow simultáneamente a todos los elementos. El glow generalizado se
considera saturación visual y es causal de rechazo.

### 6.3 Detalles artesanales

Vocabulario de detalle a incorporar:

- vitrales geométricos;
- biseles;
- relieve de plomo;
- mosaicos;
- marcos;
- transparencias;
- refracción.

Uso prioritario:

- Umbral;
- tarjetas de Grandes Maestros;
- elementos institucionales;
- Bóveda del Conocimiento.

El detalle artesanal refuerza la identidad; no debe degradar la legibilidad ni el rendimiento.

## 7. Design tokens

Tokens de referencia (mínimo obligatorio):

```css
--gws-obsidian:          #0A0D14;
--gws-amber:             #F0A500;
--gws-borosilicate-cyan: #00E5FF;
--gws-graphite:          #171C26;
--gws-glass-light:        rgba(255, 255, 255, 0.15);
--gws-glass-medium:       rgba(255, 255, 255, 0.25);
--gws-glass-strong:       rgba(255, 255, 255, 0.40);
--gws-amber-glow:         rgba(240, 165, 0, 0.40);
--gws-cyan-glow:          rgba(0, 229, 255, 0.32);
--gws-border-subtle:      rgba(255, 255, 255, 0.18);
--gws-border-focus:       #F0A500;
```

Reglas de uso:

- son **tokens semánticos** (nombran una intención, no un valor suelto);
- **no** deben copiarse arbitrariamente dentro de los componentes;
- **no** deben comunicar estados únicamente mediante color;
- deben **evolucionar mediante decisión del Director de Arte**, no por improvisación;
- deben contemplar **texto, superficie, borde, foco, error, alerta y éxito**;
- **no** deben ser implementados como código en esta tarea.

> El sistema debe definir tokens de rol para **éxito, alerta y error** cuando corresponda.
> Ámbar y cian son acentos de identidad; **no** son la única señal de estado. Un estado
> comunicado solo por ámbar o solo por cian es causal de rechazo.

## 8. Landing de Bienvenida

### 8.1 Identidad (titular obligatorio)

```text
Glass World Studio (GWS) — Una plataforma con alma de taller,
que se fortalece con tu crecimiento.
```

### 8.2 Tratamiento

- emblema institucional GWS;
- vitral artístico tridimensional;
- biseles de luz;
- detalles de plomo;
- transparencia reactiva;
- fondo de taller;
- panel central esmerilado;
- acceso multilingüe;
- acentos ámbar y dorados;
- overlay grafito/carbón.

### 8.3 Regla de marca

El logotipo debe conservar el **reconocimiento institucional**. **No** debe deformarse ni
reinterpretarse de forma que comprometa la identidad de marca. El `overlay` existe para
garantizar legibilidad; nunca debe ocultar la marca ni el titular.

## 9. Satélites transversales (cinco)

### 9.1 Radar de Oferta y Demanda

Concepto: radar circular; mosaicos de vitral; sectores dinámicos; barrido SVG o Canvas;
intensidad visual vinculada a datos.

Requisitos:

- intensidad vinculada a oferta/demanda reales;
- leyenda;
- alternativa textual o tabular;
- navegación por teclado;
- pausa;
- `reduced motion`;
- no dependencia exclusiva del color.

La animación **debe comunicar actividad real**; un loop puramente decorativo se rechaza.

### 9.2 Ingeniería Predictiva

Concepto: dashboard de precisión; cian borosilicato; trazabilidad; flujos de datos;
laboratorio tecnológico.

Requisitos:

- métricas legibles;
- unidades;
- fecha de actualización;
- rangos;
- estado de datos;
- explicación de proyecciones;
- alternativa accesible a gráficos.

### 9.3 Rincón del Usado GWS

Concepto: madera noble; metal; cobre; pátina; inventario recuperado; fichas de oportunidad.

Debe **diferenciar** de forma explícita y perceptible:

```text
usado
reacondicionado
reparado
para repuesto
sin verificar
verificado
```

### 9.4 Portal de Profesionales y Científicos

Concepto: placas institucionales de cristal; tipografía de alto contraste; credenciales; oro
viejo; laboratorio; arquitectura de precisión.

**Una insignia visual no equivale a verificación real.** Cuando corresponda, mostrar:

- fuente;
- fecha;
- especialidad;
- institución;
- estado de verificación.

### 9.5 Bóveda del Conocimiento

Concepto: cámara acorazada; archivo histórico; negro carbón; dorado; vitrinas de museo;
documentos; patentes; manuales; propiedad intelectual.

Debe **diferenciar**:

```text
público
registrado
licenciado
restringido
confidencial
pendiente de autorización
```

> **Regla legal:** no se afirma protección jurídica únicamente por una apariencia visual. La
> estética de bóveda **no** comunica ni crea un derecho. No se declara una marca como
> registrada ni se hacen afirmaciones legales absolutas; el estado legal es el que consta en
> las páginas legales aprobadas.

## 10. Microinteracciones y estados

Toda interacción debe tener feedback adecuado, pero **no** toda interacción requiere brillo,
escala, blur o movimiento. El feedback informa, no decora.

### 10.1 Estados obligatorios por componente interactivo

Cada componente interactivo debe definir:

```text
default
hover
focus-visible
active
selected
disabled
loading
error
success
```

Un componente sin estados definidos se considera incompleto y es causal de rechazo.

### 10.2 Hover

Referencia visual (solo referencia, no aplicación automática):

```css
transform: scale(1.02);
box-shadow: 0 0 20px rgba(240, 165, 0, 0.4);
```

El efecto debe:

- ser moderado;
- tener propósito;
- no impedir la lectura;
- no producir saltos de layout;
- no degradar el rendimiento;
- tener equivalente para teclado y tacto.

**No** debe aplicarse masivamente. Una interfaz que depende solo del `hover` para comunicar
interacción es causal de rechazo.

### 10.3 Active

Debe producir respuesta inmediata:

- menor elevación;
- escala contenida;
- cambio de brillo;
- sensación de presión;
- duración breve.

### 10.4 Focus-visible

Debe ser **independiente del hover**.

Exige:

- indicador visible;
- contraste suficiente;
- foco no oculto por overlays;
- navegación por teclado;
- no eliminar `outline` sin sustituto equivalente.

Criterio adoptado (WCAG 2.2, SC 2.4.13):

- área equivalente, como mínimo, a un **perímetro de 2 píxeles CSS**;
- contraste mínimo de **3:1** entre estado enfocado y no enfocado;
- el glow exterior **no** sustituye por sí solo el área del indicador.

### 10.5 Reduced motion

Todo radar, loop, scroll reveal, hover complejo o animación automática debe tener variante
reducida. Debe contemplar:

- `prefers-reduced-motion`;
- reducción de desplazamiento;
- reducción de escala;
- eliminación de loops no esenciales;
- conservación del feedback mediante contraste, borde u opacidad;
- no bloquear la lectura;
- no depender exclusivamente del movimiento.

### 10.6 Duraciones orientativas

```text
controles:          100–180 ms
tooltips/popovers:  125–200 ms
dropdowns:          150–250 ms
modales y drawers:  200–500 ms
```

Reglas:

- no utilizar duraciones largas en controles repetitivos;
- evitar `ease-in` para la respuesta inicial de controles;
- preferir `transform` y `opacity` antes que cambios de layout;
- no utilizar loops permanentes sin significado funcional.

## 11. Accesibilidad perceptual

Más allá del contraste numérico, la revisión valida la **percepción real** del usuario:

- contraste suficiente en texto, iconos y bordes;
- jerarquía legible a primera vista;
- independencia del color para comunicar estados (color + forma/etiqueta/icono);
- foco visible y navegación completa por teclado;
- legibilidad sobre fotografía y superficies translúcidas;
- movimiento reducido disponible para quien lo prefiera;
- densidad controlada: ni vacío decorativo ni saturación visual;
- correspondencia entre la metáfora visual y la función comercial o profesional real.

## 12. Checklist obligatorio del Director de Arte

Cada revisión visual debe comprobar:

- contexto correcto de la galaxia;
- fondo consecuente;
- legibilidad;
- contraste;
- jerarquía;
- tipografía;
- densidad;
- uso moderado de glassmorphism;
- consistencia de tokens;
- `hover`;
- `focus-visible`;
- `active`;
- `selected`;
- `disabled`;
- `loading`;
- `error`;
- `success`;
- responsive;
- teclado;
- `reduced motion`;
- rendimiento perceptual;
- dependencia del color;
- correspondencia entre metáfora visual y función.

El checklist se registra en el informe de arte (`docs/agent-reports/<task-id>.md`, bloque del
Director de Arte de `GWS_REPORT_TEMPLATES.md`), sin omitir ningún punto.

## 13. Criterios de decisión

El Director de Arte debe devolver **uno** de estos estados:

```text
VISUAL_PASS
VISUAL_PASS_WITH_CONDITIONS
VISUAL_REJECTED
VISUAL_REQUIRES_DECISION
```

**Debe rechazar** (`VISUAL_REJECTED`) cuando:

- el fondo contradice la galaxia;
- parece una plantilla genérica;
- el glow impide leer;
- el glassmorphism reduce el contraste;
- depende solo del `hover`;
- carece de foco visible;
- carece de `reduced motion`;
- carece de estados;
- una credencial visual implica una verificación inexistente;
- una bóveda visual implica protección legal inexistente;
- el movimiento distrae o bloquea;
- la metáfora domina la función;
- el componente está visualmente pulido pero funcionalmente confuso.

`VISUAL_PASS_WITH_CONDITIONS` exige enumerar las condiciones de forma verificable y releer su
cumplimiento antes de integrar. `VISUAL_REQUIRES_DECISION` se usa cuando el rechazo o la
aprobación dependen de una decisión que excede la autoridad del Director de Arte.

> **Compatibilidad con el flujo.** `GWS_WORKFLOW.md` usa `VISUAL_CONFLICT` para el conflicto
> visual irreconciliable; equivale operativamente a `VISUAL_REQUIRES_DECISION`.
>
> **Plantillas de reportes visuales.** `docs/agents/GWS_REPORT_TEMPLATES.md` ya fue alineado
> con los cuatro estados oficiales: `VISUAL_PASS`, `VISUAL_PASS_WITH_CONDITIONS`,
> `VISUAL_REJECTED` y `VISUAL_REQUIRES_DECISION`. La alineación fue verificada mediante el
> informe de cierre documental (`docs/agents/GWS_PRE_APPROVAL_AUDIT.md`) y el verificador de
> gobierno (`tools/governance/verify-agents.mjs`, que registra este estándar en `DOCS`).
> Cualquier modificación posterior de estas plantillas requiere revisión del Director de Arte
> y nueva validación documental.

## 14. Relación con el gobierno y los informes

- **Autoridad:** este estándar es normativo para la presentación y subordinado a
  `GWS_AGENT_GOVERNANCE.md`.
- **Obligatorio para:** el Director de Arte y los cinco subagentes `[ART-SQUAD]` (ver §1).
- **Permisos:** el Director de Arte y `[ART-SQUAD]` no editan backend, datos, pagos,
  autenticación ni migraciones (los límites técnicos viven en el gobierno y el registro; este
  estándar no los modifica).
- **Trazabilidad:** toda revisión deja constancia en `docs/agent-reports/<task-id>.md` con el
  estado de decisión y el checklist completo.
- **Compuerta:** no se integra un cambio visible sin `VISUAL_PASS`.

## 15. Evolución del estándar

- Los cambios a este documento se **proponen** con motivo, evidencia y reversibilidad, y los
  **aprueba el humano** (coherente con la regla de gobierno de que un agente no modifica sus
  propios criterios de aprobación).
- Los tokens evolucionan por decisión del Director de Arte, dejando registro del cambio y su
  justificación.
- Ninguna regla de este documento autoriza a tocar código de producto, datos, pagos,
  autenticación o migraciones.
