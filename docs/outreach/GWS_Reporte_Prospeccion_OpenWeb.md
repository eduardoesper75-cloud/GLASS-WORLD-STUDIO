# Reporte de Prospección Open-Web — Glass World Studio

> **Mandato:** prospección multinivel 100% **fuera de LinkedIn**, sobre fuentes web abiertas.
> **Fecha:** 16-10-2026 · **Estado:** primer barrido completado, datos en `a validar`.

---

## 0. Restricciones cumplidas

- ✅ **LinkedIn omitido al 100%.** Ningún dato proviene de LinkedIn, ni de scraping, ni de extensiones.
- ✅ **Fuentes abiertas** únicamente (sitios oficiales, directorios públicos, API pública de GitHub).
- ✅ **Cero datos inventados.** Donde no hubo dato verificable, dice `[COMPLETAR]`.
- ✅ **Sin emails personales cosechados.** Sólo contacto **corporativo** publicado en el sitio de la organización.
- ⚠️ **Estado de todo: `a validar`.** No hay acuerdos con nadie.

---

## 1. Cómo se hizo

Se intentó un esquema de **3 sub-agentes en paralelo** (inversores / devs / logística). Las sesiones
de los sub-agentes se corrompieron y no escribieron datos confiables, así que **el barrido se hizo
directamente** por este agente, con control total de la fuente de cada dato y sin riesgo de
fabricación. Mejor eso que 40 filas inventadas.

Herramientas reales usadas: búsqueda web abierta + lectura de páginas oficiales + **API pública de
GitHub** (shell con red, `api.github.com` sin autenticar).

---

## 2. Resultados por línea

### Línea 1 — Inversores e industria (17 organizaciones)

Archivo de trabajo: `docs/outreach/linkedin/prospects.csv` (ignorado por git).

| Perfil | Cantidad | Ejemplos reales |
|---|---|---|
| `fondo` | 5 | Alaya Capital Partners · Kibo Ventures · Caixa Capital Risc · Fondo de Fondos · 54 Ventures |
| `angel` | 4 | Red Sudamericana de Inversiones · Business Angels Club · IESE BAN · AEBAN |
| `industrial` | 8 | ANFEVI · CAVIPLAN · CAFAVI · AMEVEC · Vidrala · Verallia · Rigolleau · Envases del Sur |

**Realidad importante:** casi **todas las filas son a nivel organización**, no de persona. En
fuentes abiertas rara vez hay un contacto nominal de un fondo. Por eso el CSV trae la organización,
su sitio y su canal público; **la persona la agregás vos** (introducción cálida o el formulario del
sitio). Los borradores de esta línea son plantilla: reemplazá el saludo por tu contacto.

### Línea 2 — Talento técnico (38 perfiles reales: 13 Fase 1 + 25 Fase 2)

Archivo de trabajo: `docs/outreach/desarrolladores/prospects_devs.csv` · borradores en
`docs/outreach/desarrolladores/drafts_devs.md` y envíos en `GWS_Envio_Devs.md` (ignorados por git).

- **Fase 1:** 30 perfiles cosechados de la API de GitHub, filtrados a **13** con stack afín.
- **Fase 2:** 39 candidatos nuevos, curados a **25** (marketplace/B2B, Next.js/React/TS y
  arquitectos/microservicios).
- Datos **verificables**: cada fila cita el perfil público de GitHub como fuente.
- **Emails:** ninguno personal (no se inventaron; GitHub no los expone). Canal = perfil público.

| Sub-perfil | Cantidad | Ejemplos |
|---|---|---|
| `multiagente` | 3 | Facundo Uferer · Juan Olié (Marvik AI) · Gustavo Juantorena (PhD) |
| `fullstack` | 15 | Laura Beatris (Resend) · Cristiano Feitosa (Accenture) · Cecilia Perdomo · … |
| `b2b` | 8 | Vitor Freitas · Avelino (Buser) · Ignacio Buioli · Ikdemm (marketplace) · … |
| `arquitecto` | 12 | Ahsan Ayaz (Scania) · Andres Chavez (Citibank) · Ralf Biedert (Microsoft) · … |

