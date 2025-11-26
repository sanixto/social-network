import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

@Injectable()
export class JwtConfig {
  constructor(private readonly configService: ConfigService) {}

  get secret(): string {
    return this.configService.getOrThrow<string>('JWT_SECRET');
  }

  get expiresIn(): StringValue {
    return this.configService.getOrThrow<StringValue>('JWT_EXPIRES_IN');
  }
}
