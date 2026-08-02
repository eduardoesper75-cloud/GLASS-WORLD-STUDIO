# Soberanía Financiera — Settlement nativo USD + USDT (2026)

> **Orden Suprema (Soberanía Financiera)**: todas las transacciones de la
> plataforma operan bajo un doble estándar soberano — Dólares (USD) y
> Criptomonedas Estables (USDT). Queda prohibida la dependencia exclusiva
> de monedas fiat locales para servicios transfronterizos o membresía global.

---

## 1. Monedas y métodos (un clic)

| Concepto | Valor |
|---|---|
| Monedas de settlement | `USD` y `USDT` |
| Paridad | **1 USDT = 1 USD** |
| Métodos (un clic) | `card_usd` (tarjeta USD) · `usdt_trc20` · `usdt_polygon` |
| Redes USDT de bajo costo | TRC-20 (Tron) y Polygon |

## 2. Aplicación por módulo económico

| Módulo | Regla de settlement | Estado |
|---|---|---|
| **Búnker** (membresía USD 50/mes) | Tarjeta USD o USDT (TRC-20/Polygon), con fidelización 3m=10%/6m=15%/12m=20% | Implementado (`bunker_memberships.settlementCurrency/paymentMethod`) |
| **Carteleras** (USD 1/día) | USD 1,00 o 1 USDT por día activo | Implementado (`ad_campaigns.settlementCurrency/paymentMethod`) |
| **Marketplace** (comisiones G1 30% · G5 20% · estándar 18%) | Cobro/liquidación en cripto o USD según elección de las partes | Política declarada en `SETTLEMENT_POLICY`; el módulo de órdenes se implementará con la Galaxia 2 |

## 3. Gobernanza (CLAUDE.md §3.1 — límites inquebrantables)

- **Ninguna IA toca el Payment_Vault**: el adaptador que habla con redes,
  guarda tokens de transacción y confirma la acreditación on-chain es
  código **inalterable** para agentes de IA; solo Jorge con elevación + 2FA.
- Lo que el backend puede hacer (y hace): guardar la **elección** del usuario
  (moneda + método de un clic) y exponer la política pública.
- El adaptador de verificación de saldos (`settlement.adapter.ts`) entrega el
  **contrato de interfaz** + una **implementación demo sin credenciales ni
  red**; la implementación de producción vive en Payment_Vault y debe respetar
  la misma firma.
- **Cero cambios de tarifa**: esta orden no modifica precios ni comisiones —
  solo agrega la moneda de cobro. Los valores vigentes (50/mes, 1/día,
  30/20/18) quedan intactos.

## 4. Endpoints

| Endpoint | Acceso | Función |
|---|---|---|
| `GET /settlement/meta` | público | Política soberana (monedas, métodos, paridad, por módulo) |
| `POST /settlement/verify-usdt-balance` | autenticado | Verificación DEMO de saldo (contrato de un clic) — red real = Payment_Vault |
| `GET /bunker/meta` | público | Incluye `settlement` (monedas/métodos del Búnker) |
| `GET /bunker/memberships/quote` | público | Cotización con `settlementCurrency`/`paymentMethod` y paridad 1:1 |
| `POST /billboards/campaigns` | autenticado | Alta de campaña con moneda de settlement elegida |

## 5. Pendientes

- [ ] P5: adaptador USDT de producción (red real TRC-20/Polygon) — SOLO Jorge
      en Payment_Vault (elevación + 2FA). Registrado en pendientes bloqueados.
- [ ] Confirmación de Jorge de los procedimientos de liquidación cripto→fiat.
- [ ] Módulo de órdenes del Marketplace (G2) con settlement por elección de
      las partes.
