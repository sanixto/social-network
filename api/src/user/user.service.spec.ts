import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';

// Mock User Entity structure
class User {
  id: string;
  username: string;
  password: string;
}

// Mock CreateUserDto structure
class CreateUserDto implements Omit<User, 'id'> {
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

// Mock UpdateUserDto structure
class UpdateUserDto {
  username?: string;
  password?: string;

  constructor(username?: string, password?: string) {
    this.username = username;
    this.password = password;
  }
}

describe('UserService', () => {
  let service: UserService;

  // Initial user data matching service default
  const initialUser: User = {
    id: 'test-user-id',
    username: 'testuser',
    password: 'password',
  };

  const mockCreateUserDto = new CreateUserDto('newuser', 'newpassword');
  const mockUpdateUserDto = new UpdateUserDto('updateduser');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----------------------------------------------------
  // create
  // ----------------------------------------------------
  describe('create', () => {
    it('should create and return a new user with a generated ID', () => {
      const newUser = service.create(mockCreateUserDto);

      expect(newUser).toHaveProperty('id');
      expect(newUser.username).toBe(mockCreateUserDto.username);
      expect(newUser.password).toBe(mockCreateUserDto.password);

      const found = service.findOne(newUser.id);
      expect(found).toEqual(newUser);
    });
  });

  // ----------------------------------------------------
  // findAll
  // ----------------------------------------------------
  describe('findAll', () => {
    it('should return an array of users including the initial user', () => {
      const users = service.findAll();
      expect(Array.isArray(users)).toBe(true);
      expect(users).toContainEqual(initialUser);
    });
  });

  // ----------------------------------------------------
  // findOne
  // ----------------------------------------------------
  describe('findOne', () => {
    it('should return the user if ID exists', () => {
      const user = service.findOne(initialUser.id);
      expect(user).toEqual(initialUser);
    });

    it('should throw HttpException with NOT_FOUND status if ID does not exist', () => {
      expect(() => service.findOne('non-existent-id')).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ----------------------------------------------------
  // update
  // ----------------------------------------------------
  describe('update', () => {
    it('should update an existing user and return the updated user', () => {
      const original = service.findOne(initialUser.id);
      expect(original.username).toBe('testuser');

      const updated = service.update(initialUser.id, mockUpdateUserDto);

      expect(updated).toBeDefined();
      expect(updated.username).toBe(mockUpdateUserDto.username);
      expect(updated.password).toBe(original.password); // password unchanged

      const persisted = service.findOne(initialUser.id);
      expect(persisted.username).toBe(mockUpdateUserDto.username);
    });

    it('should throw HttpException with NOT_FOUND status if user ID does not exist', () => {
      expect(() =>
        service.update('non-existent-id', mockUpdateUserDto),
      ).toThrow(new HttpException('User not found', HttpStatus.NOT_FOUND));
    });
  });

  // ----------------------------------------------------
  // remove
  // ----------------------------------------------------
  describe('remove', () => {
    it('should remove an existing user', () => {
      // create a temp user to remove to avoid deleting the initial test user later
      const temp = service.create(new CreateUserDto('toremove', 'pw'));
      service.remove(temp.id);

      expect(() => service.findOne(temp.id)).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw HttpException with NOT_FOUND status if user ID does not exist', () => {
      expect(() => service.remove('non-existent-id')).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
