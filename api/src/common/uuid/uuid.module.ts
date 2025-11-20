import { Module } from '@nestjs/common';
import { UUID_GENERATOR_TOKEN } from './uuid.tokens';
import { UuidV4Generator } from './uuid-v4.generator';

@Module({
  providers: [
    {
      provide: UUID_GENERATOR_TOKEN,
      useClass: UuidV4Generator,
    },
  ],
  exports: [UUID_GENERATOR_TOKEN],
})
export class UuidModule {}
