# Gap Analysis — Esquema de BD vs. Modelo de Negocio (CLAUDE.md)

> **Autor**: agente `architect` (GWS) · **Fecha**: 2026-09-18
> **Fuente 1**: listado real de 30 tablas en `gws_dev` (PostgreSQL 16.15, 15/15 migraciones aplicadas).
> **Fuente 2**: `CLAUDE.md` (modelo de negocio) + inspección de entidades en `src/`.
> **Alcance**: solo análisis. No se crearon tablas ni se modificó código/BD.

---

## 1. Resumen ejecutivo

De las 6 Galaxias, G2, G1, G6 y G3 tienen cobertura **parcial** con entidades reales; G4 y G5 están correctamente reservadas (sin tablas) conforme a la regla de alcance; y el Satélite de Licitación y el Radar de Oferta/Demanda solo existen a nivel conceptual/visual, sin esquema. La brecha más grave no es de ninguna Galaxia en particular sino **transversal**: no hay ninguna entidad de orden/compra (checkout), por lo que `escrow_holds.orderRef`, `product_reviews.verifiedPurchase` y la aplicación de `commission_rules` quedan sin ancla transaccional. También falta la **geolocalización del usuario comprador** (la tabla `users` no tiene país/región), sin la cual el Radar de Proximidad de G2 no puede funcionar con datos reales. Los sistemas transversales económicos (escrow, comisiones, aduanas, carteleras, búnker, fundación) están bien modelados como "intención de cobro", dejando el movimiento de fondos al `Payment_Vault` externo, tal como exige CLAUDE.md §3.1.

---

## 2. Cobertura por Galaxia / sistema transversal

### G1 · Íconos Maestros y Vanguardistas del Vidrio — **Parcial**

| Cobertura hoy | Estado | Gap específico |
|---|---|---|
| `g1_masters` (perfil 1:1 con User, tier, verificación, specialties JSONB) | Cubierto | — |
| `g1_master_catalog_items` (itemType: course, workshop, book, author_tool_line, author_material_line; `details` JSONB por rubro) | Parcial | El catálogo modela la **venta** del ítem (precio, duración, syllabusUrl, ISBN…) pero no la **entrega**: no hay tablas de cupos/enrolamiento ni de contenidos (módulos/lecciones). El syllabus es una URL, no contenido estructurado. |
| Compra de los ítems del maestro | Sin cubrir | No hay órdenes/checkout (ver gap transversal P0-01). Un alumno no puede "comprar" un curso de forma persistente. |

### G2 · Marketplace General — **Parcial**

| Tablas | Estado | Gap |
|---|---|---|
| `products` (COE/fusión tipadas + `technicalSpecs` JSONB, `sellerCountryCode`), `product_variants`, `product_categories` (árbol auto-referenciado), `product_reviews` (UNIQUE buyer+product), `production_batches` (lote + inventario industrial) | Cubierto | — |
| Checkout / carrito / órdenes | Sin cubrir | No existen tablas `orders`/`order_items`/`cart`. `product_reviews.verifiedPurchase` lo setea "el checkout" (comment en la entidad) pero ese proceso no existe. `SourcingEngineService` está referenciado en comentarios de `product.entity.ts` pero no existe clase. |
| Radar de proximidad regional | Parcial | `ProximityRadarService` agrupa **en memoria** por `sellerCountryCode` + mapa estático `region-map.const.ts` (sin geo-query SQL). El país del **comprador** se pasa como parámetro: no se persiste en `users` (ver P0-02). Volúmenes chicos hoy, pero no escala ni alimenta un histórico. |

### G3 · Comunidad — **Parcial (bajo cubrimiento)**

| Tablas | Estado | Gap |
|---|---|---|
| `chat_messages` (channelId string `'general'`, `containsContactInfo`, `hiddenByModeration`) | Parcial | El chat es un canal único con `channelId` como string **sin entidad `Channel`** (canales temáticos/privados según comentario de la entidad quedan para cuando el requisito exista). |
| Publicaciones, debates, networking (CLAUDE.md tabla G3) | Sin cubrir | **No hay tablas de posts/hilos/comentarios/reacciones.** El networking de la comunidad no se puede modelar ni moderar. |
| Anti-leak (§3.6) | Cubierto | `src/community/anti-leak/contact-leak-filter.ts` bloquea en servidor y audita como `chat_contact_leak_blocked`. Aplica solo al chat; CLAUDE.md prevé extender a listings de G2 y biografías de G1 (hoy no cubierto). |

