import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UuidModule } from 'src/common/uuid/uuid.module';

@Module({
  imports: [UuidModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
