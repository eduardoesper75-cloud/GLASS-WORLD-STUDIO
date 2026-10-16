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

### Línea 2 — Talento técnico (13 perfiles reales)

Archivo de trabajo: `docs/outreach/desarrolladores/prospects_devs.csv` · borradores en
`docs/outreach/desarrolladores/drafts_devs.md` (ambos ignorados por git).

- Se cosecharon **30 perfiles reales** de la API de GitHub; se filtraron a **13** con stack afín
  (multi-agente/IA, full-stack, B2B/marketplace).
- Datos **verificables**: cada fila cita el perfil público de GitHub como fuente.
- **Emails:** ninguno personal (no se inventaron; GitHub devolvió `null` en casi todos).

| Sub-perfil | Cantidad | Ejemplos |
|---|---|---|
| `multiagente` | 3 | Facundo Uferer · Juan Olié (Marvik AI) · Gustavo Juantorena (PhD) |
| `fullstack` | 7 | Laura Beatris (Resend) · Ramiro Olivencia (Taller) · Cecilia Perdomo · … |
| `b2b` | 3 | Vitor Freitas (CTO Eskolare) · Avelino (CTO Buser) · Ignacio Buioli (CTO Exemax) |

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
