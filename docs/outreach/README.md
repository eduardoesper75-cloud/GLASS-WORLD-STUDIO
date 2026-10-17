# Outreach y Alianzas Estratégicas — Glass World Studio

> **Glass World Studio (GWS) busca Alianzas Estratégicas: Inversores, Desarrolladores y Logística.**
> Orden de prioridad: **1º Inversores y capital · 2º Desarrolladores · 3º Logística (pilar operativo)**.
> **Modo vigente: INVESTIGACIÓN Y SCOUTING.** El envío de correos está **bloqueado** (pausa
> institucional). El foco es **mapear puertas institucionales de alto valor** para golpear de forma
> selectiva. Ver [`GWS_Modo_Operativo.md`](./GWS_Modo_Operativo.md).

**Canales oficiales (obligatorios en toda comunicación):**

| Canal | Dato |
| --- | --- |
| Página web oficial | <https://www.glassworldstudio.com.ar> |
| Correo institucional (Don Web) | `edu.esper@glassworldstudio.com.ar` |
| Correo personal (respaldo) | `eduardoesper75@gmail.com` |
| Teléfono / WhatsApp directo | `+54 9 385 622-8400` · <https://wa.me/5493856228400> |

---

## Empezá por acá

| Documento | Para qué |
| --- | --- |
| [`GWS_Scouting_Puertas_Alto_Valor.md`](./GWS_Scouting_Puertas_Alto_Valor.md) | **El marco vigente:** investigación, verificación y curaduría de puertas de alto valor |
| [`GWS_Modo_Operativo.md`](./GWS_Modo_Operativo.md) | Estado operativo (`reposo`) y cómo se reanuda el envío |
| [`GWS_Plantillas_Institucionales.md`](./GWS_Plantillas_Institucionales.md) | Las 4 plantillas institucionales (Inversores · Desarrolladores · Educativo/Científico · Logística) |
| `scouting/puertas.template.csv` | Plantilla de la base de puertas (columnas y ejemplos marcados `EJEMPLO`) |

---

## Por eje

### 1. Inversores y capital *(1.º en prioridad)*
| Documento | Qué es |
| --- | --- |
| [`inversores/README.md`](./inversores/README.md) | Índice del eje |
| [`inversores/GWS_Guia_Prospeccion_Inversores.md`](./inversores/GWS_Guia_Prospeccion_Inversores.md) | Cómo armar la lista: fuentes conformes, perfiles y `hook` |
| [`inversores/GWS_Carta_Convocatoria_Institucional.md`](./inversores/GWS_Carta_Convocatoria_Institucional.md) | Carta corporativa de convocatoria |
| [`inversores/GWS_Pitch_Deck_Inversores.md`](./inversores/GWS_Pitch_Deck_Inversores.md) | Pitch deck |
| [`GWS_B1_Fuentes_Cifras_Mercado.md`](./GWS_B1_Fuentes_Cifras_Mercado.md) | Fuentes y cifras de mercado (con tesis TAM/SAM/SOM) |

### 2. Desarrolladores y arquitectos
| Documento | Qué es |
| --- | --- |
| [`desarrolladores/README.md`](./desarrolladores/README.md) | Kit de reclutamiento técnico (etapa fundacional) |
| [`desarrolladores/GWS_Perfil_Tecnico_Buscado.md`](./desarrolladores/GWS_Perfil_Tecnico_Buscado.md) | Roles, stack verificado y qué ofrecemos |

### 3. Logística y carga pesada/frágil *(pilar operativo)*
| Documento | Qué es |
| --- | --- |
| [`../logistica/README.md`](../logistica/README.md) | Diseño operativo de la logística del marketplace |
| [`../logistica/GWS_Priorizacion_Logistica.md`](../logistica/GWS_Priorizacion_Logistica.md) | Priorización de operadores (6 niveles) |
| [`../logistica/GWS_Matriz_Proveedores_Logisticos.md`](../logistica/GWS_Matriz_Proveedores_Logisticos.md) | Matriz preliminar de proveedores (candidatos a evaluar) |

---

## Herramientas

| Herramienta | Qué hace | Envía correo |
| --- | --- | --- |
| `tools/outreach/scout-curate.mjs` | **Curador del scouting:** valida, deduplica y emite la base limpia de puertas | No |
| `tools/outreach/followup-status.mjs` | Estado por contacto y elegibilidad para el 2º toque (lee el registro real) | No |
| `tools/outreach/send-batch.mjs` | Emisor por lotes (idempotente, con *throttle*). **Bloqueado en modo `reposo`** | Sí, sólo con `estado: activo` |

Generadores de piezas: `inversores/generate-correos-institucionales.mjs`,
`desarrolladores/generate-envios.mjs`, `linkedin/generate-drafts.mjs`,
`logistica/generate-correos-logistica.mjs`.

---

## Registros (locales, nunca versionados)

| Registro | Ruta |
| --- | --- |
| Envíos | `docs/logistica/send-log.jsonl` |
| Respuestas / bajas / rebotes | `docs/logistica/respuestas.jsonl` |
| Seguimiento | `docs/logistica/seguimiento.md` |
| Base de puertas y base limpia | `docs/outreach/scouting/puertas.csv` · `puertas-curadas.csv` |

---

## Guardarraíles

1. **Sin scraping**, sin extensiones de extracción, sin bots, sin bases compradas.
2. **Sin datos inventados:** lo que falta es `[COMPLETAR]`; las métricas que no existen no se estiman.
3. **Sólo canal corporativo publicado**; nunca el correo personal de un individuo.
4. **Máximo 3 toques** por contacto, ritmo humano, nunca dos el mismo día.
5. **Nada se envía** mientras el modo operativo esté en `reposo`.
