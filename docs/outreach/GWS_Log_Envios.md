# Log de envíos — Frente 2 (Outreach)

> **Glass World Studio (GWS) busca Alianzas Estratégicas: Inversores, Desarrolladores y Logística.**
> Orden de prioridad: 1) **Inversores y capital** · 2) **Desarrolladores** · 3) **Logística** (pilar operativo).
> **Archivo generado automáticamente** por `tools/outreach/build-envios-log.mjs`. No editar a mano.
> **Estado real, sin inventar.** Nada se marca «enviado» sin registro en `send-log.jsonl`.
> Los correos viven en los CSV **ignorados por git**: acá solo van organización/nombre, canal y estado.
> Contacto al pie: **Eduardo Esper · Web https://www.glassworldstudio.com.ar · edu.esper@glassworldstudio.com.ar · +54 9 385 622-8400**

Actualizado: 2026-10-16 15:26 (hora local)

---

## Estado del canal de envío

| Canal | Estado |
|---|---|
| **SMTP Gmail** (`tools/outreach/send-batch.mjs`) | 🟢 Operativo (envío automatizado con throttling) |
| **Runner OpenOutreach** | 🔴 Bloqueado — faltan `OPENOUTFIND_LLM_API_KEY` y `OPENOUTFIND_BETTERCONTACT_API_KEY` |
| **MCP IMAP** | 🔵 Solo lectura (no envía) |
| **Devs (GitHub/LinkedIn)** | ⚪ Manual (LinkedIn omitido 100%) |

---

## ✅ Lote 1 — Logística (P1 + P2) · 10 destinatarios

| # | Prioridad | Organización | Cobertura | Canal | Estado |
|---|---|---|---|---|---|
| 1 | P1 | Universal Cargo Argentina | Argentina / internacional | email | ✅ ENVIADO (16/10 04:44) |
| 2 | P1 | ESI Fine Art (Group ESI) | España / internacional | formulario web | Formulario web (manual) |
| 3 | P1 | XPO (Museums & Art) | Global | formulario web | Formulario web (manual) |
| 4 | P1 | Masterpiece International | Global (EE.UU.) | email | ✅ ENVIADO (16/10 04:44) |
| 5 | P1 | EMO Trans | Global | formulario web | Formulario web (manual) |
| 6 | P1 | Movart | México | email | ✅ ENVIADO (16/10 04:45) |
| 7 | P2 | PalletCo | Argentina | email | ✅ ENVIADO (16/10 04:46) |
| 8 | P2 | Integral Project | Chile | email | ✅ ENVIADO (16/10 04:47) |
| 9 | P2 | Embamat | España | email | ✅ ENVIADO (16/10 04:48) |
| 10 | P2 | Lumber & Pallets | [COMPLETAR] | email | ✅ ENVIADO (16/10 04:50) |

---

## ⏸️ Lote 2 — Preparado (SIN ENVIAR) · logística P3–P6 + institucionales

> Base lista. Se dispara **sólo** con orden expresa, tras medir la respuesta del Lote 1.
> Comando por subgrupo (throttling 60 s por defecto):

```powershell
node tools/outreach/send-batch.mjs --execute --tag=lote2 --source=docs/logistica/GWS_Correos_Forwarders.md
node tools/outreach/send-batch.mjs --execute --tag=lote2 --source=docs/logistica/GWS_Correos_Logistica_Cierre.md
node tools/outreach/send-batch.mjs --execute --tag=lote2 --source=docs/outreach/inversores/GWS_Correos_Institucionales.md
```

### Logística P3 (forwarders) · 3 destinatarios

| # | Organización | Canal | Estado |
|---|---|---|---|
| 1 | Oceanic Logística | email | ✅ ENVIADO (16/10 05:18) |
| 2 | BAIFF Freight | email | ✅ ENVIADO (16/10 05:19) |
| 3 | Atlantic Cargo SRL / Transmodal | email | ✅ ENVIADO (16/10 05:20) |

### Logística P4–P6 (cierre) · 2 destinatarios

| # | Organización | Canal | Estado |
|---|---|---|---|
| 1 | Chubb Chile | email | ✅ ENVIADO (16/10 05:20) |
| 2 | International Cargo | email | ✅ ENVIADO (16/10 05:21) |

