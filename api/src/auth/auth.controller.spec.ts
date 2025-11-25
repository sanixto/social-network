import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';

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

const testUser = new User(
  '0a3fd84a-b19f-4818-afbf-0173330f50de',
  'testuser',
  'Password1!',
);
const testUserNoPassword = { id: testUser.id, username: testUser.username };
const mockCreateDto = new CreateUserDto('newuser', 'newpassword');
const mockUpdateDto = new UpdateUserDto('new_username');

// --- Mock Service (updated API) ---

const mockAuthService = {
  getMe: jest.fn(),
  validate: jest.fn(),
  signIn: jest.fn(),
  register: jest.fn(),
  logoutUser: jest.fn(),
  updateMe: jest.fn(),
};

// simple guard mock to avoid having to instantiate the real AuthGuard (which requires JwtService)
const mockGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        // Provide a mock JwtService so AuthGuard's dependencies can be resolved if instantiated
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({
              sub: testUser.id,
              username: testUser.username,
            }),
          },
        },
        {
          provide: AuthGuard,
          useValue: mockGuard,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ----------------------------------------------------
  // GET /auth/me (getMe)
  // ----------------------------------------------------
  describe('getMe', () => {
    it('should call authService.getMe with user id and return the user without password', () => {
      authService.getMe.mockReturnValue(testUserNoPassword);

      const result = controller.getMe(testUser.id);

      expect(authService.getMe).toHaveBeenCalledWith(testUser.id);
      expect(result).toEqual(testUserNoPassword);
    });

    it('should throw NotFoundException if user is not found', () => {
      authService.getMe.mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      expect(() => controller.getMe(testUser.id)).toThrow(NotFoundException);
    });
  });

  // ----------------------------------------------------
  // POST /auth/login (signIn)
  // ----------------------------------------------------
  describe('signIn', () => {
    it('should call authService.validate with provided credentials and return access_token from authService.signIn', async () => {
      authService.validate.mockReturnValue(testUserNoPassword);
      authService.signIn.mockResolvedValue({ access_token: 'jwt-token-123' });

      const result = await controller.signIn({
        username: 'testuser',
        password: 'Password1!',
      });

      expect(authService.validate).toHaveBeenCalledWith(
        'testuser',
        'Password1!',
      );
      expect(authService.signIn).toHaveBeenCalledWith(testUserNoPassword);
      expect(result).toEqual({ access_token: 'jwt-token-123' });
    });

    it('should throw NotFoundException for invalid username', async () => {
      authService.validate.mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(
        controller.signIn({ username: 'wrong', password: 'Password1!' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      authService.validate.mockImplementation(() => {
        throw new UnauthorizedException('Invalid username or password');
      });

      await expect(
        controller.signIn({ username: 'testuser', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ----------------------------------------------------
  // POST /auth/register (register)
  // ----------------------------------------------------
  describe('register', () => {
    it('should call authService.register with the received DTO and return the new user without password', () => {
      const mockResult = { id: 'new-id', username: mockCreateDto.username };
      authService.register.mockReturnValue(mockResult);

      const result = controller.register(mockCreateDto);

      expect(authService.register).toHaveBeenCalledWith(mockCreateDto);
      expect(result).toEqual(mockResult);
    });
  });

  // ----------------------------------------------------
  // POST /auth/logout (logout)
  // ----------------------------------------------------
  describe('logout', () => {
    it('should call authService.logoutUser with user id and return true', () => {
      authService.logoutUser.mockReturnValue(true);

      const result = controller.logout(testUser.id);

      expect(authService.logoutUser).toHaveBeenCalledWith(testUser.id);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if user is not found', () => {
      authService.logoutUser.mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      expect(() => controller.logout(testUser.id)).toThrow(NotFoundException);
    });
  });

  // ----------------------------------------------------
  // PATCH /auth/me (updateMe)
  // ----------------------------------------------------
  describe('updateMe', () => {
    it('should call authService.updateMe with user id and received DTO and return updated user without password', () => {
      const updatedUser = { id: testUser.id, username: mockUpdateDto.username };
      authService.updateMe.mockReturnValue(updatedUser);

      const result = controller.updateMe(testUser.id, mockUpdateDto);

      expect(authService.updateMe).toHaveBeenCalledWith(
        testUser.id,
        mockUpdateDto,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user is not found', () => {
      authService.updateMe.mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      expect(() => controller.updateMe(testUser.id, mockUpdateDto)).toThrow(
        NotFoundException,
      );
    });
  });
});
