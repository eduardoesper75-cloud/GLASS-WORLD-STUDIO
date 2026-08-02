# Estándar UX · Tres Clics y Multimedia Industrial (Glass World Studio)

> Orden Suprema (2026-08-02): "cualquier operación crítica debe resolverse en
> un máximo de 3 clics", "visores de video de alta inmersión" y "sincronización
> con YouTube y repositorios externos". Este documento fija el estándar y
> cómo se reconcilia con la gobernanza de CLAUDE.md.

---

## 1. Dogma reconciliado: "≤3 clics" como directriz, no como métrica

CLAUDE.md §2 rechaza explícitamente la regla de los "3 clics" por ser un mito
de UX sin sustento empírico, y ordena usar como KPI: **tiempo hasta completar
la acción** + **que cada paso reduzca ambigüedad respecto del anterior**.

La Orden Suprema no se anula, se interpreta sobre la regla vigente:

- **`clickBudget = 3`** es una **directriz de navegación superficial**: prohibe
  menús anidados infinitos y obliga a que la jerarquía visual guíe la mano.
  Ningún flujo crítico se diseña con más de 3 niveles.
- **El KPI de verificación sigue siendo el de §2**: tiempo + reducción de
  ambigüedad por paso. El manifiesto audita AMBAS cosas: cada paso lleva
  `reducesAmbiguity` explícito.

**Dónde vive**: `src/ux/ux.const.ts` → `GET /ux/manifest` (versionado). El
bucle de auditoría consulta este manifiesto; no audita por impresión.

## 2. Los cinco flujos críticos (≤3 clics)

| Flujo | Galaxia | Pasos | Anclaje en portada |
|---|---|---|---|
| Comprar | G2 | Elegir producto → Checkout transparente → Confirmar | `#customs-demo` |
| Suscribirse | Transversal | Elegir plan → Datos de pago → Confirmar y acceder | `#umbral` |
| Publicar obra | G1/G2 | Crear listing → Adjuntar media → Publicar | `#fundacion` |
| Ver masterclass | G1 | Elegir masterclass → Acceder al visor → Reproducir | visor `#gws-viewer` |
| Auditar máquina | G5 | Seleccionar máquina → Ver demo técnica → Solicitar auditoría | visor `#gws-viewer` |

Cada paso del manifiesto documenta QUÉ ambigüedad elimina. Una auditoría que
detecta un paso que no reduce ambigüedad reporta un defecto
(`microFrictions.step_ambiguity`).

## 3. Multimedia industrial: estándar de vitrinas en video

### 3.1 Modelo de media (`src/common/media/`)

Un activo de alto valor (máquina de G5, masterclass de G1) puede llevar
**hasta 12 items** de `GwsMediaItem`:

```
{ kind, url, title?, poster?, startAt? }
```

`kind` ∈ `youtube | youtube_channel | vimeo | stream | iframe`.

El backend **resuelve** cada item antes de persistir
(`resolveGwsMediaItems` → `ResolvedGwsMediaItem`): calcula la URL de embed
reproducible (`embedUrl`) y la de origen (`externalUrl`). Lo guardado en DB
es SIEMPRE el modelo resuelto, nunca el valor crudo del cliente.

### 3.2 Allowlist soberano (defensa en profundidad de §3.6)

`media` es un campo ESTRUCTURADO de exhibición (no texto libre), pero igual
bloquea canales de contacto:

- **Permitidos**: YouTube (video/canal/live/shorts), Vimeo, Wistia, y archivos
  de video directos (`.mp4/.webm/.mov/.m3u8`) en HTTPS desde el CDN propio del
  industrial — el corte por agua de G5 no se transcodifica.
- **Bloqueados**: WhatsApp, Telegram, Instagram, Facebook, Discord, Signal,
  acortadores (bit.ly, tinyurl, goo.gl, t.co…) y `mailto:`. Un maestro puede
  enlazar su canal de YouTube pero jamás convertir la vitrina en una puerta de
  salida de la plataforma.
- **Solo HTTPS** y **máx. 12 items** por activo.

**Dos capas de validación**: `@IsGwsMediaArray()` en el DTO (mensajes
legibles) + `resolveGwsMediaOrThrow` en el service (persistir modelo resuelto).

### 3.3 Sincronización con YouTube y repositorios externos

- `youtube`: URL de video → embed `youtube-nocookie.com/embed/{id}` (privacidad
  + reproducción fluida, sin subir archivos al servidor).
- `youtube_channel`: URL de canal (`@handle`, `/channel/`, `/c/`) → botón
  "Ver en origen" en la vitrina (los canales no son embebibles).
- `vimeo` / `stream` / `iframe`: embeds directos de repositorio/CDN.

### 3.4 Frontend

`design-system/portada-umbral.html` incluye la sección **Vías rápidas**
(accesos de 3 clics) y el **visor inmersivo `#gws-viewer`** (modal 16:9, botón
único, campo de sincronización que parsea la URL con el mismo resolver del
backend). Los botones `.gws-viewer-open` abren el visor con presets de curso
(G1) y de máquina (G5).

## 4. Bucle de auditoría continua

Los agentes ejecutan en cada revisión de UX:

1. `GET /ux/manifest` → leer `principles`, `flows`, `microFrictions`.
2. Recorrer cada flujo en la UI real y verificar `clickBudget` y
   `reducesAmbiguity` por paso.
3. Verificar las micro-fricciones: sin menús anidados >3 niveles, sin
   animación sin función, datos técnicos en `--font-mono`, sin canales de
   contacto en vitrinas, sin activos de alto valor sin video demo.
4. Reportar cada hallazgo como defecto contra el id de la micro-fricción.

## 5. Pendientes

- [ ] Real frontend (Next.js) que consuma `/ux/manifest` y `media` del catálogo.
- [ ] Curación de 3-5 documentos seed de la Bóveda con video embed.
- [ ] Validación E2E de la migración `UXMultimediaSchema1737000000000` contra
  PostgreSQL (bloqueado por Docker caído).
