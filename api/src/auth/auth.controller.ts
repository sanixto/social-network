import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { type UserWithoutPassword } from '../user/types/user.types';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  getMe(): UserWithoutPassword {
    return this.authService.getMe('test-user-id');
  }

  @Post('login')
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    const user = this.authService.validate(
      signInDto.username,
      signInDto.password,
    );
    return this.authService.signIn(user);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto): UserWithoutPassword {
    return this.authService.register(createUserDto);
  }

  @Post('logout')
  logout(): boolean {
    return this.authService.logoutUser('test-user-id');
  }

  @Patch('me')
  updateMe(@Body() updateUserDto: UpdateUserDto): UserWithoutPassword {
    return this.authService.updateMe('test-user-id', updateUserDto);
  }
}
