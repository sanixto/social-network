import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UuidGenerator } from './uuid-generator.interface';

@Injectable()
export class UuidV4Generator implements UuidGenerator {
  generate(): string {
    return uuidv4();
  }
}