### G4 · Borosilicato y Envases — **Reservado (correcto)**

| Tablas | Estado | Gap |
|---|---|---|
| Ninguna | Reservado | Correcto según regla de alcance. No construir en profundidad sin contenido real. Dato menor: `ad_billboards.galaxy` distingue g4, pero no hay más. |

### G5 · Gran Industria — **Reservado (correcto)**

| Tablas | Estado | Gap |
|---|---|---|
| Ninguna | Reservado | Correcto. Solo presencia indirecta: categoría `heavy_machinery` en `escrow_holds` (liberación 10d) y el campo `media` de `products` menciona "demo de máquina pesada de G5". No materializar entidades hasta tener oferta real. |

### G6 · Ingeniería y Oficio — **Parcial**

| Tablas | Estado | Gap |
|---|---|---|
| `g6_tech_sheets` (ficha técnica autocompletada/manual, specs JSONB, FK optional a `products`), `g6_tech_sheet_templates` (catálogo conductor) | Cubierto | — |
| `vault_categories` (árbol ltree por código) + `vault_documents` (dedup sha256, safe-harbor, flujo draft→published) | Cubierto | La Bóveda de Conocimiento (base RAG futura) está bien modelada. `authorId` es string sin FK (ver integridad). |
| Wizard de horno, curvas de recocido, normativas MSDS | Parcial | No hay tablas dedicadas (cálculos, curvas, MSDS). Se cubre *ad-hoc* vía `vault_documents.metadata` (claves COE/anneal) y `g6_tech_sheets`. Un espacio de cálculo que persista resultados necesita esquema propio cuando el contenido real exista. |

### Satélite de Licitación (Subastas 72hs) — **Sin cobertura**

| Tablas | Estado | Gap |
|---|---|---|
| Ninguna | Sin cubrir | Solo prototipo visual. Faltan entidades de licitación/subasta (lote, puja/bid, vencimiento 72h, resolución ganadora, integración escrow por `orderRef`). |

### Radar de Oferta/Demanda + Motor Predictivo — **Conceptual**

| Tablas | Estado | Gap |
|---|---|---|
| Ninguna (solo `region-map.const.ts` estático en código) | Conceptual | Sin schema de eventos. Faltan señales de oferta/demanda, histórico de precios y métricas agregadas que alimenten al motor. Depende de que exista el dato transaccional (órdenes). |

### Sistemas transversales

| Sistema | Tablas | Estado | Notas |
|---|---|---|---|
| Auth / RBAC | `users`, `elevated_sessions`, `audit_logs` | Cubierto | Elevación 2FA + expiración en `ElevatedSession`, log inmutable a nivel app. `audit_logs.userId` sin FK (por diseño, ver §6). |
| Suscripciones | `subscription_plans`, `user_subscriptions` | Cubierto | Tiering por galaxia; `plan` con `onDelete: SET NULL`. |
| Escrow | `escrow_holds` | Cubierto | Máquina de estados + optimistic lock (`VersionColumn`) + ventana de reclamo. `orderRef` string sin FK (ver P0-01). Movimiento de fondos delegado al Payment_Vault. |
| Comisiones | `commission_rules` | Cubierto | Tarifas por galaxy/transactionType (30/20/18%, búnker 0%). Aplicación real depende de órdenes. |
| Aduanas internacionales | `customs_hs_codes`, `customs_country_params`, `customs_freight_bands` | Cubierto | Es tarifa/aduana, **no geolocalización** (ver P0-03). |
| Carteleras | `ad_billboards`, `ad_campaigns` | Cubierto | Billing: estado + `settlementCurrency`; cobro real Payment_Vault. |
| Búnker | `bunker_specialists`, `bunker_service_requests`, `bunker_memberships` | Cubierto | USD 50/mes con 0% comisión; settlement por migración. |
| Fundación de slots | `founding_slots`, `founding_claims` | Cubierto | Límite duro transaccional (`pesimistic_write` + count). |
| Settlement / pagos | (sin tabla propia) | Parcial por diseño | `SettlementSchema` solo agrega `settlementCurrency`/`paymentMethod` a `bunker_memberships` y `ad_campaigns`; `escrow_holds` los tiene. El ledger real de pagos es el Payment_Vault externo (§3.1): correcto de acuerdo a gobernanza, pero implica que GWS no tiene trazabilidad de liquidación propia. |

