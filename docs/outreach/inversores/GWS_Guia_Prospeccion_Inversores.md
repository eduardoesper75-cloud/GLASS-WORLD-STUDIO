# Guía de Prospección — Flecha 1 (Inversores / Alianza estratégica)

> Cómo pasar de **cero contactos** a los **primeros borradores listos** para copiar y pegar.
> Sin automatizar LinkedIn, sin scrapear, sin bots. Humano en el bucle.
> Última actualización: 15-10-2026

El motor (`generate-drafts.mjs`) ya está listo y acepta **todo el espectro**: fondos,
ángeles e industriales. Lo único que falta es la **lista**. Esta guía explica cómo armarla.

---

## 0. El anzuelo (hook) — la tesis de mercado

> **GWS es la red de Big Data que visibiliza el ~60% del mercado del vidrio que las consultoras
> no pueden medir.** El piso registrado —vidrio plano: **USD 323.200 M (2025) → USD 450.200 M (2033)**,
> Grand View Research— es solo la **punta del iceberg**: la mayor parte del movimiento real
> (talleres, distribuidores, insumos, maquinaria usada, fletes) ocurre **fuera del radar**. GWS nace
> en el **banco del taller** y nace para **cartografiarlo y ser dueño de ese dato**.

Usá este anzuelo en el **primer párrafo** de todo copy a inversores. Detalle: Slide 2 del
[pitch deck](GWS_Pitch_Deck_Inversores.md) y `docs/outreach/GWS_B1_Fuentes_Cifras_Mercado.md`
(§4, tesis TAM/SAM/SOM).

---

## 1. El espectro: sin fronteras, pero con perfil

No acotamos la búsqueda a un solo tipo de inversor. Entra **cualquiera que pueda financiar,
co-desarrollar o respaldar** a GWS. La columna `perfil` del CSV es la que adapta el tono:

| `perfil` | Quién entra | Ejemplos de rol |
|---|---|---|
| `fondo` | Fondos de VC, early-stage y tesis industrial (LatAm y globales) | *Partner*, *Investment Manager*, *Analista* |
| `angel` | Inversores ángel, business angels, family offices chicas | *Business angel*, *Inversor privado* |
| `industrial` | Empresarios e industriales del rubro (vidrio, manufactura, comercio, logística) | *Director general*, *Dueño*, *Presidente* |
| *(vacío)* | Cualquiera del espectro o un contacto a clasificar | — |

**Regla:** si dudás del perfil, dejalo vacío. La variante neutra sirve para todos.

---

## 2. De dónde salen los contactos (fuentes conformes)

> ⚠️ **Nunca** scrapees LinkedIn, ni uses extensiones de extracción, ni compres bases de datos.
> Además de violar el Acuerdo de Usuario, esos datos suelen ser basura y queman el dominio.
> La lista se arma **a mano**, con criterio. Es más lenta y mucho más efectiva.

### 2.1 Red cálida (empezá acá — mejor tasa de respuesta)
- Tus contactos de 1.º y 2.º grado que inviertan o conozcan industriales del rubro.
- Pedí **referidos**: a quien diga "no es mi foco", pedile un nombre con esa tesis.
- La comunidad que validó GWS en la primera etapa: ahí hay respaldo y contactos.

### 2.2 Fuentes públicas de descubrimiento (para investigar a mano)
- **Directorios de VC LatAm:** LAVCA, listados de fondos por país, portfolios públicos.
- **Crunchbase / AngelList / Dealroom:** búsqueda manual por tesis ("industrial",
  "marketplace", "B2B infra", "manufacturing") para *descubrir* nombres, no para exportar.
- **Cámaras y asociaciones del vidrio y la manufactura:** Cámara del Vidrio, cámaras
  industriales provinciales, cámaras de comercio. Sus directorios y comisiones directivas
  son una mina de perfiles `industrial`.
