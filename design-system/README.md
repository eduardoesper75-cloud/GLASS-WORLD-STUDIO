# Índice del Sistema de Diseño GWS (E10)

Mapa de los dos lenguajes de marca del proyecto. **Consistencia obligatoria**:
todo componente frontend generado por IA o agencia debe importar/replicar los
tokens canónicos de la identidad antes de escribir CSS propio.

---

## 1. Vetas de Luz (identidad canónica de marca)

Concepto: fusión de circuito y plomo de vitral — la tecnología al servicio del
oficio milenario. Es el lenguaje visual PRINCIPAL de las 6 Galaxias.

| Archivo | Rol | Estado |
|---|---|---|
| `gws-design-tokens.css` | **Fuente ÚNICA de verdad** en CSS: paleta por Galaxia (`--g1`–`--g6`), tipografía dual, utilidades `.glass` / `.glass-edge`, `[data-galaxy]` | Canónico |
| `gws-components.css` | Componentes reutilizables (botones, cards, glass, cabecera de Galaxia) que consumen los tokens | Consume tokens |
| `gws-fx.js` | Efectos: fondo "Vetas de Luz" (trazas ramificadas tipo circuito/vitral) y micro-interacciones | Animación funcional |
| `vetas-de-luz-demo.html` | Demo interactiva del lenguaje visual (referencia de armado) | Prototipo |
| `portada-umbral.html` | Portada principal de la web; enlaza los demás sistemas | Prototipo |

## 2. Código del Fuego (lenguaje de manuales/documentos de honor)

Concepto: tipografía display "de fuego" + datos en mono; lenguaje documental
del Comando (manuales, decretos, fichas). No compite con Vetas de Luz: es la
variante para lectura ceremonial y documentación de gobernanza.

| Archivo | Rol | Estado |
|---|---|---|
| `manual-codigo-del-fuego.html` | Manual maestro v2.0 interactivo — espejo del Markdown `docs/manual/codigo-del-fuego.md` | Enlazado desde `portada-umbral.html` (línea 914) |

## 3. Reglas de uso (no negociable)

1. **Tokens primero**: cualquier color, fuente o glassmorphism debe salir de
   `gws-design-tokens.css`. Prohibido inventar tokens por componente.
2. **Tecnología invisible** (CLAUDE.md §2): predictibilidad > brillo. El
   "Código del Fuego" es lenguaje documental, no reemplazo del glass del
   producto.
3. **Animación**: easing propio `cubic-bezier(0.16, 1, 0.3, 1)`; 150–300 ms
   micro-interacciones; 1–1,5 s solo para entradas premium (inteligencia web
   2026). Movimiento con función, nunca por defecto del navegador.
4. **Legibilidad industrial**: datos técnicos siempre en `--font-mono`
   (CLAUDE.md §2), nunca en la display itálica.

## 4. Migraciones en curso

- [ ] Portar `vetas-de-luz-demo.html` al stack de producción (Next.js + Tailwind)
      consumiendo los mismos tokens (CLAUDE.md §4: el prototipo no se porta 1:1).
- [ ] Adoptar duraciones/easing de la inteligencia web 2026 en los componentes.