---

## 3. Catálogo de gaps priorizado

Priorización alineada con la regla de alcance (G4/G5 no se construyen en profundidad sin contenido real) y con los ADR pendientes (procesador de pago, hosting, alcance geográfico).

| P | # | Gap | Galaxia(s) | Tablas/entidades que faltarían | Impacto | Justificación |
|---|---|---|---|---|---|---|
| **P0** | 01 | **Sin entidades de orden/checkout** | Transversal (G1, G2, G3 negociación, escrow, comisiones, review) | `orders`, `order_items`, estado de pago/entrega; `escrow_holds.orderRef` → FK real | Crítico | `product_reviews.verifiedPurchase` es inalcanzable, `escrow_holds.orderRef` cuelga sin tabla, la comisión de `commission_rules` no tiene dónde aplicarse y el radar predictivo no tiene dato transaccional. Es la base que todo lo demás usa. |
| **P0** | 02 | **Geolocalización del comprador ausente** | G2 (Radar) + G3 | `users.countryCode` / `users.region` (ISO 3166-1 alpha-2) | Alto | El Radar agrupa por `sellerCountryCode` pero el país del comprador se pasa por API sin persistir. Sin él, el radar no es "radar de comunidad" sino un filtro efímero. |
| **P0** | 03 | **No hay dimensión países/regiones (geoname)** | Transversal (G2 radar, G1, customs) | `countries`/`regions` (ISO 3166 + región GWS `region-map.const`) | Medio-Alto | `customs_country_params` es tarifa aduanera, no geo. CLAUDE.md §4 tiene **pendiente de confirmación el alcance geográfico real** — la dimensión geo debe existir para local/regional/global. |
| **P0** | 04 | **G3 sin publicaciones/hilos/comentarios** | G3 | `community_posts`, `post_comments`, `post_reactions`, entidad `channels` (FK para `chat_messages.channelId`) | Alto | CLAUDE.md define G3 como "debates, publicaciones, networking y chat". Con solo `chat_messages` no hay moderación de contenido asíncrono ni se aplica el anti-leak a texto libre de posts (extensión prevista en §3.6). |
| P1 | 05 | **Satélite de Licitación sin entidades** | Satélite | `auction_lots`, `auction_bids`, vencimiento 72h, resolución + bridg a `escrow_holds` | Medio | Hoy es solo prototipo visual. Construir cuando el prototipo funcional esté aprobado; el escrow ya da el patrón de máquina de estados. |
| P1 | 06 | **G1: entrega de contenido de cursos/talleres** | G1 | `course_enrollments`, `course_modules`/`lessons` (o delivery ligero por `details` JSONB) | Medio | `g1_master_catalog_items` cubre el ítem vendible pero no la estructura de aprendizaje. Depende de que haya contenido real de maestros (regla de alcance). |
| P1 | 07 | **Radar de oferta/demanda + motor predictivo sin schema** | Transversal | `demand_signals`/`price_history`/eventos agregados | Medio | Con P0-01 (órdenes) se materializa la fuente de datos. El motor predictivo es conceptual; el esquema de eventos conviene diseñarlo antes de acumular historial, pero no bloquear el MVP. |
| P2 | 08 | **G6: cálculos de horno / curvas de recocido / MSDS dedicados** | G6 | (a definir cuando exista el wizard real) | Bajo | `vault_documents.metadata` ya aloja COE/anneal. No crear tablas prematuras para un wizard aún prototipado. |
| P2 | 09 | **G4/G5** | G4, G5 | Ninguna | — | Mantener reservado sin tablas hasta que haya contenido real. Correcto hoy. |
| P2 | 10 | **Notificaciones / inbox de plataforma** | G3 | `notifications`, `notification_channels` | Bajo | No está explícito en CLAUDE.md; el chat es la única vía. Considerar solo cuando haya posts + órdenes que notificar. |

