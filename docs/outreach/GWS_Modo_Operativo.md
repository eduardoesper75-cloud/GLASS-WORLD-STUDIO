# GWS · Modo operativo del outreach

estado: reposo
desde: 2026-10-17
motivo: pausa institucional de fin de semana — pivote a investigación y scouting de puertas de alto valor
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

1. Confirmar el corte de medición: eventos del 1er toque registrados en
   `docs/outreach/respuestas.jsonl` (respuestas, bounces, autorespuestas o `sin_novedad`).
2. Revisar la lista selectiva: `docs/outreach/scouting/puertas-curadas.csv`.
3. Cambiar la primera línea de este archivo a `estado: activo`, con la fecha y el motivo del reinicio.
4. Verificar el emisor institucional (contraseña de la casilla Don Web en `.env.local`; ver
   [`GWS_Checklist_Salida_Operativa.md`](./GWS_Checklist_Salida_Operativa.md)) y recién entonces
   enviar de forma selectiva.

> El estado vive en un archivo versionado y no en un secreto: **la pausa es una decisión del
> proyecto**, auditable en el historial de git.
