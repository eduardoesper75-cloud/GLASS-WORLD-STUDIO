import { ValueTransformer } from 'typeorm';

/**
 * GWS · DecimalTransformer
 * ------------------------------------------------------------
 * Las columnas numeric/decimal de PostgreSQL devuelven strings en runtime.
 * Este transformer normaliza la lectura a number y deja pasar la escritura
 * tal cual (TypeORM/el driver la serializa correctamente). Se usa en todas
 * las entidades con dinero/porcentajes para que el código nunca reciba un
 * "18.00" como string inesperado.
 */
export class DecimalTransformer implements ValueTransformer {
  to(value: number | null | undefined): number | null {
    return value ?? null;
  }

  from(value: string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    return Number(value);
  }
}
