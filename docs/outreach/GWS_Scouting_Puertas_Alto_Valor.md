# GWS · Scouting de Puertas de Alto Valor

> **Pivote operativo:** el objetivo **ya no es el envío automatizado masivo**, sino **investigar y
> mapear nuevas puertas institucionales de alto valor** para golpear de forma **selectiva**.
> **Modo vigente: investigación.** El envío automático queda bloqueado
> (ver [`GWS_Modo_Operativo.md`](./GWS_Modo_Operativo.md)).
> Última actualización: 17-10-2026

---

## 0. Qué cambió y qué no

| | Antes | Ahora |
|---|---|---|
| Foco | pools grandes y envío por lotes | **investigación, mapeo y verificación** de puertas |
| Volumen | 144 piezas de contacto listas | **poco y bueno**: puertas verificadas una por una |
| Disparador | script de envío en lote | **decisión puntual y humana** sobre una base limpia |
| Métrica | correos enviados | **calidad de la puerta** (fuente citada + fundamento real) |

**Lo que NO cambia (guardarraíles del Manifiesto):**

1. **Nunca** scraping, extensiones de extracción, bots ni bases compradas.
2. **Nunca** se inventa un nombre, un email, un teléfono ni una métrica. Lo que falta es `[COMPLETAR]`.
3. Sólo se registra **canal corporativo publicado** por la organización. **Nunca** el correo personal
   de una persona (política del proyecto).
4. Máximo **3 toques** por contacto, ritmo humano, nunca dos el mismo día.
5. **Poco dato real** vale más que **mucho dato inventado**.

---

## 1. Los tres blancos y qué los hace "de alto valor"

### 1.1 Desarrolladores y arquitectos de ecosistemas digitales avanzados *(eje 2)*

| | |
|---|---|
| **Buscamos** | quien diseñe y sostenga **sistemas**, no quien cubra una vacante: arquitecturas multi-agente / MCP, sistemas distribuidos, marketplaces B2B transaccionales (matching, licitaciones, pagos, trazabilidad). |
| **Señal de alto valor** | **obra pública verificable**: repositorios propios, artículos técnicos, charlas, productos en producción. Que su trabajo se pueda leer sin adivinar. |
| **Descarte** | perfil genérico sin obra pública; agencias de *staffing* que revenden horas; "consultores" sin artefactos. |
| **Canal** | perfil público (GitHub, sitio personal) → **manual**, sin automatizar cuentas. |

### 1.2 Inversores, fondos semilla y mecenas con perfil tecnológico o industrial *(eje 1)*

| | |
|---|---|
| **Buscamos** | capital que **entienda la tesis**: fondos pre-seed/seed con tesis industrial, B2B infra, marketplace vertical, DeepTech o impacto; ángeles operadores; **mecenas** con obra industrial o tecnológica propia. |
| **Señal de alto valor** | **tesis explícita y pública** (portfolio con marketplaces verticales, manifiesto de inversión, cheques del tamaño correcto) y **capacidad de decisión** (socio/analista con mandato, dueño, presidente). |
| **Descarte** | fondos growth (ticket fuera de rango); fondos sin tesis; intermediarios sin capital; "cazadores de deals". |
| **Canal** | correo corporativo publicado o formulario del sitio. **La persona se suma por introducción cálida**, no por adivinanza. |

### 1.3 Logística especializada y transporte de carga pesada y frágil *(eje 3 — pilar operativo)*

| | |
|---|---|
| **Buscamos** | quien **mueva vidrio plano y arte** de verdad: empaque técnico (A-frame, crating), carga pesada, última milla especializada. |
| **Señal de alto valor** | **capacidad propia**: flota, depósitos, corredores declarados; cobertura de seguro para frágil/arte; operación comprobable. |
| **Descarte** | courier de paquetería general sin manejo de frágil; *brokers* que revenden sin operar; intermediarios de intermediarios. |
| **Canal** | correo corporativo publicado (el más frecuente) o formulario. |

> **El filtro que ahorra tiempo:** una sola pregunta antes de cargar una fila —
> **¿puede decidir o influir** en una inversión, en la arquitectura técnica o en la operación
> logística? Si la respuesta es no, no entra (o entra más adelante, como referencia).

