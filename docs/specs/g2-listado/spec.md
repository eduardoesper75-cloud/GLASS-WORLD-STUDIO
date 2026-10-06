# Spec — G2 Listado de Productos

> **ESTADO: PENDIENTE DE APROBACIÓN DE JORGE (PASO 5.2).**
> Fuente: ORDEN MAESTRA #024, BLOQUE 5, PASO 5.1. Sesión GWS-24.
> Doctrina GWS v1 adherida. EPG-1 adherido. PNA v1 adherido.

## QUÉ

Listado paginado de productos del marketplace G2 con filtros por categoría,
precio (rango) y marca.

## PARA QUIÉN

Usuario que llega a GWS buscando insumos, herramientas o materiales del
universo del vidrio.

## POR QUÉ

Es la puerta de entrada al marketplace. Sin listado no hay compra. Es el
primer slice vertical que demuestra el patrón de construcción del resto de
las galaxias.

## CRITERIOS DE ACEPTACIÓN (verificables)

- **CA1:** `/g2` renderiza con fondo azul oscuro y acento `#4A90E2`
  (identidad cromática G2 según Doctrina GWS v1 §3).
- **CA2:** Endpoint `GET /api/g2/products` devuelve 20 productos paginados.
- **CA3:** Filtros funcionan: categoría (string), precio (rango min/max), marca (string).
- **CA4:** Tests backend pasan (mínimo 8 tests).
- **CA5:** Lighthouse Score > 90 en `/g2`.
- **CA6:** Carga en < 3 segundos.

## FUERA DE ALCANCE

- Carrito
- Checkout
- Autenticación
- Detalle de producto
- Búsqueda full-text
- Ordenamiento avanzado

## DEPENDENCIAS

- PostgreSQL (tabla `products`)
- NestJS (endpoint paginado)
- Next.js (página `/g2`)
- Tailwind (estilos con identidad G2)

## RESTRICCIONES

- **MUST:** identidad cromática G2 (hue 200°, `#4A90E2` — dictado literal; ver nota de
  discrepancia de hue en `docs/ops/DOCTRINA-GWS.md`).
- **MUST:** fondo temático con fotos de producto (mesa de taller — dictado de Jorge
  en ORDEN #024 respuesta a #014).
- **MUST NOT:** inventar datos de productos en producción.
- **PREFER:** seed de datos de prueba coherente con el vidrio.

## NOTAS DE VERIFICACIÓN (PNA)

- `[V]` Dictado literal de Jorge (ORDEN #024 BLOQUE 5 PASO 5.1).
- `[I]` El hue real del hex `#4A90E2` es ~212°, no 200° — anotado en
  `DOCTRINA-GWS.md`; el hex manda hasta decisión de Jorge.
- `[S]` Rango de precios y textos del seed: sin fuente; se decide en
  implementation con datos coherentes del vidrio, marcado `[S]`.
- Investigación previa disponible en memoria `gws.research.*` (30 hallazgos
  arch/logic/design) — los builders deben consultarla antes de implementar
  (PNA aplicable: sin hallazgo, marcar `[S] "sin referencia"`).

## DEPENDENCIAS DE FASE

- **Prohibido implementar en esta fase** (#024 BLOQUE 2).
- PRÓXIMO PASO: PASO 5.2 — aprobación explícita de Jorge antes de `plan.md`.
