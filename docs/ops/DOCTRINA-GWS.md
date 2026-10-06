# DOCTRINA GWS v2.1 (06/10/2026)

> **Fuente:** ORDEN MAESTRA #024, BLOQUE 1 — Declaración de identidad del ecommerce.
> v1 dictada por Jorge, 2026-10-06. **v2 (ORDEN #033):** G4 pasa a "Borosilicato y Envases" + pendientes `[S]`.
> **v2.1 (ORDEN #034):** pendientes `[S]` resueltos (G6, Servicios Técnicos, Chat, Flujo G1, ver §8).
> Nivel `[V]` como dictado literal del dueño del producto.
> Jerarquía (#024): CF-XXX → PNA v1 → EPG-1 → **esta Doctrina** → Specs SDD → Bibliografía → GitHub → prompts.chat → `[S]`.
>
> Nota PNA: el hex `#4A90E2` declarado con `hue 200°` calcula a ~212° (R=74, G=144, B=226 → H=212.4°).
> Se conserva literalmente el dictado; la discrepancia queda anotada para decisión de Jorge
> (no se altera el hex aprobado).

---

## 1. Propósito

> "Una plataforma con alma de taller que se fortalece con tu crecimiento."

## 2. Filosofía

> "Un taller de maestro vidriero a las 3 AM con el horno encendido. Oscuro, cálido, preciso."

## 3. Galaxias (6)

| # | Galaxia | Hue | Color | Símbolo |
|---|---|---|---|---|
| G1 | Íconos y Maestros | 45° | `#FFD700` | ◈ |
| G2 | Marketplace | 200° | `#4A90E2` | ◆ |
| G3 | Comunidad | 280° | `#B565E0` | ◇ |
| G4 | Borosilicato y Envases | 190° | `#2DD4BF` | ○ |
| G5 | Gran Industria | 15° | `#FF6B35` | ⬢ |
| G6 | Ingeniería y Oficio | 120° | `#4ADE80` | ⬡ |

### 3.1 G4 — Borosilicato y Envases (ORDEN #033)
- **Audiencia principal:** fabricantes y vendedores de borosilicato y envases.
- **Audiencia secundaria:** ciencia, farmacia, investigación, laboratorios (compradores).
- **Secciones:**
  - Borosilicato: vidrio resistente a choque térmico, varillas, tubos, placas
  - Envases: frascos, ampolletas, botellas, viales, envases farmacéuticos y cosméticos
  - Fabricantes: perfiles de fábricas
  - Vendedores: distribuidores
  - Aplicaciones: casos de uso (farmacia, laboratorio, cosmética, química)
- **Fondo temático:** talleres de soplado de borosilicato, líneas de producción de envases farmacéuticos, frascos de laboratorio, ampolletas.
- **Identidad:** hue 190°, color `#2DD4BF`, ícono ○ — se mantienen.

### 3.6 G6 — Ingeniería y Oficio (ORDEN #034)
- **Descripción:** taller técnico que vende repuestos, componentes y servicios técnicos.
- **Audiencia:** técnicos, reparadores, ingenieros de mantenimiento.
- **Identidad:** hue 120°, color `#4ADE80`, ícono ⬡ — se mantienen.

## 4. Satélites (5)

1. **Bóveda del Conocimiento** — fichas técnicas, bibliografía.
2. **Radar de Oferta y Demanda** — licitaciones, 3 pases.
3. **Rincón del Usado** — mercado secundario.
4. **Ingeniería Predictiva** — comandos open source.
5. **Servicios Técnicos** — directorio de profesionales. *Sin identidad cromática propia: hereda la cromática de la galaxia donde está activo (ORDEN #034).*

## 5. Identidad visual por galaxia (fondos temáticos)

| Galaxia | Fondo temático |
|---|---|
| G1 | foto de maestro soplador, horno encendido |
| G2 | fotos de producto (herramientas, hornos) |
| G3 | grupo de vidrieros compartiendo taller |
| G4 | talleres de soplado de borosilicato, líneas de producción de envases farmacéuticos, frascos de laboratorio, ampolletas |
| G5 | maquinaria pesada, línea de producción |
| G6 | taller mecánico, planos, componentes |

Cada galaxia tiene identidad cromática y estética propia.

## 6. Paleta base

| Token | Valor |
|---|---|
| `bg-base` | `#030712` (negro profundo) |
| `bg-elevated` | `#0a0f1e` (cards) |
| `text-primary` | `#f4f4f5` |
| `text-secondary` | `#a1a1aa` |
| `accent-amber` | `#FFD700` |
| `accent-ember` | `#FFA500` |

## 7. Relación con el design-system existente

- `design-system/gws-design-tokens.css` y el skill `gws-vetas-de-luz` siguen siendo canónicos
  para CSS hasta que Jorge ordene explícitamente fusionar esta Doctrina en ellos.
- Si un token de esta Doctrina entra en conflicto con los design tokens vigentes,
  **escalar a Jorge** (CF/§Sources mandan; no se pisca CSS por nuestra cuenta).

## 8. Pendientes `[S]` resueltos (ORDEN #034)

Confirmado por Jorge el 06/10/2026:

1. **G6** → se mantiene **"Ingeniería y Oficio"**. Descripción: taller técnico que vende repuestos, componentes y servicios técnicos. Audiencia: técnicos, reparadores, ingenieros de mantenimiento (ver §3.6).
2. **Servicios Técnicos (satélite)** → **sin identidad cromática propia**; hereda la cromática de la galaxia donde está activo.
3. **Chat inteligente** → activo en las **6 galaxias**; modelo **Big Pickle (MVP)**, upgrade a GLM si la calidad es insuficiente (ver CHAT-INTELIGENTE.md).
4. **Flujo G1** → wizard **adaptado**, no copia de G2: pasos para perfil de maestro + obras + cursos (confirmado en FLUJOS-DE-CARGA.md).
