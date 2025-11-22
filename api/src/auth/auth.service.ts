import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UserService } from '../user/user.service';
import { type UserWithoutPassword } from '../user/types/user.types';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  getMe(userId: string): UserWithoutPassword {
    const user = this.userService.findOne(userId);
    return this.excludePassword(user);
  }

  validate(username: string, password: string) {
    const user = this.userService.findOneByUsername(username);

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.excludePassword(user);
  }

  async signIn(user: UserWithoutPassword): Promise<AuthResponseDto> {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  register(createUserDto: CreateUserDto): UserWithoutPassword {
    const newUser = this.userService.create(createUserDto);
    return this.excludePassword(newUser);
  }

  logoutUser(userId: string): boolean {
    return !!this.userService.findOne(userId);
  }

  updateMe(userId: string, updateUserDto: UpdateUserDto): UserWithoutPassword {
    const user = this.userService.update(userId, updateUserDto);
    return this.excludePassword(user);
  }

  private excludePassword(user: User): UserWithoutPassword {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
