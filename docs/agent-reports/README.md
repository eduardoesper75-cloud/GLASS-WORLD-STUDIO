# GWS — Informes de agentes

Aqui se guardan los partes de novedades, informes visuales y certificados de auditoria.

- **Nombre de archivo:** `<task-id>.md`, con `task-id` = `GWS-YYYYMMDD-NN`.
- **Plantillas:** `docs/agents/GWS_REPORT_TEMPLATES.md`.
- **Flujo y estados:** `docs/agents/GWS_WORKFLOW.md`.
- **Reglas:** sin secretos, sin tokens, sin PII; todo dato verificable; cada salida firmada
  con `[CUADRILLA-xx] "Alias" · <id>`.

Cuando una tarea requiera material que no deba versionarse (datos de terceros, adjuntos,
capturas pesadas), se guarda fuera del repositorio o en una ruta ignorada, y el informe
referencia su ubicacion sin copiar el contenido.

Directorio creado al establecer el gobierno de agentes (2026-10-17).
