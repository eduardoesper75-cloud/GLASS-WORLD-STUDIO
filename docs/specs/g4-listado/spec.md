# Spec — G4 Listado de Borosilicato y Envases

## QUÉ

Listado paginado de productos de borosilicato (varillas, tubos, placas) y envases (frascos, ampolletas, botellas, viales) con filtros por tipo, material, tolerancia térmica y fabricante.

## PARA QUIÉN

Compradores de ciencia, farmacia, investigación y laboratorios que necesitan envases de precisión y borosilicato de alta resistencia.

## POR QUÉ

Es la primera aplicación de la plantilla G2 en otra galaxia. Valida que el patrón arquitectónico es replicable y prueba la corrección Doctrina v2.

## CRITERIOS DE ACEPTACIÓN

- **CA1:** /g4 renderiza con fondo teal oscuro y acento `#2DD4BF` (identidad cromática G4).
- **CA2:** Endpoint GET `/api/g4/products` devuelve 20 items paginados.
- **CA3:** Filtros: tipo (borosilicato/envase), material, tolerancia térmica, fabricante.
- **CA4:** Tests backend mínimo 8.
- **CA5:** Lighthouse > 90 en /g4.
- **CA6:** Carga en < 3 segundos.
- **CA7:** Reutiliza tabla products con discriminador `galaxy = 'g4'` (Path A validado en G2).

## FUERA DE ALCANCE

- Carrito
- Checkout
- Cotizaciones a escala
- Detalle de producto
- Especificaciones técnicas avanzadas

## DEPENDENCIAS

- PostgreSQL (tabla products existente)
- NestJS (endpoint G4)
- Next.js (página /g4)
- Tailwind (identidad G4)
- Plantilla G2 (docs/ops/PLANTILLA-GALAXIA.md)

## RESTRICCIONES

- MUST: identidad cromática G4 (hue 190°, `#2DD4BF`)
- MUST: reutilizar tabla products (no crear tabla nueva)
- MUST: filtros inline en `page.tsx` (patrón G2)
- MUST NOT: inventar campos específicos de G4 sin CF