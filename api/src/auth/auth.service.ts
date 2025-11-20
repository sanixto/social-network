import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UUID_GENERATOR_TOKEN } from '../common/uuid/uuid.tokens';
import { type UuidGenerator } from '../common/uuid/uuid-generator.interface';

const testUUID = '0a3fd84a-b19f-4818-afbf-0173330f50de';
@Injectable()
export class AuthService {
  private readonly users: User[] = [
    { id: testUUID, username: 'testuser', password: 'password' },
  ];

  constructor(
    @Inject(UUID_GENERATOR_TOKEN) private readonly uuidGenerator: UuidGenerator,
  ) {}

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
      id: this.uuidGenerator.generate(),
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
