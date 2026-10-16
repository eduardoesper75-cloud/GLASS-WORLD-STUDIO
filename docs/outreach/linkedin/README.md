# Copiloto de outreach para LinkedIn — Glass World Studio

> **Glass World Studio (GWS) busca Alianzas Estratégicas: Inversores, Desarrolladores y Logística.**
> Orden de prioridad: 1) Inversores y capital · 2) Desarrolladores · 3) Logística (pilar operativo).

**Humano en el bucle. Cero automatización de tu cuenta. Cero riesgo de ban.**

Este kit hace el trabajo pesado *sin tocar LinkedIn*: convierte tu lista de prospectos en
**notas de invitación, mensajes de apertura y seguimientos** personalizados, listos para
**copiar y pegar a mano**. Los clics los das vos — por eso es 100% conforme al Acuerdo de
Usuario de LinkedIn.

> **Por qué no automatizamos:** el Acuerdo de Usuario de LinkedIn (§8.2) prohíbe bots y
> métodos automatizados para agregar contactos y enviar mensajes. En 2026 la fiscalización
> se endureció (restricciones masivas y bajas de vendors completos). Esta herramienta
> **no** inicia sesión, **no** usa extensiones y **no** guarda credenciales de LinkedIn.

## Contenido de la carpeta

| Archivo | Qué es |
|---|---|
| `GWS_LinkedIn_Outreach_Playbook.md` | Reglas, límites humanos prudentes y las secuencias por flecha. |
| `prospects.template.csv` | Plantilla de la hoja de prospección (copiala a `prospects.csv`). |
| `generate-drafts.mjs` | Script (Node, sin dependencias) que genera los borradores. |
| `README.md` | Este archivo. |

## Cómo se usa

```powershell
# 1) Crear tu lista a partir de la plantilla
Copy-Item prospects.template.csv prospects.csv

# 2) Completar las filas (una por prospecto). Ver columnas abajo.

# 3) Generar los borradores
node docs/outreach/linkedin/generate-drafts.mjs
#   -> escribe docs/outreach/linkedin/drafts.md
```

Abrí `drafts.md`, copiá y pegá cada bloque en LinkedIn, y registrá el avance en
`prospects.csv`. `prospects.csv` y `drafts.md` están ignorados por git (datos personales).

## Columnas de `prospects.csv`

| Columna | Descripción | Ejemplo |
|---|---|---|
| `flecha` | `inversores` \| `desarrolladores` \| `logistica` \| `generico` | `inversores` |
| `perfil` | **Sub-perfil** dentro de una flecha (ver abajo). Vacío = variante neutra. | `angel` |
| `name` | Nombre completo | `María López` |
| `company` | Empresa / fondo | `Norte Ventures` |
| `role` | Cargo | `Socia` |
| `linkedin_url` | URL del perfil | `https://www.linkedin.com/in/...` |
| `hook` | Detalle real y breve para personalizar, **sin el conector** (opcional pero **muy** recomendado) | `marketplaces B2B` |
| `estado` | Sólo para tu seguimiento (`nuevo`, `invitado`, `aceptado`, `respondio`, `archivado`). El motor no lo usa. | `invitado` |

> **Acepta alias en español.** Si tu lista viene con `nombre`, `empresa`, `cargo`, `url`,
> `gancho` o `status`, el motor los entiende igual. Podés pegar la lista como la tengas.

> **La personalización manda.** Un `hook` concreto (un post que leíste, un dato real)
> multiplica la tasa de aceptación y reduce el riesgo. Sin hook, el mensaje suena genérico.

### Sub-perfiles de la flecha `inversores`

El espectro de inversores es **amplio y sin fronteras**. La columna `perfil` adapta el registro
de la secuencia a quién tenés enfrente, sin cambiar el mensaje de fondo:

| `perfil` | Para quién | Registro |
|---|---|---|
| `fondo` | Fondos de VC / early-stage / tesis industrial | Institucional («la tesis de…», «les dejo») |
| `angel` | Inversores ángel | Cercano y directo («tu recorrido», «te dejo») |
| `industrial` | Empresarios e industriales del rubro | Respetuoso («usted conoce el rubro», «le dejo») |
| *(vacío)* | Cualquiera del espectro | Neutro; sirve para todos |

### Sub-perfiles de la flecha `desarrolladores`

| `perfil` | Para quién | Registro |
|---|---|---|
| `fullstack` | Full-stack / producto | De punta a punta; el rol se adapta |
| `b2b` | Backend / marketplaces B2B | Transaccional (licitaciones, matching, pagos) |
| `multiagente` | Arquitectos de IA / MCP | Enjambre de agentes y satélites |
| *(vacío)* | Cualquier dev | Neutro |