### Institucionales / inversores · 18 destinatarios

| # | Organización | Canal | Estado |
|---|---|---|---|
| 1 | Alaya Capital Partners | email | ✅ ENVIADO (16/10 05:21) |
| 2 | Red Sudamericana de Inversiones | email | ✅ ENVIADO (16/10 05:22) |
| 3 | IESE BAN | email | ✅ ENVIADO (16/10 05:23) |
| 4 | ANFEVI | email | ✅ ENVIADO (16/10 05:24) |
| 5 | CAVIPLAN | email | ✅ ENVIADO (16/10 05:26) |
| 6 | AMEVEC | email | ✅ ENVIADO (16/10 05:27) |
| 7 | Vidrala | email | ✅ ENVIADO (16/10 05:28) |
| 8 | Envases del Sur | email | ✅ ENVIADO (16/10 05:29) |
| 9 | Family Capital | email | ✅ ENVIADO (16/10 05:30) |
| 10 | Adduntia | email | ✅ ENVIADO (16/10 05:31) |
| 11 | Glass Alliance Europe | email | ✅ ENVIADO (16/10 05:32) |
| 12 | Glass for Europe | email | ✅ ENVIADO (16/10 05:33) |
| 13 | Glass Packaging Institute | email | ✅ ENVIADO (16/10 05:34) |
| 14 | Assovetro | email | ✅ ENVIADO (16/10 05:35) |
| 15 | Bundesverband Glasindustrie e.V. | email | ✅ ENVIADO (16/10 05:36) |
| 16 | Associação Brasileira das Indústrias de Vidro | email | ✅ ENVIADO (16/10 05:37) |
| 17 | Inveready | email | ✅ ENVIADO (16/10 05:39) |
| 18 | FORUM GmbH | email | ✅ ENVIADO (16/10 05:40) |

> **Lote 2 total: 23 con correo.** Además, hay organizaciones **sin correo** (sólo formulario web):
> ESI Fine Art (Group ESI) · XPO (Museums & Art) · EMO Trans · Speed Transport Argentina · Transaltic · Clippers Argentina S.A. · Geodis Argentina · Kuehne + Nagel · Maersk · ONE (Ocean Network Express) · DHL Express · FedEx · UPS · Zurich Argentina · MAPFRE Chile · ADS Group International

---

## Lote 1 — Devs (multiagente + B2B) · 24 destinatarios

> Los devs **no tienen correo** en la lista: canal **GitHub/LinkedIn**, **manual** (LinkedIn omitido 100%).

| # | Perfil | Dev | Empresa / foco | Estado |
|---|---|---|---|---|
| 1 | b2b | Vitor Freitas | Eskolare | Pendiente (manual) |
| 2 | b2b | Avelino | Buser Brasil | Pendiente (manual) |
| 3 | b2b | Ignacio Buioli | ExemaxSAS / Codize | Pendiente (manual) |
| 4 | b2b | Ikdem Ben Mbarek | waaw.tn | Pendiente (manual) |
| 5 | b2b | Abanoub Essam | FlyAkeed | Pendiente (manual) |
| 6 | b2b | Surendrasingh Sucharia | EkStep | Pendiente (manual) |
| 7 | b2b | Taksh Dange | — | Pendiente (manual) |
| 8 | b2b | Akhil | Flowmate (CEO) | Pendiente (manual) |
| 9 | b2b | Eon White | Charthop | Pendiente (manual) |
| 10 | b2b | Michał Lytek | Magna Digital | Pendiente (manual) |
| 11 | b2b | Arda Tanrıkulu | — | Pendiente (manual) |
| 12 | b2b | Joshua Harms | Nozzlegear Software | Pendiente (manual) |
| 13 | b2b | Thrashy | Southwest Airlines | Pendiente (manual) |
| 14 | b2b | Santiago Aloi | Skriptjobs (fundador) | Pendiente (manual) |
| 15 | b2b | Emilia | BitGo | Pendiente (manual) |
| 16 | b2b | learnsmartcoding | — | Pendiente (manual) |
| 17 | b2b | spurtcomm | Piccosoft Software Labs | Pendiente (manual) |
| 18 | multiagente | Facundo Uferer | — | Pendiente (manual) |
| 19 | multiagente | Juan Olié | Marvik AI | Pendiente (manual) |
| 20 | multiagente | Gustavo Juantorena | — | Pendiente (manual) |
| 21 | multiagente | Hongnan Li | GitHub | Pendiente (manual) |
| 22 | multiagente | Mihai | Zendesk | Pendiente (manual) |
| 23 | multiagente | dabochen | — | Pendiente (manual) |
| 24 | multiagente | dumko2001 | — | Pendiente (manual) |

