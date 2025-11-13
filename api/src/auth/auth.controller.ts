import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/me')
  getProfile(): User | null {
    return this.authService.getUserById('test-user-id');
  }

  @Post('/login')
  login(): User | null {
    return this.authService.validateUser('testuser', 'password');
  }

  @Post('/register')
  register(@Body() createUserDto: CreateUserDto): User {
    return this.authService.registerUser(createUserDto);
  }

  @Post('/logout')
  logout(): boolean {
    return this.authService.logoutUser('test-user-id');
  }

  @Patch('/me')
  updateProfile(@Body() updateUserDto: UpdateUserDto): User | null {
    return this.authService.updateProfile('test-user-id', updateUserDto);
  }
}
