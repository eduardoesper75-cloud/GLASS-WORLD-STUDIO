# Plantilla Arquitectónica de Galaxia

> FUENTE: ORDEN #033, BLOQUE 2 — patrón validado en G2 (Sprint 1). Aplica a G1, G3, G4, G5, G6.
> Toda galaxia nueva sigue este patrón salvo dictado expreso de Jorge.

## Estructura de Backend (validado en G2)

- Módulo NestJS: `src/g<X>-<nombre>/`
- Entity con TypeORM
- DTOs con class-validator
- Service con filtros y paginación (`ORDER BY id ASC`)
- Controller con endpoints REST
- Migración de tabla
- Seed de datos de prueba

## Estructura de Frontend (validado en G2)

- Ruta `/g<X>` con layout propio
- Componente de grid/lista
- Filtros (inline en `page.tsx` según ORDEN #024)
- Paginación
- Identidad cromática de la galaxia
- Fondo temático
- Skeleton con `minHeight` correcto (evita CLS)
- E2E tests con Playwright

## Identidad Visual por Galaxia

| Galaxia | Hue | Color | Ícono | Nombre correcto |
|---|---|---|---|---|
| G1 | 45° | `#FFD700` | ◈ | Íconos y Maestros |
| G2 | 200° | `#4A90E2` | ◆ | Marketplace |
| G3 | 280° | `#B565E0` | ◇ | Comunidad |
| G4 | 190° | `#2DD4BF` | ○ | Borosilicato y Envases |
| G5 | 15° | `#FF6B35` | ⬢ | Gran Industria |
| G6 | 120° | `#4ADE80` | ⬡ | Ingeniería y Oficio |
| Servicios Técnicos | [heredada] | [heredada] | [heredada] | Servicios Técnicos |

> **Servicios Técnicos (ORDEN #034):** sin identidad cromática propia — hereda la
> cromática de la galaxia donde está activo (satélite por galaxia).

## Decisiones validadas en G2 (aplicar en otras galaxias)

- Reutilizar tabla `products` (Path A) — no crear tablas por galaxia
- Precio como `string` desde Postgres `numeric` (no decimal.js)
- Filtros inline en `page.tsx` (no componente separado)
- Acento cromático del spec prevalece sobre skills de diseño

## Aplicación por galaxia

- **G1**: adaptar para obras únicas + perfiles de maestros
- **G3**: adaptar para exhibición (sin venta)
- **G4**: adaptar para borosilicato + envases
- **G5**: adaptar para maquinaria + licitaciones
- **G6**: adaptar para repuestos + servicios