# Log de envíos — Frente 2 (Outreach)

> **Archivo generado automáticamente** por `tools/outreach/build-envios-log.mjs`. No editar a mano.
> **Estado real, sin inventar.** Nada se marca «enviado» sin registro en `send-log.jsonl`.
> Los correos viven en los CSV **ignorados por git**: acá solo van organización/nombre, canal y estado.
> Contacto al pie: **Eduardo Esper · esper.eduardo@gmail.com · +54 9 385 582-6289**

Actualizado: 2026-10-16 04:51 (hora local)

---

## Estado del canal de envío

| Canal | Estado |
|---|---|
| **SMTP Gmail** (`tools/outreach/send-lote1.mjs`) | 🟢 Operativo (envío automatizado con throttling) |
| **Runner OpenOutreach** | 🔴 Bloqueado — faltan `OPENOUTFIND_LLM_API_KEY` y `OPENOUTFIND_BETTERCONTACT_API_KEY` |
| **MCP IMAP** | 🔵 Solo lectura (no envía) |

---

## Lote 1 — Logística (P1 + P2) · 10 destinatarios

| # | Prioridad | Organización | Cobertura | Canal | Estado |
|---|---|---|---|---|---|
| 1 | P1 | EMO Trans | Global | formulario web | Pendiente (formulario web) |
| 2 | P1 | ESI Fine Art (Group ESI) | España / internacional | formulario web | Pendiente (formulario web) |
| 3 | P1 | Masterpiece International | Global (EE.UU.) | email | ✅ ENVIADO (16/10 04:44) |
| 4 | P1 | Movart | México | email | ✅ ENVIADO (16/10 04:45) |
| 5 | P1 | Universal Cargo Argentina | Argentina / internacional | email | ✅ ENVIADO (16/10 04:44) |
| 6 | P1 | XPO (Museums & Art) | Global | formulario web | Pendiente (formulario web) |
| 7 | P2 | Embamat | España | email | ✅ ENVIADO (16/10 04:48) |
| 8 | P2 | Integral Project | Chile | email | ✅ ENVIADO (16/10 04:47) |
| 9 | P2 | Lumber & Pallets | [COMPLETAR] | email | ✅ ENVIADO (16/10 04:50) |
| 10 | P2 | PalletCo | Argentina | email | ✅ ENVIADO (16/10 04:46) |

## Lote 1 — Devs (multiagente + B2B) · 24 destinatarios

> Los devs **no tienen correo** en la lista: el canal es **GitHub/LinkedIn**, que está **omitido 100%**
> (sin automatización ni scraping). Se contactan a mano.

| # | Perfil | Dev | Empresa / foco | Canal | Estado |
|---|---|---|---|---|---|
| 1 | b2b | Vitor Freitas | Eskolare | GitHub/LinkedIn | Pendiente (manual) |
| 2 | b2b | Avelino | Buser Brasil | GitHub/LinkedIn | Pendiente (manual) |
| 3 | b2b | Ignacio Buioli | ExemaxSAS / Codize | GitHub/LinkedIn | Pendiente (manual) |
| 4 | b2b | Ikdem Ben Mbarek | waaw.tn | GitHub/LinkedIn | Pendiente (manual) |
| 5 | b2b | Abanoub Essam | FlyAkeed | GitHub/LinkedIn | Pendiente (manual) |
| 6 | b2b | Surendrasingh Sucharia | EkStep | GitHub/LinkedIn | Pendiente (manual) |
| 7 | b2b | Taksh Dange | — | GitHub/LinkedIn | Pendiente (manual) |
| 8 | b2b | Akhil | Flowmate (CEO) | GitHub/LinkedIn | Pendiente (manual) |
| 9 | b2b | Eon White | Charthop | GitHub/LinkedIn | Pendiente (manual) |
| 10 | b2b | Michał Lytek | Magna Digital | GitHub/LinkedIn | Pendiente (manual) |
| 11 | b2b | Arda Tanrıkulu | — | GitHub/LinkedIn | Pendiente (manual) |
| 12 | b2b | Joshua Harms | Nozzlegear Software | GitHub/LinkedIn | Pendiente (manual) |
| 13 | b2b | Thrashy | Southwest Airlines | GitHub/LinkedIn | Pendiente (manual) |
| 14 | b2b | Santiago Aloi | Skriptjobs (fundador) | GitHub/LinkedIn | Pendiente (manual) |
| 15 | b2b | Emilia | BitGo | GitHub/LinkedIn | Pendiente (manual) |
| 16 | b2b | learnsmartcoding | — | GitHub/LinkedIn | Pendiente (manual) |
| 17 | b2b | spurtcomm | Piccosoft Software Labs | GitHub/LinkedIn | Pendiente (manual) |
| 18 | multiagente | Facundo Uferer | — | GitHub/LinkedIn | Pendiente (manual) |
| 19 | multiagente | Juan Olié | Marvik AI | GitHub/LinkedIn | Pendiente (manual) |
| 20 | multiagente | Gustavo Juantorena | — | GitHub/LinkedIn | Pendiente (manual) |
| 21 | multiagente | Hongnan Li | GitHub | GitHub/LinkedIn | Pendiente (manual) |
| 22 | multiagente | Mihai | Zendesk | GitHub/LinkedIn | Pendiente (manual) |
| 23 | multiagente | dabochen | — | GitHub/LinkedIn | Pendiente (manual) |
| 24 | multiagente | dumko2001 | — | GitHub/LinkedIn | Pendiente (manual) |

---

## Registro de envíos (automático)

| Fecha | Organización | Resultado |
|---|---|---|
| 16/10 04:44 | Universal Cargo Argentina | ✅ enviado |
| 16/10 04:44 | Masterpiece International | ✅ enviado |
| 16/10 04:45 | Movart | ✅ enviado |
| 16/10 04:46 | PalletCo | ✅ enviado |
| 16/10 04:47 | Integral Project | ✅ enviado |
| 16/10 04:48 | Embamat | ✅ enviado |
| 16/10 04:50 | Lumber & Pallets | ✅ enviado |

---

## Métricas (estado real)

| Métrica | Valor |
|---|---|
| **Enviados (logística)** | **7** |
| Fallidos (reintentar) | **0** |
| Devs en pool | **98** (todos `nuevo`) |
| — priorizados multiagente | **7** |
| — priorizados B2B | **17** |
| Logística en pool | **28** |
| — prioridad 1 | **6** |
| — prioridad 2 | **4** |
| Candidatos Tanda 5 | **45** (pendientes de curación) |