---

## 2. Protocolo de verificación (el rigor)

Una puerta entra en la base **sólo si** cumple los cinco puntos. Si falla uno, se corrige o se descarta:

| # | Requisito | Cómo se cumple |
|---|---|---|
| 1 | **Fuente pública citada** | sitio oficial, directorio de cámara/asociación, API pública, programa de evento. Se guarda en `fuente` **y** `url`. |
| 2 | **Canal publicado por la organización** | un correo corporativo o un formulario **del sitio de la organización**. Nunca un correo personal de un individuo. |
| 3 | **Fundamento concreto** | un dato verificable (una tesis, un portfolio, una planta, un corredor, un repo). No "es importante". |
| 4 | **Rol decisor identificado** | a quién hay que llegar, por nombre o por rol. Si no se sabe: `[COMPLETAR]`. |
| 5 | **Estado honesto** | `a validar` mientras no haya contacto; `nuevo` si es una puerta recién descubierta. |

**Regla de oro:** la columna `fuente` existe para que **cualquiera pueda re-verificar** el dato.
Una fila sin fuente es una fila sin valor.

---

## 3. La base limpia

### 3.1 Archivos

| Archivo | Estado | Qué es |
|---|---|---|
| [`scouting/puertas.template.csv`](./scouting/puertas.template.csv) | **versionado** | plantilla documentada con columnas y ejemplos marcados `EJEMPLO` |
| `scouting/puertas.csv` | **local** (ignorado) | **la base de trabajo**: una fila por puerta investigada |
| `scouting/puertas-curadas.csv` | **local** (ignorado) | salida limpia: sólo filas válidas, ordenadas para contacto selectivo |
| `scouting/GWS_Scouting_Informe.md` | **local** (ignorado) | informe de la corrida (resumen, válidas, rechazadas y motivo) |

Los tres archivos locales contienen datos de terceros: **nunca se versionan**.

### 3.2 Columnas

| Columna | Qué poner |
|---|---|
| `eje` | `inversores` \| `desarrolladores` \| `logistica` |
| `perfil` | sub-perfil del eje (`fondo`, `angel`, `industrial`, `mecenas`, `arquitecto`, `multiagente`, `b2b`, `fullstack`, `seguridad`, `datos`, `forwarder`, `naviera`, `courier`, `arte_fragil`, `empaque_crating`, `seguro_carga`, `carga_pesada`) |
| `organizacion` | nombre real de la puerta |
| `ambito` | país / cobertura / especialidad |
| `rol_decisor` | a quién hay que llegar (o `[COMPLETAR]`) |
| `fundamento` | **por qué es de alto valor**, con el dato concreto |
| `fuente` | la fuente pública consultada |
| `url` | URL pública de esa fuente |
| `canal` | `email_corporativo` \| `formulario` \| `perfil_publico` \| `red_calida` \| `evento` \| `presencial` |
| `email_contacto` | sólo correo **corporativo** publicado (o `[COMPLETAR]`) |
| `prioridad` | `1` \| `2` \| `3` (si se omite, se deriva del eje) |
| `estado` | `nuevo` \| `a validar` \| `contactado` \| `respondio` \| `baja` \| `archivado` |
| `notas` | lo que haga falta para el próximo paso |

### 3.3 Cómo se opera

```powershell
# 1) Crear la base de trabajo (sólo encabezado; no sobrescribe)
node tools/outreach/scout-curate.mjs --init

# 2) Investigar y cargar a mano una fila por puerta en scouting/puertas.csv

# 3) Curar: valida, deduplica y emite la base limpia
node tools/outreach/scout-curate.mjs

# 4) Informe legible de la corrida
node tools/outreach/scout-curate.mjs --report
```

El curador **no inventa ni completa nada**: valida y descarta con motivo auditable. Comprueba:

- columnas obligatorias y valores permitidos (`eje`, `perfil`, `canal`, `estado`, `prioridad`);
- fuente y URL presentes y en `http(s)`;
- fundamento no vacío y con sustancia;
- email bien formado y **no de proveedor gratuito** (política: sólo canal corporativo);
- coherencia `canal = email_corporativo` ⇔ hay dirección;
- **duplicados**: dentro de la base, contra las bases existentes (`logistica_aliados.csv`,
  `prospects.csv`, `prospects_devs.csv`, `agencias_tech.csv`, `github-tanda*`) y **contra el registro
  de envíos** (nadie que ya recibió un toque vuelve a entrar como puerta nueva);
