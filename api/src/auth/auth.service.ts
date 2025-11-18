import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  private readonly users: User[] = [
    { id: 'test-user-id', username: 'testuser', password: 'password' },
  ];

  getUserById(userId: string): User {
    const user = this.users.find((user) => user.id === userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  validateUser(username: string, password: string): User {
    const user = this.users.find(
      (user) => user.username === username && user.password === password,
    );

    if (!user) {
      throw new HttpException(
        'Invalid username or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  registerUser(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: createUserDto.username,
      password: createUserDto.password,
    };
    this.users.push(newUser);
    return newUser;
  }

  logoutUser(userId: string): boolean {
    const userExists = this.users.some((user) => user.id === userId);

    if (!userExists) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return true;
  }

  updateProfile(userId: string, updateUserDto: UpdateUserDto): User {
    const user = this.users.find((user) => user.id === userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(user, updateUserDto);
    return user;
  }
}
