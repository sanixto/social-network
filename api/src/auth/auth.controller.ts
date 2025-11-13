import { Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('/me')
  getProfile(): string {
    return 'User profile data';
  }

  @Post('/login')
  login(): string {
    return 'Login successful!';
  }

  @Post('/register')
  register(): string {
    return 'Registration successful!';
  }

  @Post('/logout')
  logout(): string {
    return 'Logout successful!';
  }
}
