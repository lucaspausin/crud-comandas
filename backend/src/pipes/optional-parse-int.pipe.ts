import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class OptionalParseIntPipe implements PipeTransform {
  transform(value: any): number | undefined {
    if (value === undefined || value === null) {
      return undefined; // Permitir undefined
    }

    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new BadRequestException('Validation failed (numeric string is expected)');
    }
    return parsedValue;
  }
} 