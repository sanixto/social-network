import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { type UserWithoutPassword } from '../user/types/user.types';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from './decorators/user.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  getMe(@User('sub') userId: string): UserWithoutPassword {
    return this.authService.getMe(userId);
  }

  @Public()
  @Post('login')
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    const user = this.authService.validate(
      signInDto.username,
      signInDto.password,
    );
    return this.authService.signIn(user);
  }

  @Public()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto): UserWithoutPassword {
    return this.authService.register(createUserDto);
  }

  @Post('logout')
  logout(@User('sub') userId: string): boolean {
    return this.authService.logoutUser(userId);
  }

  @Patch('me')
  updateMe(
    @User('sub') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): UserWithoutPassword {
    return this.authService.updateMe(userId, updateUserDto);
  }
}