### Línea 3 — Logística y cadena de suministro (28 organizaciones, 7 categorías)

Archivo de trabajo: `docs/logistica/logistica_aliados.csv` (ignorado por git).

| Categoría | Cantidad | Ejemplos reales |
|---|---|---|
| `forwarder` | 8 | Oceanic · BAIFF · Transaltic · Atlantic/Transmodal (Rosario) · Geodis · Kuehne+Nagel |
| `naviera` | 2 | Maersk · ONE |
| `courier` | 3 | DHL Express · FedEx · UPS |
| `arte_fragil` | 6 | Universal Cargo AR · ESI Fine Art · XPO Art · Masterpiece · EMO Trans · Movart |
| `empaque_crating` | 4 | PalletCo (AR) · Integral Project (CL) · Embamat (ES) · Lumber & Pallets |
| `seguro_carga` | 5 | Zurich AR · MAPFRE CL · Chubb CL · ADS Group · International Cargo (AR) |

---

## 3. Fuentes utilizadas (muestra)

- **Gremios del vidrio:** anfevi.com · caviplan.org.ar · amevec.mx · guiadelpackaging.com.ar · vidrioperfil.com · ceoe.es
- **Fondos / ángeles:** alaya-capital.com · kiboventures.com · criteriacaixa.com · fdf.mx · angelesinversionistas.com · businessangelsclub.org · iese.edu · aeban.es · privateequitylist.com · cdti.es
- **Logística:** oceanicinternationaltrade.com · freightforwarderservices.com · speedargentina.ar · fiata.org · kuehne-nagel.com · maersk.com · one-line.com · zurich.com.ar · mapfre.cl · chubb.com · group-esi.com · emotrans-global.com · masterpieceintl.com
- **Talento:** `api.github.com` (endpoints públicos de búsqueda y perfil).

---

## 4. Fuentes BLOQUEADAS (no se pudo extraer, y no se inventó)

| Fuente | Motivo |
|---|---|
| **Crunchbase** | Requiere cuenta / plan pago; prohíbe scraping. |
| **PitchBook** | Ídem (pago). |
| **AngelList / Wellfound** | Login obligatorio. |
| **f6s** | Datos tras registro. |
| **Dealroom** | Plan pago. |
| **Bases de datos de emails** ("verified work emails") | Suelen provenir de scraping y violan GDPR/CCPA. Descartadas por política. |

**Consecuencia:** no existe una vía legítima para extraer emails personales de inversores a escala.
La ruta correcta sigue siendo **introducción cálida** o el **canal corporativo**.

---

## 5. Guardarraíles aplicados

1. **Nunca** se inventó un nombre, un email ni un teléfono.
2. Sólo se registró un email si está **publicado** en el sitio de la organización.
3. Ningún email **personal** de individuo fue cosechado (el requisito GDPR del proyecto lo prohíbe).
4. Todo dato sin verificar quedó como `[COMPLETAR]`.
5. La columna `fuente` de cada fila permite **re-verificar** el dato.

---

## 6. Limitaciones y próximos pasos

**Limitaciones reales:**
- Los datos de inversores son **organizacionales**; falta identificar a la persona.
- Límite de tasa de GitHub (~60/hora): hay más perfiles disponibles, se cortó a 30.
- **No se envió nada.** El envío automático está bloqueado (credenciales vacías) y, por política,
  el outreach es **humano**.

**Próximos pasos sugeridos:**
1. **Enriquecer inversores**: buscar el socio/analista específico por fondo (fuentes abiertas) y
   reemplazar el saludo en los borradores.
2. **Profundizar devs**: ampliar la cosecha de GitHub con más queries y topics.
3. **Validar logística**: contactar 2–3 operadores por categoría y mover cada fila de `a validar` a
   `contactado`.
4. **Enviar a mano** los borradores de devs (ya son individuos reales) respetando el ritmo humano.

> Regla que no se rompe: **es mejor poco dato real que mucho dato inventado.**

---

## 7. Fase 2 — profundización y contacto directo (16-10-2026)

