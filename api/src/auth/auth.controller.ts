import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { type UserWithoutPassword } from '../user/types/user.types';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getMe(): UserWithoutPassword {
    return this.authService.getMe('0a3fd84a-b19f-4818-afbf-0173330f50de');
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

  @UseGuards(AuthGuard)
  @Post('logout')
  logout(): boolean {
    return this.authService.logoutUser('0a3fd84a-b19f-4818-afbf-0173330f50de');
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  updateMe(@Body() updateUserDto: UpdateUserDto): UserWithoutPassword {
    return this.authService.updateMe(
      '0a3fd84a-b19f-4818-afbf-0173330f50de',
      updateUserDto,
    );
  }
}
