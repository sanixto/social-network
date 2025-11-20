import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
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

const testUser = new User('test-user-id', 'testuser', 'password');
const mockCreateDto = new CreateUserDto('newuser', 'newpassword');
const mockUpdateDto = new UpdateUserDto('new_username');

// --- Mock Service ---

const mockAuthService = {
  getUserById: jest.fn(),
  validateUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn(),
  updateProfile: jest.fn(),
};

// --- Mock UUID generator ---
const mockUuidGenerator = {
  generate: jest.fn().mockReturnValue('test-user-id'),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Record<keyof typeof mockAuthService, jest.Mock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UUID_GENERATOR_TOKEN,
          useValue: mockUuidGenerator,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ----------------------------------------------------
  // 1. GET /auth/me (getProfile)
  // ----------------------------------------------------
  describe('getProfile', () => {
    it('should call authService.getUserById with hardcoded ID and return the user', () => {
      authService.getUserById.mockReturnValue(testUser);

      const result = controller.getProfile();

      expect(authService.getUserById).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual(testUser);
    });

    it('should throw HttpException with NOT_FOUND status if user is not found', () => {
      authService.getUserById.mockImplementation(() => {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      });

      expect(() => controller.getProfile()).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ----------------------------------------------------
  // 2. POST /auth/login (login)
  // ----------------------------------------------------
  describe('login', () => {
    it('should call authService.validateUser with hardcoded credentials and return the user', () => {
      authService.validateUser.mockReturnValue(testUser);

      const result = controller.login();

      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser',
        'password',
      );
      expect(result).toEqual(testUser);
    });

    it('should throw HttpException with UNAUTHORIZED status for invalid credentials', () => {
      authService.validateUser.mockImplementation(() => {
        throw new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        );
      });

      expect(() => controller.login()).toThrow(
        new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
  });

  // ----------------------------------------------------
  // 3. POST /auth/register (register)
  // ----------------------------------------------------
  describe('register', () => {
    it('should call authService.registerUser with the received DTO and return the new user', () => {
      const mockResult: User = new User(
        'new-id',
        mockCreateDto.username,
        mockCreateDto.password,
      );
      authService.registerUser.mockReturnValue(mockResult);

      const result = controller.register(mockCreateDto);

      expect(authService.registerUser).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockResult);
    });
  });

  // ----------------------------------------------------
  // 4. POST /auth/logout (logout)
  // ----------------------------------------------------
  describe('logout', () => {
    it('should call authService.logoutUser with hardcoded ID and return true', () => {
      authService.logoutUser.mockReturnValue(true);

      const result = controller.logout();

      expect(authService.logoutUser).toHaveBeenCalledWith('test-user-id');
      expect(result).toBe(true);
    });

    it('should throw HttpException with NOT_FOUND status if user is not found', () => {
      authService.logoutUser.mockImplementation(() => {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      });

      expect(() => controller.logout()).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ----------------------------------------------------
  // 5. PATCH /auth/me (updateProfile)
  // ----------------------------------------------------
  describe('updateProfile', () => {
    it('should call authService.updateProfile with hardcoded ID and received DTO', () => {
      const updatedUser: User = new User(
        testUser.id,
        mockUpdateDto.username ?? testUser.username,
        mockUpdateDto.password ?? testUser.password,
      );

      authService.updateProfile.mockReturnValue(updatedUser);

      const result = controller.updateProfile(mockUpdateDto);

      expect(authService.updateProfile).toHaveBeenCalledWith(
        'test-user-id',
        mockUpdateDto,
      );
      expect(result.username).toBe(mockUpdateDto.username);
    });

    it('should throw HttpException with NOT_FOUND status if user is not found', () => {
      authService.updateProfile.mockImplementation(() => {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      });

      expect(() => controller.updateProfile(mockUpdateDto)).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
