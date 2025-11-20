import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UUID_GENERATOR_TOKEN } from '../common/uuid/uuid.tokens';

// --- Mock Entity and DTOs ---

class User {
  id: string;
  username: string;
  password: string;

  constructor(id: string, username: string, password: string) {
    this.id = id;
    this.username = username;
    this.password = password;
  }
}

class CreateUserDto {
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

class UpdateUserDto {
  username?: string;
  password?: string;

  constructor(username?: string, password?: string) {
    this.username = username;
    this.password = password;
  }
}

// --- Mock Data ---

const testUser = new User('user-id-1', 'alice', 'secret');
const mockCreateDto = new CreateUserDto('bob', 'bobpass');
const mockUpdateDto = new UpdateUserDto('alice_updated', 'newsecret');

// --- Mock Service & UUID Generator ---

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUuidGenerator = {
  generate: jest.fn().mockReturnValue('mock-uuid'),
};

describe('UserController', () => {
  let controller: UserController;
  let userService: Record<keyof UserService, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: UUID_GENERATOR_TOKEN,
          useValue: mockUuidGenerator,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ----------------------------------------------------
  // 1. POST /user (create)
  // ----------------------------------------------------
  describe('create', () => {
    it('should call userService.create with received DTO and return new user', () => {
      const created = new User(
        'new-id',
        mockCreateDto.username,
        mockCreateDto.password,
      );
      userService.create.mockReturnValue(created);

      const result = controller.create(mockCreateDto);

      expect(userService.create).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(created);
    });
  });

  // ----------------------------------------------------
  // 2. GET /user (findAll)
  // ----------------------------------------------------
  describe('findAll', () => {
    it('should call userService.findAll and return array of users', () => {
      const users = [testUser];
      userService.findAll.mockReturnValue(users);

      const result = controller.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  // ----------------------------------------------------
  // 3. GET /user/:id (findOne)
  // ----------------------------------------------------
  describe('findOne', () => {
    it('should call userService.findOne with id and return the user', () => {
      userService.findOne.mockReturnValue(testUser);

      const result = controller.findOne(testUser.id);

      expect(userService.findOne).toHaveBeenCalledWith(testUser.id);
      expect(result).toEqual(testUser);
    });

    it('should throw HttpException with NOT_FOUND status if user is not found', () => {
      userService.findOne.mockImplementation(() => {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      });

      expect(() => controller.findOne('missing-id')).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ----------------------------------------------------
  // 4. PATCH /user/:id (update)
  // ----------------------------------------------------
  describe('update', () => {
    it('should call userService.update with id and DTO and return updated user', () => {
      const updated = new User(
        testUser.id,
        mockUpdateDto.username ?? testUser.username,
        mockUpdateDto.password ?? testUser.password,
      );
      userService.update.mockReturnValue(updated);

      const result = controller.update(testUser.id, mockUpdateDto);

      expect(userService.update).toHaveBeenCalledWith(
        testUser.id,
        mockUpdateDto,
      );
      expect(result).toEqual(updated);
      expect(result.username).toBe(mockUpdateDto.username);
    });

    it('should throw HttpException with NOT_FOUND status if user is not found', () => {
      userService.update.mockImplementation(() => {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      });

      expect(() => controller.update('missing-id', mockUpdateDto)).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ----------------------------------------------------
  // 5. DELETE /user/:id (remove)
  // ----------------------------------------------------
  describe('remove', () => {
    it('should call userService.remove with id and return undefined', () => {
      userService.remove.mockReturnValue(undefined);

      const result = controller.remove(testUser.id);

      expect(userService.remove).toHaveBeenCalledWith(testUser.id);
      expect(result).toBeUndefined();
    });

    it('should throw HttpException with NOT_FOUND status if user is not found', () => {
      userService.remove.mockImplementation(() => {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      });

      expect(() => controller.remove('missing-id')).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