---

## 4. Gaps específicos detectados (validados contra las 30 tablas)

1. **G3 — publicaciones/hilos**: Confirmado. Solo existe `chat_messages` (30 tablas reales). No hay tabla de posts/comentarios; `channelId` es string sin tabla `channels`. **Sí falta** una entidad de publicaciones/hilos para debates y networking.
2. **G1 — cursos/materiales**: `g1_master_catalog_items` cubre los 5 tipos (course, workshop, book, tool_line, material_line) con `details` JSONB — la **venta** está cubierta. **Falta** la estructura de entrega (enrolamiento, módulos/lecciones) cuando exista contenido real.
3. **Satélite de Licitación**: Confirmado. Ninguna de las 30 tablas corresponde a subastas/licitaciones 72hs. Sin cobertura en BD.
4. **Radar de oferta/demanda + motor predictivo**: Confirmado. Solo `region-map.const.ts` en código (config estática). No hay schema de eventos/histórico. Conceptual.
5. **G4/G5**: Confirmado — vacío correcto. No hay tablas de borosilicato/envases ni de gran industria; se respeta la regla de alcance. (Presencia indirecta: escrow `heavy_machinery`, `ad_billboards.galaxy='g4'`).
6. **Localización/geo de usuarios**: Confirmado. `users` (verificado) **no tiene** `countryCode`/`region` — solo `preferredLanguage`/`preferredCurrency`. `customs_country_params` es aduana, no geo. **Falta** la dimensión geográfica del usuario.
7. **Pagos internacionales/tarifas**: Parcial-cubierto. El "settlement" es intención de cobro (`settlementCurrency`/`paymentMethod` en `escrow_holds`, `ad_campaigns`, `bunker_memberships`) y las tarifas viven en `commission_rules` + `customs_*`. El movimiento real de fondos está fuera de la BD (Payment_Vault, §3.1) — correcto por gobernanza, pero no hay ledger transitivo propio.

Gap adicional detectado no listado por el pedido: **P0-01 órdenes/checkout** — ninguna de las 30 tablas representa una compra persistida, pese a que varias columnas la presuponen (`verifiedPurchase`, `orderRef`, `minimumOrderQuantity`/`requiresMsds` en `products`).

---

## 5. Recomendaciones de orden de construcción

1. **Fundación transversal P0 primero**: dimensión geográfica (`users.countryCode/region` + tabla `countries`/`regions`) y **órdenes/checkout** como esqueleto mínimo uniendo `products` → `orders` → `escrow_holds.orderRef` → aplicación de `commission_rules` → `product_reviews.verifiedPurchase`. Sin esto, el resto de la cadena de valor no cierra.
2. **G3 publicaciones/hilos** (P0-04) como segundo bloque: es el pegamento de la comunidad y el punto donde el anti-leak §3.6 debe extenderse a texto libre.
3. **Cerrar G2 con el radar sobre datos persistidos** recién cuando el comprador tenga país guardado (depende del punto 1), evitando el agrupado en memoria actual.
4. **G1: enrolamiento/entrega de cursos** cuando exista contenido real de maestros (regla de alcance), no antes.
5. **Satélite de Licitación** (P1) tras aprobar el prototipo funcional; reutilizar el patrón de máquina de estados del escrow y enganchar soluciones ganadoras a `escrow_holds`.
6. **Radar/motor predictivo**: diseñar el schema de eventos *antes* de acumular historial, pero **posponer su implementación** hasta que haya volumen transaccional real (post-órdenes).
7. **G4/G5 y wizard de horno G6**: quedan reservados/sin tablas dedicadas hasta tener contenido real. Sobre G6, aprovechar que `vault_documents` ya soporta MSDS/curvas vía metadata antes de crear tablas nuevas.

---

## 6. Análisis de integridad referencial

### Patrones observados (verificado en las entidades de `src/`)

