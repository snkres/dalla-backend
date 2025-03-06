import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { nanoIdAlphabet, prefixes } from '../utils/unique-id';

@Injectable()
export class IdValidationPipe implements PipeTransform {
  length = 16;
  constructor(private readonly type?: keyof typeof prefixes) {}

  transform(value: string) {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('ID must be a non-empty string');
    }

    return this.validateNewId(value, this.length);
  }

  private validateNewId(value: string, length: number): string {
    const [prefix, id] = value.split('_');
    if (this.type) {
      if (prefix !== prefixes[this.type]) {
        throw new BadRequestException(`ID must be ${this.type}`);
      }
    }

    // Check if the prefix is valid
    const validPrefixes = Object.values(prefixes);
    if (!prefix || !validPrefixes.includes(prefix as any)) {
      throw new BadRequestException(
        `ID prefix must be one of: ${validPrefixes.join(', ')}`,
      );
    }

    // Check if the ID part exists and matches the expected length
    if (!id || id.length !== length) {
      throw new BadRequestException(
        `ID must have a ${length}-character nanoid after the prefix`,
      );
    }

    // Validate the nanoid part against the alphabet
    if (!this.isValidNanoId(id)) {
      throw new BadRequestException(
        'ID contains invalid characters. Allowed: ' + nanoIdAlphabet,
      );
    }

    return value;
  }

  private isValidNanoId(value: string): boolean {
    return [...value].every((char) => nanoIdAlphabet.includes(char));
  }
}
