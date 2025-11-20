import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UuidModule } from 'src/common/uuid/uuid.module';

@Module({
  imports: [UuidModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
