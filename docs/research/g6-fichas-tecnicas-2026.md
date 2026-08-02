# G6 · Base Preconfigurada de Fichas Técnicas — Investigación y Autopredictor (2026)

> **Orden Suprema (Base de Datos Inteligente de Ficha Técnica, Galaxia 6 —
> Ingeniería y Oficio)**. Objetivo: eliminar la fricción y el cansancio del
> comerciante al subir productos estandarizados. El sistema detecta la
> referencia por patrones de catálogo y autocompleta la ficha técnica
> oficial; piezas de autor usan el formulario manual (fallback).
> **Regla dura**: nada se auto-publica — el vendedor SIEMPRE corrige antes
> de publicar. Los datos se curan con fuente (trazabilidad `sourceRef`).

---

## 1. Qué se construyó (backend)

| Componente | Ruta | Función |
|---|---|---|
| Entidades | `src/galaxies/g6-tech-sheets/tech-sheet-template.entity.ts` y `tech-sheet.entity.ts` | Patrón precargado + ficha del comerciante |
| Autopredictor | `src/galaxies/g6-tech-sheets/g6-tech-sheets.service.ts` | Matching por patrón (nombre ×3, keywords ×2, marcas ×1) |
| Controller | `.../g6-tech-sheets.controller.ts` | `GET /g6/tech-sheets/catalog|meta`, `POST .../suggest`, `POST ...`, `GET .../mine` |
| Migración + seed | `src/database/migrations/1741000000000-G6TechSheetsSchema.ts` | Tablas + catálogo precargado (16 templates) |

## 2. El catálogo precargado (seed con fuente)

| Familia | Referencias seed | Ficha oficial incluye |
|---|---|---|
| Pirómetros | digital IR / digital con termocupla / analógico | rango °C, precisión, emisividad, respuesta, voltaje, salida |
| Termocuplas | tipo K (NiCr–NiAl) / tipo S (PtRh10–Pt) | aleación, rango, tolerancia, protección cerámica |
| Hornos | fundición de vidrio | clase, sistema de fuego, temp de fusión, refractarios |
| Grisallas | **630 / 750 / 820 °C** (orden explícita) | temp de fusión, banda de cocción, curva sugerida, vidrio compatible |
| Óxidos | cobalto / cobre / hierro | fórmula, rol colorante, % de adición, rango de cocción |
| Esmaltes | baja / media temperatura | banda de cocción, superficie, metales pesados regulados |
| Varillas | borosilicato 3.3 (COE 33) / sodo-cálcico | COE, diámetros, strain/anneal/softening, norma |

El seed marca `sourceRef.curated`: las grisallas (630/750/820) y la varilla
borosilicato (ISO 3585/DIN 12315) están curadas; el resto es benchmark de
catálogo 2026 **pendiente de curaduría final** con catálogo del fabricante.

## 3. Mecánica del autopredictor

1. El comerciante escribe el nombre (ej: "termocupla tipo K cerámica").
2. `normalize()`: minúsculas + sin acentos + tokenización.
3. Score por token contra nombre (×3), keywords (×2) y marcas (×1) de cada
   template activo; se devuelven las top 5.
4. Si hay match → `source='autocomplete'`, la ficha oficial se copia a la
   ficha del comerciante (siempre editable, status `draft`).
5. Sin match → fallback `source='manual'`: formulario limpio del comerciante.

## 4. Bucle de investigación en paralelo (Orden §3 — scraping)

Directiva: recopilar catálogos industriales globales de insumos de vidrio,
componentes térmicos, aleaciones de termocuplas y pigmentos cerámicos/vítreos,
estructurados en tablas relacionales (NestJS + PostgreSQL).

**Protocolo (respetando gobernanza §3.2/§3.6)**:
1. Fuentes públicas lícitas: catálogos de fabricantes, normativas
   (IEC 60584, ISO 3585, UL/CE/EN), bibliotecas técnicas de la Bóveda.
2. Cada ítem nuevo entra con `sourceRef` (origen + edición) y `curated`
   hasta que Jorge la valide — igual gate de la Bóveda.
3. **Pendiente bloqueado**: el scraping masivo de catálogos en bucle se
   registra en `docs/ops/pendientes-bloqueados-codespace.md` (P4) — requiere
   revisión de derechos de contenido y ejecución confinada (Codespace).
4. Los ítems curados alimentan el seed por una NUEVA migración (nunca editar
   la 1741000000000 ya versionada).

## 5. Pendientes

- [ ] Curaduría final de los templates `curated:false` con catálogos reales.
- [ ] P4 (scraping en bucle) — ver registro de pendientes bloqueados.
- [ ] Conectar `productId` con el alta de productos del Marketplace (G2).
