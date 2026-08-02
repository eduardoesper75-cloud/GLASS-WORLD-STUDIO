# GWS · Migraciones de base de datos

> Reemplaza `synchronize: true` (prohibido en producción). El esquema de la
> base de datos se versiona como código, igual que el resto del backend.

## Por qué

`synchronize: true` le dice a TypeORM "hace que la base de datos coincida con
las entidades". Problemas:

1. **Altera el esquema sin pedir permiso**: un cambio accidental en una
   entidad se aplica en el próximo arranque, sin revisión ni rollback.
2. **Puede destruir datos**: `synchronize` con columnas que cambian de tipo
   intenta `ALTER`, y si falla el path de "drop + recreate", se pierde
   contenido. Nunca está garantizado que preserve datos.
3. **No hay historial**: no se puede responder "¿qué cambió entre el 1 y el
   2 de marzo?" ni revertir una migración mala.

Con migraciones, cada cambio de esquema es un archivo con un `up()` (aplica)
y un `down()` (revierte). Ordenadas por timestamp, revisables en PR, con
rollback conocido.

## Flujo de trabajo

```bash
# 1. Después de modificar una entidad, generar la migración:
npm run migration:generate -- src/database/migrations/NombreDeLaMigracion

# 2. Revisar el archivo generado (¡siempre!). Las migraciones generadas
#    automáticamente pueden incluir cambios inesperados — editar si hace falta.

# 3. Aplicar en la base local:
npm run migration:run

# 4. Ver el estado (pendientes/aplicadas):
npm run migration:show

# 5. Si algo salió mal, revertir la última:
npm run migration:revert
```

## Reglas obligatorias

- **Nunca editar una migración ya aplicada** (el hash cambia y TypeORM
  detecta que no coincide con lo ejecutado). Si hace falta cambiar algo,
  se crea una migración NUEVA que corrija el esquema.
- **Siempre con `up()` Y `down()`** completos. Si no se puede escribir un
  `down()` seguro, el `up()` necesita aprobación explícita de Jorge antes
  de merge.
- **Nada de `synchronize` en producción**: `app.module.ts` ya lo fija en
  `false` y ejecuta migraciones al arrancar (`migrationsRun: true`).
- Los **enums de PostgreSQL** se crean como tipos propios
  (`<tabla>_<columna>_enum` — naming interno de TypeORM, ver
  `buildEnumName`). Al agregar un valor a un enum, la migración debe usar
  `ALTER TYPE ... ADD VALUE`.
- Cambios destructivos (drop de columna/tabla, cambio de tipo que pierde
  datos): `up()` debe ejecutar primero un **backup** de la tabla afectada
  (por ej. `CREATE TABLE <tabla>_backup_<fecha> AS SELECT * FROM <tabla>`)
  o documentar que el backup lo hace la infraestructura antes de correr.

## Regenerar una migración desde cero (solo dev)

Si la base local quedó con un esquema corrupto y no hay datos valiosos:

```bash
# Dropear el esquema y regenerar desde la migración InitSchema
npm run migration:run   # aplica todas las migraciones desde vacío
```

## Archivos

| Archivo | Rol |
|---|---|
| `src/database/data-source.ts` | DataSource del CLI de TypeORM (no es módulo Nest) |
| `src/database/entities.ts` | Lista única de entidades (compartida con AppModule) |
| `src/database/migrations/` | Migraciones versionadas por timestamp |
| `app.module.ts` | `synchronize:false` + `migrationsRun:true` |
