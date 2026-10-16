# Log de envíos — Frente 2 (Outreach)

> **Estado real, sin inventar.** Una fila por destinatario. **Nada se marca «enviado» hasta que salga.**
> Los correos viven en los CSV **ignorados por git** (`docs/logistica/logistica_aliados.csv`,
> `docs/outreach/desarrolladores/prospects_devs.csv`): acá solo van organización/nombre, canal y estado.
> Ritmo: humano, máximo **3 toques**, 1 cada 3–7 días.
> Contacto al pie: **Eduardo Esper · esper.eduardo@gmail.com · +54 9 385 582-6289**

Última actualización: 16-10-2026

---

## Estado del canal de envío

| Canal | Estado |
|---|---|
| **Runner OpenOutreach** (`run.ps1 send`) | 🔴 **BLOQUEADO** — faltan `OPENOUTFIND_LLM_API_KEY` y `OPENOUTFIND_BETTERCONTACT_API_KEY`; pipeline sin leads |
| **MCP IMAP** | 🔵 Solo lectura (no envía) |
| **Envío manual (Eduardo)** | 🟢 Disponible (regla del proyecto: humano en el bucle) |

---

## Lote 1 — Logística (P1 + P2) · 10 destinatarios

| # | Prioridad | Organización | Cobertura | Canal | Estado |
|---|---|---|---|---|---|
| 1 | P1 | Masterpiece International | Global (EE.UU.) | email | Pendiente de envío |
| 2 | P1 | EMO Trans | Global | email | Pendiente de envío |
| 3 | P1 | Movart | México | email | Pendiente de envío |
| 4 | P1 | Universal Cargo Argentina | Argentina / internacional | email | Pendiente de envío |
| 5 | P1 | ESI Fine Art (Group ESI) | España / internacional | email | Pendiente de envío |
| 6 | P1 | XPO (Museums & Art) | Global | email | Pendiente de envío |
| 7 | P2 | Embamat | España | email | Pendiente de envío |
| 8 | P2 | Lumber & Pallets | [COMPLETAR] | email | Pendiente de envío |
| 9 | P2 | PalletCo | Argentina | email | Pendiente de envío |
| 10 | P2 | Integral Project | Chile | email | Pendiente de envío |

## Lote 1 — Devs (multiagente + B2B) · 24 destinatarios

| # | Perfil | Dev | Empresa / foco | Canal | Estado |
|---|---|---|---|---|---|
| 1 | b2b | Michał Lytek | Magna Digital | GitHub/LinkedIn | Pendiente de envío |
| 2 | b2b | Arda Tanrıkulu | — | GitHub/LinkedIn | Pendiente de envío |
| 3 | b2b | Akhil | Flowmate (CEO) | GitHub/LinkedIn | Pendiente de envío |
| 4 | b2b | spurtcomm | Piccosoft Software Labs | GitHub/LinkedIn | Pendiente de envío |
| 5 | b2b | Joshua Harms | Nozzlegear Software | GitHub/LinkedIn | Pendiente de envío |
| 6 | b2b | Emilia | BitGo | GitHub/LinkedIn | Pendiente de envío |
| 7 | b2b | learnsmartcoding | — | GitHub/LinkedIn | Pendiente de envío |
| 8 | b2b | Thrashy | Southwest Airlines | GitHub/LinkedIn | Pendiente de envío |
| 9 | b2b | Santiago Aloi | Skriptjobs (fundador) | GitHub/LinkedIn | Pendiente de envío |
| 10 | b2b | Taksh Dange | — | GitHub/LinkedIn | Pendiente de envío |
| 11 | b2b | Avelino | Buser Brasil | GitHub/LinkedIn | Pendiente de envío |
| 12 | b2b | Vitor Freitas | Eskolare | GitHub/LinkedIn | Pendiente de envío |
| 13 | b2b | Eon White | Charthop | GitHub/LinkedIn | Pendiente de envío |
| 14 | b2b | Ignacio Buioli | ExemaxSAS / Codize | GitHub/LinkedIn | Pendiente de envío |
| 15 | b2b | Surendrasingh Sucharia | EkStep | GitHub/LinkedIn | Pendiente de envío |
| 16 | b2b | Abanoub Essam | FlyAkeed | GitHub/LinkedIn | Pendiente de envío |
| 17 | b2b | Ikdem Ben Mbarek | waaw.tn | GitHub/LinkedIn | Pendiente de envío |
| 18 | multiagente | dabochen | — | GitHub/LinkedIn | Pendiente de envío |
| 19 | multiagente | dumko2001 | — | GitHub/LinkedIn | Pendiente de envío |
| 20 | multiagente | Mihai | Zendesk | GitHub/LinkedIn | Pendiente de envío |
| 21 | multiagente | Gustavo Juantorena | — | GitHub/LinkedIn | Pendiente de envío |
| 22 | multiagente | Juan Olié | Marvik AI | GitHub/LinkedIn | Pendiente de envío |
| 23 | multiagente | Hongnan Li | GitHub | GitHub/LinkedIn | Pendiente de envío |
| 24 | multiagente | Facundo Uferer | — | GitHub/LinkedIn | Pendiente de envío |

---

## Tanda 5 — Devs cosechados (GitHub, pendientes de curación)

- `harvest-github.mjs` → **45 perfiles** nuevos (MCP/agentes, datos/BI, i18n), en
  `docs/outreach/desarrolladores/github-tanda5.csv` (**ignorado por git**).
- Próximo paso: **curación manual** → sumar los que correspondan a `prospects_devs.csv`.

---

## Métricas (estado real)

| Métrica | Valor |
|---|---|
| Devs en pool (`prospects_devs.csv`) | **98** (todos `nuevo`) |
| — priorizados multiagente | **7** |
| — priorizados B2B | **17** |
| Logística en pool | **28** (todas con email) |
| — prioridad 1 | **6** |
| — prioridad 2 | **4** |
| Candidatos Tanda 5 | **45** (pendientes de curación) |
| **Enviados** | **0** |
