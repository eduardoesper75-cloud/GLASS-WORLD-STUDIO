# GWS — Estandar de auditoria de seguridad

> Checklist obligatorio para `gws-chief-qa-security-auditor` y `[QA-SQUAD]`.
> **Solo el humano modifica este documento**: un agente no puede alterar sus propios
> criterios de aprobacion.
>
> Contexto del proyecto: no hay todavia base de datos, autenticacion, pagos ni API en el
> repo. Los controles marcados **[proactivo]** se auditan cuando la superficie exista; hoy
> se registran como "sin superficie".

---

## 1. Identidad

- [ ] Autenticacion resuelta **server-side**; nunca se confia en identidad enviada por el cliente.
- [ ] Sesiones con identificador no adivinable; expiracion definida.
- [ ] Revocacion posible (logout, cambio de credencial, cierre por administrador).
- [ ] MFA cuando el caso de uso lo justifique (paneles administrativos, pagos).
- [ ] Cookies con `HttpOnly`, `Secure`, `SameSite` cuando aplique.
- [ ] Sin secretos ni tokens en el cliente (ni en HTML, ni en el bundle, ni en logs).

## 2. Autorizacion

- [ ] Autorizacion **por recurso** (ownership), no solo por "estar autenticado".
- [ ] Deny by default: sin regla explicita, se deniega.
- [ ] RBAC/ABAC declarativo y verificable.
- [ ] Sin IDOR: cambiar un identificador no debe dar acceso a datos ajenos.
- [ ] Sin escalamiento horizontal (otro usuario del mismo nivel).
- [ ] Sin escalamiento vertical (rol superior por manipulacion de parametros).
- [ ] Aislamiento por tenant verificable en cada consulta.
- [ ] Respuestas de error que no filtren existencia de recursos ajenos.

## 3. Datos **[proactivo]**

- [ ] Constraints en la base (no solo en la aplicacion).
- [ ] Claves foraneas efectivas.
- [ ] Transacciones en toda operacion multi-paso.
- [ ] Consistencia e idempotencia en operaciones reintentables.
- [ ] Concurrencia controlada (sin condiciones de carrera en contadores/estados).
- [ ] Migraciones revisadas, con estrategia de rollback declarada.
- [ ] Plan de recuperacion ante fallo a mitad de operacion.
- [ ] Fuente de verdad coherente con `packages/schemas` y `packages/taxonomy`.

## 4. Pagos **[proactivo]**

- [ ] Importes calculados **server-side**; nunca aceptados del cliente.
- [ ] Idempotency keys en toda operacion de cobro.
- [ ] Webhooks con firma verificada.
- [ ] Proteccion contra replay (evento repetido no vuelve a cobrar).
- [ ] Estados transaccionales explicitos con transiciones validas.
- [ ] Conciliacion entre lo cobrado y lo registrado.
- [ ] No se almacenan datos de tarjeta.
- [ ] Separacion verificable entre precio mostrado y precio cobrado.
- [ ] Sin doble cobro ante reintento, timeout o reenvio del proveedor.

## 5. Inputs y uploads

- [ ] Validacion de todo input en el servidor (tipo, rango, tamano).
- [ ] Limites de payload declarados y aplicados.
- [ ] MIME real verificado por contenido (magic bytes), no por extension.
- [ ] Nombres de archivo generados, nunca los del usuario.
- [ ] URLs firmadas con expiracion.
- [ ] Sin ejecucion de contenido subido (sin servir como HTML/JS activo).
- [ ] Proteccion contra contenido malicioso (imagenes/SVG/PDF).

## 6. Secretos

- [ ] Ningun secreto en codigo, Markdown, capturas, issues ni commits.
- [ ] Ningun secreto en logs, trazas ni mensajes de error.
- [ ] Ningun token en informes generados.
- [ ] Secretos solo en `.env` (ignorados por Git) o en el gestor del entorno.
- [ ] Minimo privilegio en cada credencial.
- [ ] Rotacion documentada y con procedimiento reproducible.
- [ ] Escaneo del arbol y del historial antes de publicar.

> Antecedente real del proyecto: `docs/security/GWS_S1_Remediacion_Credenciales.md`
> (documento versionado con credenciales en texto plano). Ese hecho es la razon de ser de
> este bloque. **No se transcriben valores.**

## 7. Resiliencia

- [ ] Rate limiting en endpoints sensibles.
- [ ] Timeouts definidos (cliente y servidor).
- [ ] Reintentos limitados con backoff.
- [ ] Limites de payload aplicados antes del procesamiento.
- [ ] Circuit breakers ante dependencias externas.
- [ ] Proteccion contra abuso (automatizacion, enumeracion, fuerza bruta).

## 8. Observabilidad

- [ ] `requestId` / `correlationId` en cada peticion relevante.
- [ ] `actorId` y `tenantId` cuando la operacion dependa de ellos.
- [ ] Eventos de seguridad registrados (login, cambio de roles, accesos denegados).
- [ ] Eventos de pago y webhooks registrados con su estado.
- [ ] Acciones administrativas registradas (quien, que, cuando).
- [ ] Intentos denegados registrados (no solo los exitosos).
- [ ] Sin datos personales ni secretos en los registros.

## 9. Cadena de suministro

- [ ] Dependencias nuevas con justificacion explicita.
- [ ] Lockfile coherente con `package.json`.
- [ ] Sin scripts de ciclo de vida (`preinstall`, `postinstall`) no revisados.
- [ ] Sin paquetes fuera del registro declarado.
- [ ] Vulnerabilidades conocidas evaluadas cuando haya fuente disponible (sin inventar CVEs).

## 10. Proceso de auditoria

- [ ] Estado **congelado**: commit o snapshot fijo.
- [ ] Diff completo revisado.
- [ ] Allowlist del `Task Manifest` comparada contra el diff real.
- [ ] Comandos y codigos de salida registrados (reales).
- [ ] Hallazgos clasificados S0–S4 con evidencia.
- [ ] Rondas contadas (max. 3) y hallazgos repetidos detectados.
- [ ] Riesgos residuales declarados.
- [ ] Decision: `PASS` / `BLOCKED` / `REQUIRES_HUMAN_APPROVAL`.

## 11. Como se reporta

Con el bloque del Auditor de `docs/agents/GWS_REPORT_TEMPLATES.md`, la tabla obligatoria de
cuadrilla y la evidencia por hallazgo. Un hallazgo sin evidencia se reporta como sospecha,
no como hallazgo.

## 12. Lo que este estandar no permite

- Declarar "libre de errores" (solo "sin hallazgos en la superficie revisada").
- Cerrar un hallazgo sin evidencia.
- Bajar severidad para destrabar una entrega.
- Modificar este documento (solo el humano).
