import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UUID_GENERATOR_TOKEN } from '../common/uuid/uuid.tokens';

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
  let mockGenerator: { generate: jest.Mock<string, []> };

  // Must match the test default in the service file
  const testUUID = '0a3fd84a-b19f-4818-afbf-0173330f50de';

  // Initial user data matching service default
  const initialUser: User = {
    id: testUUID,
    username: 'testuser',
    password: 'password',
  };

  const mockCreateUserDto = new CreateUserDto('newuser', 'newpassword');
  const mockUpdateUserDto = new UpdateUserDto('updateduser');

  beforeEach(async () => {
    // Provide a mock uuid generator that returns unique ids per call
    let idCounter = 0;
    mockGenerator = {
      generate: jest.fn(() => `generated-${++idCounter}`),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UUID_GENERATOR_TOKEN, useValue: mockGenerator },
      ],
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

      expect(mockGenerator.generate).toHaveBeenCalled();
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
