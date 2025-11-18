import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

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

describe('AuthService', () => {
  let service: AuthService;

  // Initial user data for testing lookup methods
  const initialUser: User = {
    id: 'test-user-id',
    username: 'testuser',
    password: 'password',
  };

  // Mock DTOs for register and update operations
  const mockCreateUserDto = new CreateUserDto('newuser', 'newpassword');
  const mockUpdateUserDto = new UpdateUserDto('updateduser');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----------------------------------------------------
  // 1. getUserById Tests
  // ----------------------------------------------------
  describe('getUserById', () => {
    it('should return the user if ID exists', () => {
      const user = service.getUserById(initialUser.id);
      expect(user).toEqual(initialUser);
    });

    it('should throw HttpException with NOT_FOUND status if ID does not exist', () => {
      expect(() => service.getUserById('non-existent-id')).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ----------------------------------------------------
  // 2. validateUser Tests
  // ----------------------------------------------------
  describe('validateUser', () => {
    it('should return the user for valid credentials', () => {
      const user = service.validateUser(
        initialUser.username,
        initialUser.password,
      );
      expect(user).toEqual(initialUser);
    });

    it('should throw HttpException with UNAUTHORIZED status for invalid username', () => {
      expect(() =>
        service.validateUser('wrongusername', initialUser.password),
      ).toThrow(
        new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });

    it('should throw HttpException with UNAUTHORIZED status for invalid password', () => {
      expect(() =>
        service.validateUser(initialUser.username, 'wrongpassword'),
      ).toThrow(
        new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
  });

  // ----------------------------------------------------
  // 3. registerUser Tests
  // ----------------------------------------------------
  describe('registerUser', () => {
    it('should create and return a new user with a generated ID', () => {
      const newUser = service.registerUser(mockCreateUserDto);

      // Check the returned object structure and data
      expect(newUser).toHaveProperty('id');
      expect(newUser.username).toBe(mockCreateUserDto.username);
      expect(newUser.password).toBe(mockCreateUserDto.password);

      // Verify the user was actually added to the internal array
      const addedUser = service.getUserById(newUser.id);
      expect(addedUser).toEqual(newUser);
    });
  });

  // ----------------------------------------------------
  // 4. logoutUser Tests
  // ----------------------------------------------------
  describe('logoutUser', () => {
    it('should return true if the user ID exists', () => {
      const result = service.logoutUser(initialUser.id);
      expect(result).toBe(true);
    });

    it('should throw HttpException with NOT_FOUND status if user ID does not exist', () => {
      expect(() => service.logoutUser('non-existent-id')).toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  // ----------------------------------------------------
  // 5. updateProfile Tests
  // ----------------------------------------------------
  describe('updateProfile', () => {
    it('should update the username of an existing user and return the updated user', () => {
      // Get the original user
      const originalUser = service.getUserById(initialUser.id);
      expect(originalUser.username).toBe('testuser');

      const updatedUser = service.updateProfile(
        initialUser.id,
        mockUpdateUserDto,
      );

      // Check the returned object
      expect(updatedUser).toBeDefined();
      expect(updatedUser.username).toBe(mockUpdateUserDto.username);
      expect(updatedUser.password).toBe(originalUser.password); // Password should be unchanged

      // Verify the change is persisted
      const persistedUser = service.getUserById(initialUser.id);
      expect(persistedUser.username).toBe(mockUpdateUserDto.username);
    });

    it('should throw HttpException with NOT_FOUND status if user ID does not exist', () => {
      expect(() =>
        service.updateProfile('non-existent-id', mockUpdateUserDto),
      ).toThrow(new HttpException('User not found', HttpStatus.NOT_FOUND));
    });
  });
});
