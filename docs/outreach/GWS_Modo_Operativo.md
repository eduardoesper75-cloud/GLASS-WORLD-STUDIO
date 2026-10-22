# GWS · Modo operativo del outreach

estado: reposo
desde: 2026-10-17
motivo: Fase 2 completada (20/20 puertas); reactivación de Fase 3 pendiente de decisión del titular
responsable: Dirección del proyecto (Eduardo Esper)

---

## Qué significa cada estado

| `estado` | Significado |
| --- | --- |
| `reposo` | **Modo consulta e investigación pasiva.** El envío de correos está **bloqueado** en `tools/outreach/send-batch.mjs`: `--execute` aborta. Sí se puede investigar, curar la base y consultar registros. |
| `activo` | Se permite el envío real (`--execute`), siempre con ritmo humano y máximo 3 toques por contacto. |

El valor de la primera línea (`estado: ...`) es **lo que lee el código**. Cambiar el estado es, a
propósito, un acto explícito y versionado: se edita este archivo, se revisa y se commitea.

---

## Cómo se aplica

- **Bloqueo en el emisor:** `send-batch.mjs` lee este archivo. Con `reposo`, el **dry-run** funciona
  igual (para inspeccionar lotes) pero `--execute` **se niega a enviar** y explica por qué.
- **Sin tareas en segundo plano:** no hay ningún proceso de envío corriendo. El sistema queda en modo
  consulta; los registros se consultan localmente con
  `node tools/outreach/followup-status.mjs` (sólo lee).
- **Investigación habilitada:** todo `docs/outreach/` sigue operable —
  `node tools/outreach/scout-curate.mjs` valida y cura la base de puertas sin enviar nada.

---

## Cómo se reanuda (cuando corresponda)

> **Corte 2026-10-22:** la Fase 2 está completa (**20/20 puertas**). El estado **sigue en `reposo`**:
> tener base no autoriza envíos. La reanudación requiere una decisión explícita del titular y la
> compuerta de Fase 3.

1. Confirmar que la Fase 1 está cerrada: casilla institucional resuelta **o** aceptada formalmente
   como punto ciego declarado.
2. Revisar la base selectiva `docs/outreach/scouting/puertas-curadas.csv` (20/20) y la lista de
   exclusión `docs/outreach/scouting/exclusiones-fase3.csv` (30 contactos previos).
3. Aprobar el límite diario (5 primeros contactos/día, 3 toques, 5 días hábiles entre toques) y, si
   se va a enviar un term sheet, los términos finales de B2/B4.
4. Cambiar la primera línea de este archivo a `estado: activo`, con la fecha y el motivo del reinicio.
5. Verificar el emisor institucional (contraseña de la casilla Don Web en `.env.local`; ver
   [`GWS_Checklist_Salida_Operativa.md`](./GWS_Checklist_Salida_Operativa.md)) y recién entonces
   enviar de forma selectiva.

> El estado vive en un archivo versionado y no en un secreto: **la pausa es una decisión del
> proyecto**, auditable en el historial de git.
