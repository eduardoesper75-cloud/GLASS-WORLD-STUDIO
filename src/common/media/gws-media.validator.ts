/**
 * GWS · Validador class-validator para arrays de media
 * ------------------------------------------------------------
 * Puerta N°1 (DTO): valida con mensajes legibles antes de llegar al
 * service. La puerta N°2 (resolveGwsMediaOrThrow) persiste el modelo
 * resuelto (embedUrl calculada). Ver gws-media.validate.ts.
 */
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { resolveGwsMediaItems } from './gws-media.validate';

@ValidatorConstraint({ name: 'IsGwsMediaArray', async: false })
export class IsGwsMediaArrayConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    return resolveGwsMediaItems(value).ok;
  }

  defaultMessage(args: ValidationArguments): string {
    const res = resolveGwsMediaItems(args.value);
    if (res.ok) return 'media inválida';
    const failed = res as { ok: false; errors: string[] };
    return failed.errors.join('; ');
  }
}

export function IsGwsMediaArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsGwsMediaArrayConstraint,
    });
  };
}
