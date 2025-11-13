import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// --- Mock Entity and DTOs (Reusing Class structure for consistency) ---

class User {
  id: string;
  username: string;
  password: string;

  // Added constructor to correctly initialize non-optional properties
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

// Now instantiate User using the new constructor
const testUser = new User('test-user-id', 'testuser', 'password');

const mockCreateDto = new CreateUserDto('newuser', 'newpassword');
const mockUpdateDto = new UpdateUserDto('new_username'); // This mock DTO has a defined username

// --- Mock Service (Define return values directly on the mock object) ---

const mockAuthService = {
  getUserById: jest.fn(),
  validateUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn(),
  updateProfile: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Record<keyof AuthService, jest.Mock>; // Explicitly type service methods as mocks

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      // Provide the mock service implementation
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    // Cast the service back to our mock type for safer mocking/assertions
    authService = module.get(AuthService);

    // Set default mock return values
    authService.getUserById.mockReturnValue(testUser);
    authService.validateUser.mockReturnValue(testUser);
    authService.registerUser.mockReturnValue({
      id: 'new-id',
      ...mockCreateDto,
    });
    authService.logoutUser.mockReturnValue(true);
    authService.updateProfile.mockReturnValue({
      ...testUser,
      username: 'new_username',
    });

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
      // Setup the return value for this specific test
      authService.getUserById.mockReturnValue(testUser);

      const result = controller.getProfile();

      expect(authService.getUserById).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual(testUser);
    });

    it('should return null if the user is not found', () => {
      authService.getUserById.mockReturnValue(null);
      const result = controller.getProfile();
      expect(result).toBeNull();
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
      // We check for properties because the returned object might be a plain object, not a User instance
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
  });

  // ----------------------------------------------------
  // 5. PATCH /auth/me (updateProfile)
  // ----------------------------------------------------
  describe('updateProfile', () => {
    it('should call authService.updateProfile with hardcoded ID and received DTO', () => {
      // Use nullish coalescing to ensure a string is passed to the User constructor
      const updatedUser: User = new User(
        testUser.id,
        mockUpdateDto.username ?? testUser.username, // Fallback to original username if undefined
        mockUpdateDto.password ?? testUser.password, // Fallback to original password if undefined
      );

      authService.updateProfile.mockReturnValue(updatedUser);

      const result = controller.updateProfile(mockUpdateDto);

      expect(authService.updateProfile).toHaveBeenCalledWith(
        'test-user-id',
        mockUpdateDto,
      );
      expect(result?.username).toBe(mockUpdateDto.username);
    });

    it('should return null if update fails (user not found)', () => {
      authService.updateProfile.mockReturnValue(null);

      const result = controller.updateProfile(mockUpdateDto);

      expect(result).toBeNull();
    });
  });
});
