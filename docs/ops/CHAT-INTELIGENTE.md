# Chat Inteligente GWS

> FUENTE: ORDEN #033, BLOQUE 6 — diseño preliminar. **ORDEN #034:** decisiones
> confirmadas por Jorge: activo en las 6 galaxias, modelo Big Pickle (MVP).

## Objetivo

Asistente conversacional que:
- Hereda la cromática de la galaxia activa
- Ayuda a cargar productos (guía paso a paso)
- Resuelve dudas técnicas
- Sugiere productos basándose en historial
- Conecta con Conflict Arbitrator si hay dudas complejas

## Arquitectura técnica

- Backend: endpoint `/api/chat` con streaming
- Frontend: componente `<ChatWidget galaxy={currentGalaxy} />`
- Identidad cromática: usa tokens de la galaxia activa
- Modelo: **Big Pickle (MVP)**, upgrade a **GLM** si la calidad es insuficiente (ORDEN #034)
- Contexto: memoria del usuario + galaxia activa + productos vistos

## Identidad cromática por galaxia

| Galaxia | Color | Chat widget |
|---|---|---|
| G1 | `#FFD700` | Acento dorado |
| G2 | `#4A90E2` | Acento azul |
| G3 | `#B565E0` | Acento púrpura |
| G4 | `#2DD4BF` | Acento teal |
| G5 | `#FF6B35` | Acento naranja |
| G6 | `#4ADE80` | Acento verde |

## Casos de uso

- Usuario nuevo en G2: "¿cómo cargo un producto?"
- Usuario en G1: "¿qué técnica usó este maestro?"
- Usuario en G4: "necesito 1000 ampolletas, ¿quién las fabrica?"

## Decisiones confirmadas (ORDEN #034)

- Activo en las **6 galaxias**.
- Modelo: **Big Pickle (MVP)**; upgrade a **GLM** si la calidad es insuficiente.

## Pendiente [S]

- ¿Streaming o mensajes completos?