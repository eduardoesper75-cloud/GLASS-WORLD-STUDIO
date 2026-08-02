---
name: gws-vetas-de-luz
description: "Usar este skill SIEMPRE que se cree o modifique cualquier componente visual de Glass World Studio (HTML/CSS/JS, React, o especificaciones de diseño para otra IA/agencia). Cubre: la paleta de color por Galaxia, el patrón de fondo 'Vetas de Luz', el sistema de vidrio (glassmorphism), tipografía dual, y las reglas de legibilidad industrial. Activar también cuando otra IA (Verdent u otra) proponga estética nueva para GWS, para verificar consistencia contra este sistema antes de aceptarla."
---

# GWS · Vetas de Luz — Sistema de Consistencia Visual

## Por qué existe este skill

Múltiples IA/agencias trabajan en paralelo sobre GWS (Claude, Verdent, y
potencialmente otras). Sin una fuente única de verdad visual, cada una
tiende a generar su propia versión de "glassmorphism", y el resultado son
3-4 estéticas ligeramente distintas conviviendo mal. Este skill es esa
fuente única. Cualquier propuesta visual nueva se valida contra esto antes
de aceptarse — no al revés.

## La tesis de diseño (no negociable sin decisión explícita de Jorge)

El circuito impreso y la veta de plomo de un vitral son la misma forma: un
camino que se ramifica en ángulos, transportando algo (electrones / luz).
GWS no usa un fondo "tech genérico" (placas de circuito de stock) ni un
panel de vidrio como dos capas separadas — usa un único patrón que se lee
simultáneamente como PCB y como plomo de vitral, con un pulso lento que
simula tanto datos como fuego corriendo dentro del vidrio caliente. Este
patrón se llama **"Vetas de Luz"**.

Si una IA o agencia propone reemplazar esto por un fondo de circuito
genérico (imagen de stock, motivo "tech" sin relación con vidrio), **eso es
una regresión de marca, no una mejora** — señalarlo explícitamente antes de
implementar.

## Paleta por Galaxia

Cada Galaxia tiene una identidad cromática propia. No reutilizar el color
de una Galaxia para otra, ni introducir colores nuevos sin definir su
Galaxia correspondiente.

| Galaxia | Core | Glow | Concepto |
|---|---|---|---|
| G1 Artistas | `#E8A54B` | `#F4C77E` | Oro fundido de horno |
| G2 Marketplace | `#4FA8D8` | `#7FC4EA` | Azul borosilicato |
| G3 Comunidad | `#E36E80` | `#F09AA8` | Coral humano |
| G4 Instituciones | `#8577E0` | `#ABA1EE` | Violeta institucional |
| G5 Gran Industria | `#9BA5B3` | `#C7CEDA` | Acero + señal ámbar `#D98A3D` |
| G6 Ingeniería Predictiva | `#52E0C4` | `#8CF0DC` | Fósforo de dato |
| Satélite (transversal) | `#F2545B` | `#FF8288` | No pertenece a ninguna Galaxia — uso exclusivo para licitaciones/alertas |

Base neutra: `--bg-void:#07080a` (fondo raíz), texto primario
`#F3F1EC` (blanco cálido, nunca `#fff` puro).

## Tipografía dual

- **Display** (gestos, títulos, nombres propios): serif itálica
  (`Instrument Serif` en producción; `Georgia` como fallback). Referencia
  al trazo del vidrio soplado — orgánico, no geométrico.
- **Cuerpo**: sans neutra (`Inter`). No compite visualmente con el display.
- **Mono** (dato técnico): `IBM Plex Mono` / `SFMono`. **Regla dura**:
  cualquier dato técnico (COE, pureza, MOQ, número de lote, precio, specs
  de ingeniería) va SIEMPRE en mono, NUNCA en la tipografía display
  itálica. Mezclar esto es el error más común que comete una IA sin este
  skill: pone todo en la fuente "linda" y el dato técnico pierde precisión
  visual.

## Sistema de vidrio (glassmorphism)

Una sola utilidad, no reinventar por componente (la versión CSS implementable
de estos tokens está en `design-system/gws-design-tokens.css` — ese archivo es
la fuente canónica que todo frontend debe importar):

```css
.glass {
  background: rgba(255,255,255,.045);
  backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(255,255,255,.12);
}
```

Variante `.glass--strong` para jerarquía alta (fondo `rgba(255,255,255,.08)`,
borde `rgba(255,255,255,.28)`).

**Borde de refracción** (`.glass-edge`): un hairline que se separa en un
degradé de color de la Galaxia activa al hacer hover/focus — la luz
partiéndose al cruzar el vidrio. Usar con moderación, solo en elementos de
alta jerarquía (nav activo, CTA principal, tarjetas de nivel "Ícono").
Abusar de este efecto en elementos secundarios le resta jerarquía a los
elementos que sí importan.

## Los tres niveles de peso visual (jerarquía de artist_tier / actor_tier)

Cuando un componente representa a un actor con nivel (artista, comerciante,
institución), el peso visual debe reflejar el nivel, no solo un badge de
texto:

1. **Vanguardia / nivel base**: superficie plana (`--bg-raised`), sin blur.
   La austeridad es el mensaje — no es "menos terminado", es
   intencionalmente sobrio.
2. **Maestro / nivel medio**: `.glass` estándar.
3. **Ícono / nivel alto**: `.glass--strong` + halo de color de fondo
   (`radial-gradient` con el tint de la Galaxia) + `.glass-edge` activo sin
   necesidad de hover.

## Checklist antes de dar por aprobado un componente nuevo

- [ ] ¿Usa el color de la Galaxia correcta, sin inventar tonos nuevos?
- [ ] ¿El dato técnico está en mono, no en display?
- [ ] ¿Reutiliza `.glass`/`.glass-edge` en vez de un `backdrop-filter` propio?
- [ ] ¿Respeta el principio de "Tecnología Invisible" (ver CLAUDE.md §2):
      prioriza función sobre impacto visual gratuito?
- [ ] Si incluye un placeholder (video, imagen, dato no real), ¿está
      rotulado explícitamente como tal, para no generar una expectativa
      falsa en quien lo vea?
