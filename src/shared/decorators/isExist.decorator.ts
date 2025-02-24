import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PostgresPrismaService) {}

  async validate(value: any, args: ValidationArguments) {
    const [model, column] = args.constraints;
    const record = await this.prisma[model as string].findUnique({
      where: { [column]: value },
    });
    return !!record;
  }

  defaultMessage(args: ValidationArguments) {
    const [model, column] = args.constraints;
    return `${model} with ${column} ${args.value} does not exist`;
  }
}

export function IsExist(
  model: string,
  column: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [model, column],
      validator: IsExistConstraint,
    });
  };
}
