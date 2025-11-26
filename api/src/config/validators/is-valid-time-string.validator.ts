import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import ms, { StringValue } from 'ms';

export function IsValidTimeString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidTimeString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          try {
            const result = ms(value as StringValue);
            return typeof result === 'number' && result > 0;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid time string (e.g., "1h", "30m", "7d", "60s")`;
        },
      },
    });
  };
}
