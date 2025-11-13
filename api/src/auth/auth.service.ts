import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  private readonly users: User[] = [
    { id: 'test-user-id', username: 'testuser', password: 'password' },
  ];

  getUserById(userId: string): User | null {
    const user = this.users.find((user) => user.id === userId);
    return user || null;
  }

  validateUser(username: string, password: string): User | null {
    const user = this.users.find(
      (user) => user.username === username && user.password === password,
    );
    return user || null;
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
    return this.users.some((user) => user.id === userId);
  }

  updateProfile(userId: string, updateUserDto: UpdateUserDto): User | null {
    const user = this.users.find((user) => user.id === userId);
    if (user) {
      Object.assign(user, updateUserDto);
      console.log(this.users);
      return user;
    }
    return null;
  }
}