---

## Tanda 5 — Devs (revisión lista)

- **45 pre-curados** (35 multiagente · 8 datos/BI · 2 i18n) → revisión en `docs/outreach/desarrolladores/GWS_Tanda5_Revision.md`.
- Datos crudos en `github-tanda5-curados.csv` (ignorado por git). Contacto **manual**.

---

## Registro de envíos (automático)

| Fecha | Lote | Organización | Resultado |
|---|---|---|---|
| 16/10 04:44 | lote1 | Universal Cargo Argentina | ✅ enviado |
| 16/10 04:44 | lote1 | Masterpiece International | ✅ enviado |
| 16/10 04:45 | lote1 | Movart | ✅ enviado |
| 16/10 04:46 | lote1 | PalletCo | ✅ enviado |
| 16/10 04:47 | lote1 | Integral Project | ✅ enviado |
| 16/10 04:48 | lote1 | Embamat | ✅ enviado |
| 16/10 04:50 | lote1 | Lumber & Pallets | ✅ enviado |
| 16/10 05:18 | lote2 | Oceanic Logística | ✅ enviado |
| 16/10 05:19 | lote2 | BAIFF Freight | ✅ enviado |
| 16/10 05:20 | lote2 | Atlantic Cargo SRL / Transmodal | ✅ enviado |
| 16/10 05:20 | lote2 | Chubb Chile | ✅ enviado |
| 16/10 05:21 | lote2 | International Cargo | ✅ enviado |
| 16/10 05:21 | lote2 | Alaya Capital Partners | ✅ enviado |
| 16/10 05:22 | lote2 | Red Sudamericana de Inversiones | ✅ enviado |
| 16/10 05:23 | lote2 | IESE BAN | ✅ enviado |
| 16/10 05:24 | lote2 | ANFEVI | ✅ enviado |
| 16/10 05:26 | lote2 | CAVIPLAN | ✅ enviado |
| 16/10 05:27 | lote2 | AMEVEC | ✅ enviado |
| 16/10 05:28 | lote2 | Vidrala | ✅ enviado |
| 16/10 05:29 | lote2 | Envases del Sur | ✅ enviado |
| 16/10 05:30 | lote2 | Family Capital | ✅ enviado |
| 16/10 05:31 | lote2 | Adduntia | ✅ enviado |
| 16/10 05:32 | lote2 | Glass Alliance Europe | ✅ enviado |
| 16/10 05:33 | lote2 | Glass for Europe | ✅ enviado |
| 16/10 05:34 | lote2 | Glass Packaging Institute | ✅ enviado |
| 16/10 05:35 | lote2 | Assovetro | ✅ enviado |
| 16/10 05:36 | lote2 | Bundesverband Glasindustrie e.V. | ✅ enviado |
| 16/10 05:37 | lote2 | Associação Brasileira das Indústrias de Vidro | ✅ enviado |
| 16/10 05:39 | lote2 | Inveready | ✅ enviado |
| 16/10 05:40 | lote2 | FORUM GmbH | ✅ enviado |

---

## Métricas (estado real)

| Métrica | Valor |
|---|---|
| **Enviados** | **30** (logística Lote 1) |
| Fallidos (reintentar) | **0** |
| Lote 2 preparado (con correo) | **23** |
| Devs en pool | **98** |
| — priorizados multiagente | **7** |
| — priorizados B2B | **17** |
| Logística en pool | **28** |
| — prioridad 1 | **6** |
| — prioridad 2 | **4** |
| — prioridad 3–6 (Lote 2) | **18** |
| Tanda 5 (pre-curados) | **45** |

