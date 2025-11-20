import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { type UuidGenerator } from '../common/uuid/uuid-generator.interface';
import { UUID_GENERATOR_TOKEN } from '../common/uuid/uuid.tokens';

const testUUID = '0a3fd84a-b19f-4818-afbf-0173330f50de';
@Injectable()
export class UserService {
  private readonly users: User[] = [
    { id: testUUID, username: 'testuser', password: 'password' },
  ];

  constructor(
    @Inject(UUID_GENERATOR_TOKEN)
    private readonly uuidGenerator: UuidGenerator,
  ) {}

  create(createUserDto: CreateUserDto) {
    const newUser: User = {
      id: this.uuidGenerator.generate(),
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(user, updateUserDto);
    return user;
  }

  remove(id: string) {
    const userIndex = this.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    this.users.splice(userIndex, 1);
  }
}
