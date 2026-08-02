# Pendientes Bloqueados + Protocolo de Ejecución (GitHub Codespace)

> Orden Suprema: los pendientes que no se pueden completar hoy **no se
> olvidan**: se registran oficialmente como **Pendiente Bloqueado** con su
> desbloqueo y su protocolo de ejecución. Las pruebas/migraciones nunca se
> ejecutan en el servidor principal: van a **GitHub Codespace** (Linux limpio).

---

## 1. Registro oficial de pendientes bloqueados

| # | Pendiente | Bloqueado por | Desbloqueo | Protocolo |
|---|---|---|---|---|
| P1 | E2E de las migraciones recientes (UXMultimedia `1737000000000`, Billboards `1738000000000`, Bunker `1739000000000`, Settlement `1740000000000`, G6 TechSheets `1741000000000`, Escrow `1742000000000`) | Docker caído en el entorno principal | Docker operativo o Codespace | Ejecutar `npm.cmd run migration:run` + tests E2E SOLO en Codespace |
| P2 | Click-tracking por campaña en carteleras | Orden de marketing llegó antes del sprint de carteleras | Ventana de desarrollo dedicada | Backend + tracking en `src/billboards/` con docs `carteleras-cro-2026.md` |
| P3 | Confirmación del SLA del Búnker (standard 48h/5d · urgent 24h/72h · critical 4h remoto / 24h presencial) | Falta la confirmación de Jorge | Respuesta de Jorge | Actualizar `convocatoria-g1-bunker-2026.md §5` y tablas de producto |
| P4 | Scraping en bucle de catálogos G6 (insumos de vidrio, termocuplas, pigmentos) | Revisión de derechos de contenido + curaduría humana (Orden G6 §3) | Revisión de derechos y curaduría | Alimentar NUEVAS migraciones con `sourceRef`/`curated` (nunca editar la 1741000000000) — ejecución en Codespace |
| P5 | Adaptador USDT de producción (verificación de saldos en red TRC-20/Polygon + confirmación de acreditación) | CLAUDE.md §3.1: Payment_Vault es código inalterable para agentes de IA | Solo Jorge, con elevación + 2FA | Implementar en Payment_Vault respetando el contrato `IBalanceVerificationAdapter` (`settlement.adapter.ts`); el backend ya guarda moneda/método elegidos |
| P6 | Sweep programado de liberación automática del escrow (ejecutar en el vencimiento `holdUntil` de cada retención HELD sin reclamo) | No hay infraestructura de cron/jobs en el backend actual | Añadir `@nestjs/schedule` o cron externo en infraestructura | Job que llame `GET /escrow/pending-releases` (admin) y derive `deriveStatus`; hoy la liberación auto se deriva en cada lectura (lazy). Ejecución confinada a Codespace hasta staging |

## 2. Protocolo de ejecución confinada (Codespace)

1. **Dónde**: GitHub Codespace (entorno Linux limpio). Nunca el servidor
   principal.
2. **Orden de ejecución** (para P1):
   - `npm ci`
   - `npm run build`
   - `npm run migration:run` (en orden: UXMultimedia → Billboards → Bunker)
   - tests E2E de las tres galaxias
3. **Resultado esperado**: migraciones idempotentes (pueden volver a correr),
   seed de carteleras intacto, sin datos de producción tocados.
4. **Regla de oro**: si un test no corre en Codespace limpio, se documenta y se
   devuelve a Pendiente Bloqueado — nunca se parchea para que "pase".

## 3. Reglas del registro

- Todo pendiente que hoy no se puede hacer **debe** tener fila en la §1.
- Cada vez que se desbloquea algo, la fila pasa a "desbloqueado" y se anota la
  fecha y quién lo ejecutó.
- El registro vive aquí (`docs/ops/pendientes-bloqueados-codespace.md`) y es
  la única fuente de verdad de deuda técnica conocida.