- **Eventos, expos y ferias del sector:** quién diserta, quién auspicia, quién va.
- **Aceleradoras e incubadoras** con tesis industrial o *impact*.

### 2.3 El filtro que ahorra tiempo
Antes de cargar a alguien, una sola pregunta: **¿puede decidir o influir en una inversión,
o en el desarrollo técnico?** Si la respuesta es no, no entra (o entra en otro momento).

---

## 3. Cómo cargar la lista (`prospects.csv`)

Partí de la plantilla y completá **una fila por persona**:

```powershell
Copy-Item docs/outreach/linkedin/prospects.template.csv docs/outreach/linkedin/prospects.csv
```

Columnas:

| Columna | Qué poner | Ejemplo |
|---|---|---|
| `flecha` | Siempre `inversores` | `inversores` |
| `perfil` | `fondo` \| `angel` \| `industrial` (o vacío) | `industrial` |
| `name` | Nombre completo | `Carlos Gómez` |
| `company` | Fondo / empresa (si es ángel sin fondo, vacío) | `Vidriería del Norte S.A.` |
| `role` | Cargo real, leído de su perfil | `Director general` |
| `linkedin_url` | URL del perfil | `https://www.linkedin.com/in/...` |
| `hook` | **Un dato real y breve**, sin el conector | `vidrio templado y expansión` |
| `estado` | Sólo para tu seguimiento: `nuevo`, `invitado`, `aceptado`, `respondio`, `archivado` | `invitado` |

> **Acepta alias en español** (`nombre`, `empresa`, `cargo`, `url`, `gancho`, `status`): pegá la
> lista como la tengas, el motor la entiende igual.

**El `hook` es el 80% del resultado.** Antes de escribir la fila, leé su perfil 30 segundos y
elegí **un** detalle concreto: una tesis, un portfolio, un post reciente, una planta, un rubro.
Sin `hook`, el mensaje suena a spam. Con `hook`, suena a alguien que hizo la tarea.

> `prospects.csv` está **ignorado por git** (son datos personales). Nunca lo subas.

---

## 4. Cómo generar los borradores

```powershell
node docs/outreach/linkedin/generate-drafts.mjs
#   -> escribe docs/outreach/linkedin/drafts.md
```

Abrí `drafts.md`: por cada persona tenés **nota de invitación**, **apertura**, **Paso 2** y
**Paso 3**, ya personalizados y con el registro correcto según el `perfil`. Copiá y pegá a
mano, de a uno, y registrá el avance en `prospects.csv`.

**Recordá las reglas:** máximo **3 toques** por persona, ritmo humano (1 cada 3–7 días),
nunca dos el mismo día.

---

## 5. El primer lote (arranque sugerido)

Un primer lote realista y sano, para no quemar la cuenta ni la paciencia:

| Origen | Cuántos | Por qué |
|---|---|---|
| Red cálida y referidos | 8–12 | Mejor tasa de respuesta, validan el tono. |
| Industriales del rubro (cámaras, eventos) | 8–10 | Diferenciador: entienden el problema desde adentro. |
| Fondos con tesis industrial / B2B | 5–8 | Alto valor si enganchan. |

**Total: ~25–30 contactos.** Empezá por los de `hook` más fuerte. Ajustá el copy según lo
que funcione en las primeras 5 conversaciones, y recién después escalá el volumen.

---

## 6. Qué NO hacer

1. **No scrapear** ni usar extensiones/bots. Ni una vez.
2. **No cargar sin `hook`.** Preferí 20 buenos a 200 genéricos.
3. **No poner los mismos 3 toques a todos** sin leer la respuesta.
4. **No prometer** tracción, usuarios ni ingresos que GWS todavía no tiene.
5. **No imprimir un porcentaje** de participación en el primer contacto: eso se pacta en la charla.

---

## En una frase

El motor ya está listo. Lo único que falta es tu lista: **investigá a mano, clasificá por
`perfil`, escribí un `hook` real por persona y generá los borradores**. Empezá con 25–30.
