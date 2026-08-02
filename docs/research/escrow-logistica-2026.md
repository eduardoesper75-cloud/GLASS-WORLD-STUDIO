# Escrow Inteligente y Blindaje Logístico — Retención y Liberación Automatizada (2026)

> **Orden Suprema (Blindaje Logístico, Estándares de Embalaje y Liberación
> Automatizada de Fondos — Escrow GWS)**. Retención temporal de pagos con
> liberación sin intervención manual de la administración, en USD y USDT,
> más el Protocolo de Embalaje Certificado GWS que exime a la plataforma de
> responsabilidad física por roturas/siniestros en tránsito.

---

## 1. Protocolo de Embalaje Certificado GWS (Orden §1)

GWS opera sin alianzas fijas con operadores logísticos. **No asume la
responsabilidad física por roturas o siniestros en tránsito**: impone
manuales estrictos de empaquetado, de cumplimiento **excluyente** para el
vendedor. El incumplimiento del estándar libera legalmente a la plataforma
de reclamos por transporte.

| Categoría | Estándar de embalaje |
|---|---|
| Consumibles | Cartón corrugado reforzado (doble pared) + relleno amortiguante |
| Frágiles / Vidrio dicroico | **Doble encajado de alta absorción**: film antirayaduras + espuma de celda abierta + caja interior + caja exterior + marcado "FRÁGIL / ESTE LADO ARRIBA" |
| Eléctricos / repuestos | Embolsado antiestático + desecante (sílica gel) + cartón corrugado |
| Maquinaria / hornos (G5) | **Madera tratada (ISPM 15)** + fleje metálico + film stretch + bloqueo de componentes móviles + plano de estiba + checklist de puesta en marcha |

Los protocolos viven en `src/escrow/escrow.const.ts` (`ESCROW_PACKAGING_STANDARDS`)
y se exponen en `GET /escrow/release-matrix`.

## 2. Matriz de liberación automatizada (Orden §2)

| Categoría | Liberación manual | Liberación automática (sin reclamo) |
|---|---|---|
| Herramientas, esmaltes, consumibles menores | "OK / Recibido conforme" → inmediata | **24 horas** |
| Vidrios artísticos, planchas dicroicas, frágiles | idem | **72 horas (3 días)** |
| Componentes eléctricos, repuestos, accesorios | idem | **1 semana (7 días)** |
| Maquinaria pesada, hornos industriales, sistemas G5 | idem | **10 días** (recepción, descarga con grúas, puesta en marcha inicial) |

**Máquina de estados** (dominio + display; el movimiento real de fondos es
del Payment_Vault §3.1):

```
HELD ──(Recibido conforme, comprador)───────────────► RELEASED (manual)
HELD ──(venció holdUntil, sin reclamo)──────────────► RELEASED (auto, lazy)
HELD ──(reclamo explícito)──► CLAIMED ──(admin+elevación)──► RELEASED | REFUNDED
```

- La liberación automática se deriva en cada lectura (`deriveStatus`, mismo
  patrón que las carteleras). Un **sweep programado** que la ejecute en
  tiempo real queda registrado como P6 (pendiente bloqueado).
- Los reclamos los resuelve **solo Jorge** (admin + elevación
  `manage_escrow_disputes`) con audit log inmutable.

## 3. Consolidación financiera (Orden §3 — reitera tarifas confirmadas)

| Módulo | Regla | Fuente en código |
|---|---|---|
| Marketplace | G1 **30%** (solo obra de arte); herramientas/cursos de maestros **18%**; G5 **20%**; resto **18%** | `commission_rules` (seed) — sin cambios |
| Búnker | $50/mes con fidelización trimestre/semestre/año y **0%** comisión | `bunker.const.ts` — sin cambios |
| Carteleras | $1 USD / 1 USDT por día, filas de espera automáticas | `billboards.const.ts` — sin cambios |
| Settlement | USD + USDT nativos y simultáneos | `settlement.const.ts` — ya implementado |

**Nota de gobernanza**: la Orden no modifica tarifas (ya confirmadas por
Jorge); el escrow agrega la máquina de estados de retención/liberación sin
tocar el Payment_Vault ni `commission_rules`.

## 4. Endpoints

| Endpoint | Acceso | Función |
|---|---|---|
| `GET /escrow/release-matrix` | público | Matriz de liberación + embalaje certificado |
| `GET /escrow` | autenticado | Retenciones del usuario (comprador/vendedor) |
| `POST /escrow` | autenticado (comprador) | Apertura de retención (USD/USDT) |
| `POST /escrow/:id/confirm-receipt` | comprador | Liberación manual instantánea |
| `POST /escrow/:id/claim` | comprador | Reclamo → congela la automática |
| `PUT /escrow/:id/resolve` | **admin + elevación** | Release | Refund (auditado) |
| `GET /escrow/pending-releases` | admin | Vencidas sin reclamo (para el sweep P6) |

## 5. Pendientes

- [ ] P6: sweep programado de liberación automática (@nestjs/schedule o cron
      externo) — ver pendientes bloqueados.
- [ ] Confirmación de Jorge de los términos de exención logística (texto
      legal definitivo del Protocolo de Embalaje).
- [ ] Integración del escrow con la orden del Marketplace (G2) al crearse el
      módulo de órdenes.