### 7.1 Devs — segunda tanda (GitHub)
- 6 consultas a la API de búsqueda de GitHub → **39 candidatos** → enriquecidos leyendo su
  **perfil público** → curados a **25**. Total de la línea: **38**.
- Nuevo sub-perfil **`arquitecto`** sumado al motor (APIs, microservicios, diseño de sistemas).
- **Envíos listos** para manual: `docs/outreach/desarrolladores/GWS_Envio_Devs.md`, cada uno con el
  marco del Manifiesto y la firma obligatoria de 4 canales (`edu.esper@glassworldstudio.com.ar` · `eduardoesper75@gmail.com` · `+54 9 385 622-8400` · `https://www.glassworldstudio.com.ar`).
- Generador de envíos: `docs/outreach/desarrolladores/generate-envios.mjs`.

### 7.2 Inversores e industria — canal institucional
- Se leyó el **sitio oficial** de cada organización y se extrajo el **correo general** publicado.
- Nuevos correos reales: `info@alaya-capital.com` · `admin@angelesinversionistas.com` ·
  `businessangels@iese.edu` · `caviplan@caviplan.org.ar` · `marketing@vidrala.com` ·
  `info@adduntia.com`.
- Sin correo general público (solo formulario, o TLS inválido): Kibo · Caixa · Fondo de Fondos ·
  54 Ventures · Business Angels Club · AEBAN · Verallia · CAFAVI · Rigolleau · MdF → `[COMPLETAR]`.
- **Carta corporativa** de convocatoria creada:
  `docs/outreach/inversores/GWS_Carta_Convocatoria_Institucional.md` (con tabla de rutas).

### 7.3 Logística — priorización
- Las 28 organizaciones se clasificaron en **6 niveles de prioridad** (columna `prioridad` del CSV).
- **Prioridad 1 (arte frágil, 6)** y **Prioridad 2 (empaque/crating, 4)** al frente.
- Nuevos correos: `info@universalcargo.com.ar` · `sales@masterpieceintl.com` ·
  `info@palletco.com.ar` · `contacto@integralproject.cl` · `info@embamat.com` ·
  `contacto@lumberandpallets.com`.
- Documento: `docs/logistica/GWS_Priorizacion_Logistica.md`.

### 7.4 Límites de la Fase 2
- El **core de la API de GitHub** quedó agotado (~60/hora); se usó el endpoint de búsqueda (10/min)
  y la lectura de perfiles públicos.
- Varios sitios institucionales no respondieron (TLS inválido) o sólo ofrecen formulario.
- **Sigue sin enviarse nada:** el envío es humano y las credenciales del buzón están pendientes.

---

## 8. Fase 3 — cartas institucionales y tanda 3 de devs (16-10-2026)

### 8.1 Correos institucionales listos
- Generados desde la carta con el generador `generate-correos-institucionales.mjs`.
- **10 correos** con firma oficial al pie, para las organizaciones con **correo real**:
  Alaya · Red Sudamericana (Angeles Inversionistas) · IESE BAN · ANFEVI · CAVIPLAN · AMEVEC ·
  Vidrala · Envases del Sur · Family Capital · Adduntia.
- Salida: `docs/outreach/inversores/GWS_Correos_Institucionales.md`.
- 10 organizaciones sin correo directo → pasan a formulario web.

### 8.2 Manifiesto condensado para formularios
- `docs/outreach/inversores/GWS_Manifiesto_Condensado_Formulario.md`: versión A (~750 car.),
  versión B micro (~330 car.), firma y tabla de entidades secundarias con su canal.

### 8.3 Tanda 3 de devs (GitHub)
- Script reusable: `docs/outreach/desarrolladores/harvest-github.mjs` (búsqueda + perfil público,
  sin gastar el core).
- **Ejecutado:** 8 consultas → **39 candidatos** → enriquecidos → **28 curados**.
- **Pool total de la línea: 66 devs** — `arquitecto` 25 · `fullstack` 21 · `b2b` 15 · `multiagente` 5.
- Envíos actualizados: `docs/outreach/desarrolladores/GWS_Envio_Devs.md` (66 envíos).
- Candidatos crudos (para revisar): `docs/outreach/desarrolladores/github-tanda3.csv` (ignorado por git).