- filas de `EJEMPLO` de la plantilla (se rechazan: no son puertas reales).

La salida ordena por **eje (1º inversores › 2º desarrolladores › 3º logística)**, luego prioridad y
luego por canal más directo: primero **correo corporativo**, después red cálida, después formulario.
Eso es la "lista selectiva".

---

## 4. Ritmo del fin de semana (pausa institucional)

La investigación sí, el envío no. Bloques cortos y con cierre:

| Bloque | Objetivo | Criterio de cierre |
|---|---|---|
| A | Logística de carga pesada/frágil (alta prioridad) | N puertas verificadas con canal publicado |
| B | Inversores y mecenas con tesis tecnológica/industrial | N puertas con tesis explícita citada |
| C | Arquitectos de ecosistemas digitales | N perfiles con obra pública verificable |

Al cerrar cada bloque: cargar las filas y **correr el curador**. Cerrar el día con
`node tools/outreach/scout-curate.mjs --report` y el registro de seguimiento local al resguardo
(ver §5).

> **Durante la pausa no se envía.** El envío automático está bloqueado por
> `GWS_Modo_Operativo.md`; el sistema queda en **modo consulta e investigación pasiva**.

---

## 5. Resguardo local de los registros

Los registros viven **fuera de git** por contener datos de terceros y se respaldan localmente:

| Registro | Ruta |
|---|---|
| Envíos | `docs/logistica/send-log.jsonl` |
| Respuestas / bajas / rebotes | `docs/logistica/respuestas.jsonl` |
| Seguimiento generado | `docs/logistica/seguimiento.md` |
| Base de puertas | `docs/outreach/scouting/puertas.csv` |
| Base limpia | `docs/outreach/scouting/puertas-curadas.csv` |
| Informe de scouting | `docs/outreach/scouting/GWS_Scouting_Informe.md` |

Respaldo (fuera del repo, sin secretos ni datos versionados):

```powershell
$dst = "$env:LOCALAPPDATA\gws-tools\backups\$(Get-Date -Format yyyy-MM-dd_HHmm)"
New-Item -ItemType Directory -Force $dst | Out-Null
Copy-Item docs/logistica/send-log.jsonl, docs/logistica/respuestas.jsonl, docs/logistica/seguimiento.md $dst -ErrorAction SilentlyContinue
Copy-Item docs/outreach/scouting/* $dst -ErrorAction SilentlyContinue
```

---

## 6. Fuentes que están y no están disponibles

**Disponibles (abiertas, ya usadas con resultado):** sitios oficiales de las organizaciones,
directorios y comisiones de cámaras y asociaciones del vidrio y la manufactura, programas de
eventos/ferias, y la **API pública de GitHub** para el eje técnico.

**Bloqueadas (no se insiste):** Crunchbase, PitchBook, Dealroom, AngelList/Wellfound, f6s — requieren
cuenta o plan pago y prohíben la extracción.

**Consecuencia honesta:** no existe una vía legítima para extraer **correos personales de inversores a
escala**. La ruta correcta sigue siendo la **introducción cálida** o el **canal corporativo**.

---

## 7. Qué NO hacer

1. **No scrapear** ni automatizar cuentas de terceros. Ni una vez.
2. **No cargar sin fuente ni sin fundamento.** Preferí 20 buenas a 200 genéricas.
3. **No completar huecos con suposiciones.** `[COMPLETAR]` es una respuesta válida y honesta.
4. **No reenviar** a quien ya está en el registro de envíos: el curador lo bloquea.
5. **No prometer** tracción, usuarios, ingresos ni porcentajes que GWS todavía no tiene.
6. **No enviar** mientras el modo operativo esté en `reposo`.

---

## En una frase

Dejamos de escalar el volumen y volvemos a **investigar a mano**: puertas reales, con fuente citada,
fundamento concreto y canal corporativo — **pocas y buenas**, listas para golpear de forma selectiva
cuando corresponda.
