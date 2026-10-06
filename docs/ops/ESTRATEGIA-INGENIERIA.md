# Estrategia de Ingeniería — Flota de Élite

> FUENTE: ORDEN #033, BLOQUE 4. Topología y agentes de la flota GWS.

## Capa 1 — Coordinación (OpenCode)

`architect`, `spec-writer`, `planner`, `task-breaker`, `verifier`

## Capa 2 — Ejecución (Ruflo)

`backend-builder`, `frontend-builder`, `tester`, `reviewer`,
`researcher-design`, `researcher-logic`, `researcher-arch`, `conflict-arbitrator`

## Capa 3 — Supervisión (Hermes)

Detección de gaps, sugerencias, cron cada 6h

## Anti-Drift Defaults

- **topology**: hierarchical
- **maxAgents**: 6-8
- **strategy**: specialized
- **consensus**: raft
- **memory**: hybrid