## 9. Logística — cierre de la vertical (16-10-2026)
- Generador `generate-correos-logistica.mjs` generalizado: acepta prioridades por parámetro.
- **4 sets de correo** con firma oficial al pie:
  - `GWS_Correos_Logistica.md` — prioridades **1-2** (arte frágil + empaque/crating): 10 correos.
  - `GWS_Correos_Forwarders.md` — prioridad **3**: 8 correos.
  - `GWS_Correos_Logistica_Cierre.md` — prioridades **4-6** (navieras, courier, seguro): 10 correos.
  - `GWS_Manifiesto_Condensado_Logistica.md` — notas para los formularios.
- **Prioridades alineadas** al esquema oficial: arte frágil 1 · crating 2 · forwarders 3 ·
  navieras 4 · courier 5 · seguro 6.
- **28 organismos** con pieza lista. Índice: `GWS_Priorizacion_Logistica.md`.

## 10. Fase 6 — tanda 4 de devs (16-10-2026)
- Consultas enfocadas en: arquitectos de microservicios/sistemas distribuidos, fullstack
  Next.js/TypeScript/React con e-commerce B2B, y especialistas en seguridad y bases de datos.
- **Ejecutado:** 8 consultas → **55 candidatos** → enriquecidos → **32 curados**
  (crudos en `github-tanda4.csv`, revisión en `github-tanda4-curados.csv`; ignorados por git).
- Nuevos sub-perfiles: `seguridad` y `datos` (agregados a `generate-envios.mjs`).
- **Pool total de la línea: 98 devs** — `arquitecto` 40 · `fullstack` 25 · `b2b` 17 ·
  `seguridad` 8 · `multiagente` 7 · `datos` 1.
- Envíos regenerados: `docs/outreach/desarrolladores/GWS_Envio_Devs.md` (**98 envíos**).

## 11. Fase 7 — tanda 4 de inversores e industria (16-10-2026)
- Enfoque: **family offices** y **fondos con tesis Industrial / DeepTech / B2B marketplace**,
  más **cámaras e instituciones del vidrio y los materiales**. Fuentes **100 % abiertas**.
- **Ejecutado:** búsqueda + verificación en sitios oficiales → **15 nuevos organismos**.
- **8 con correo directo** (Glass Alliance Europe, Glass for Europe, Glass Packaging Institute,
  Assovetro, BV Glas, ABIVIDRO, Inveready, FORUM Family Office) y **7 por formulario web**.
- **Pool de la línea: 35 organismos** (18 con correo directo). Correos: **18** en
  `docs/outreach/inversores/GWS_Correos_Institucionales.md`.
- Curaduría: `docs/outreach/inversores/GWS_Tanda4_Inversores_Industria.md`.

## 12. Fase 8 — parámetros tanda 5 de devs (definidos, 16-10-2026)
- Ejes: **MCP / protocolos agénticos**, **ingeniería de datos / BI**, **i18n / multi-región**.
- Definido en `harvest-github.mjs` (10 consultas) con salida por defecto `github-tanda5.csv`.
- **No ejecutada todavía** (el pool se mantiene en **98** hasta correrla y curarla).

## 13. Resumen consolidado del pool de prospección (16-10-2026)

| Línea | Universo | Con canal directo | Archivo de envíos |
|---|---|---|---|
| **Desarrolladores / Arquitectos / Especialistas Tech** | **98** | 98 (GitHub) | `desarrolladores/GWS_Envio_Devs.md` |
| **Operadores logísticos e infraestructura** | **28** | 18 por correo · 10 por formulario | `logistica/GWS_Correos_*.md` |
| **Inversores e industria (Tanda 4 curada)** | **+15** (pool 35) | 18 de 35 por correo | `inversores/GWS_Correos_Institucionales.md` |

**Totales con pieza de contacto lista:** 98 devs + 28 logísticos + 18 institucionales = **144 envíos**
(+ formularios de las tres líneas).

Pendientes técnicos: `docs/outreach/GWS_Checklist_Salida_Operativa.md`
(password de aplicación de Google + redeploy del sitio).