| Patrón | Uso | Observación |
|---|---|---|
| `ON DELETE CASCADE` | Dominante en FKs a **User** y a agregados de raíz: `products→User`, `product_variants→product`, `product_reviews→product|buyer`, `chat_messages→author`, `g1_masters→user`, `g1_master_catalog_items→master`, `escrow_holds→buyer|seller`, `elevated_sessions→user`, `user_subscriptions→user`, `product_categories→parent`, `ad_campaigns→billboard|advertiser`, `bunker_*→user`, `g6_tech_sheets→seller`, `founding_claims→user` | Coherente: borrar la cuenta arrastra su contenido. Riesgo aceptado por el dominio. |
| `ON DELETE SET NULL` | Referencias opcionales: `products→product_categories`, `user_subscriptions→subscription_plans`, `bunker_service_requests→bunker_specialists`, `g6_tech_sheets→products` | Correcto: se preserva la fila hija al borrar la entidad referenciada. |
| `ON DELETE RESTRICT` | `vault_documents→vault_categories` (+ `eager`) | Correcto: no se puede borrar una categoría de la Bóveda con documentos — protege conocimiento curado. Único caso de RESTRICT. |
| **Sin FK (string plano)** | `audit_logs.userId`, `vault_documents.authorId`, `g6_tech_sheets.templateId`, `escrow_holds.orderRef`, `chat_messages.channelId` | **Riesgo de huérfanos**: no hay constraint que impida un `userId` inexistente o un `orderRef` sin orden. Aceptable para logs y para la Bóveda (retener autor aun si borran la cuenta), pero **crítico** para `escrow_holds.orderRef`, que hoy apunta a un sistema de órdenes inexistente (P0-01). |

### Riesgos de datos anómalos detectados

1. **`escrow_holds.orderRef` sin tabla de órdenes ni FK**: cada retención cuelga de un string no verificable → riesgo de retenciones huérfanas o referencias duplicadas. P0.
2. **`product_reviews.verifiedPurchase` siempre `false`**: el proceso de checkout que debería setearlo no existe → el sello "compra verificada" es imposible de emitir hoy.
3. **`audit_logs` "inmutable" solo a nivel de aplicación**: CLAUDE.md §3.5 lo exige, pero la revogación de UPDATE/DELETE a nivel de BD para el rol de la app está **pendiente de configurar en la migración de infraestructura** (comentado en la propia entidad). Riesgo si alguien con acceso a BD modifica el log.
4. **Doble referencia sin sincronizar en `product_reviews`**: `UNIQUE(buyerId, productId)` está bien, pero `verifiedPurchase` depende de órdenes (ver #2); el atributo puede afirmar "compra real" sin sustento.
5. **`chat_messages.channelId` como string default `'general'`**: migrar a FK `channels` será un `ALTER` de datos existentes; hoy no hay constraint, los mensajes futuros podrían vivir "en la nada" cuando se introduzcan canales.
6. **Monedas a nivel de columna (`settlementCurrency`, `currency`)**: valores cortos (`USD`/`USDT`/`ARS`/`EUR`/… ) sin FK a una dimensión de divisas ni check constraint → chequear que el enum de la capa de DTOs siempre valide, ya que la BD no lo hace. (El doble estándar USD/USDT exige coherencia absoluta tras la migración `SettlementSchema`.)
7. **`vault_documents.authorId` sin FK a `users`** mientras `g1_masters.user` sí tiene CASCADE: decisión válida (conocimiento sobrevive al autor), pero conviene documentarla como policy explícita para que no se "corrija" accidentalmente hacia CASCADE.

### Buenas prácticas observadas (a replicar en los gaps)

- Auditabilidad sin borrado físico (soft-delete `active` en `products`, `masters`, etc.).
- Money con `DecimalTransformer` y escala consistente (12,2) en escrow/ads.
- `VersionColumn` (optimistic lock) en `escrow_holds` contra doble-liberación.
- Límites duros transaccionales: `founding_slots` con `pesimistic_write` + count en transacción.
- JSONB pragmático (details/specs/metadata) reservado para atributos heterogéneos por rubro, con columnas tipadas para lo filtrable (COE, temperatura) — patrón a mantener en los nuevos módulos.