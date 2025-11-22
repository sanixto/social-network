import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

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
  let mockUserService: {
    findOne: jest.Mock<User | undefined>;
    findOneByUsername: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };

  // This must match the initial test user in user.service.ts
  const TEST_UUID = '0a3fd84a-b19f-4818-afbf-0173330f50de';

  // Initial user data for testing lookup methods
  const initialUser: User = {
    id: TEST_UUID,
    username: 'testuser',
    password: 'password',
  };

  // User shape without password for assertions
  const initialUserNoPassword = {
    id: initialUser.id,
    username: initialUser.username,
  };

  // Mock DTOs for register and update operations
  const mockCreateUserDto = new CreateUserDto('newuser', 'newpassword');
  const mockUpdateUserDto = new UpdateUserDto('updateduser');

  // Mock generated id
  const mockGeneratedId = 'generated-uuid-1234';

  beforeEach(async () => {
    // internal store to simulate user persistence
    const users: User[] = [{ ...initialUser }];

    mockUserService = {
      findOne: jest.fn((id: string): User | undefined => {
        const u = users.find((x) => x.id === id);
        if (!u) throw new NotFoundException('User not found');
        return u;
      }),
      findOneByUsername: jest.fn((username: string) => {
        const u = users.find((x) => x.username === username);
        if (!u) throw new NotFoundException('User not found');
        return u;
      }),
      create: jest.fn((dto: CreateUserDto) => {
        const newUser: User = { id: mockGeneratedId, ...dto };
        users.push(newUser);
        return newUser;
      }),
      update: jest.fn((id: string, dto: UpdateUserDto) => {
        const u = users.find((x) => x.id === id);
        if (!u) throw new NotFoundException('User not found');
        Object.assign(u, dto);
        return u;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----------------------------------------------------
  // getMe
  // ----------------------------------------------------
  describe('getMe', () => {
    it('should return the user without password if ID exists', () => {
      const user = service.getMe(initialUser.id);
      expect(user).toEqual(initialUserNoPassword);
      expect((user as User).password).toBeUndefined();
      expect(mockUserService.findOne).toHaveBeenCalledWith(initialUser.id);
    });

    it('should throw NotFoundException if ID does not exist', () => {
      expect(() => service.getMe('non-existent-id')).toThrow(NotFoundException);
    });
  });

  // ----------------------------------------------------
  // validate
  // ----------------------------------------------------
  describe('validate', () => {
    it('should return the user without password for valid credentials', () => {
      const user = service.validate(initialUser.username, initialUser.password);
      expect(user).toEqual(initialUserNoPassword);
      expect((user as User).password).toBeUndefined();
      expect(mockUserService.findOneByUsername).toHaveBeenCalledWith(
        initialUser.username,
      );
    });

    it('should throw NotFoundException for invalid username', () => {
      expect(() =>
        service.validate('wrongusername', initialUser.password),
      ).toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException for invalid password', () => {
      expect(() =>
        service.validate(initialUser.username, 'wrongpassword'),
      ).toThrow(UnauthorizedException);
    });
  });

  // ----------------------------------------------------
  // register
  // ----------------------------------------------------
  describe('register', () => {
    it('should create and return a new user without password and call userService.create', () => {
      const newUser = service.register(mockCreateUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(newUser).toHaveProperty('id', mockGeneratedId);
      expect(newUser).toHaveProperty('username', mockCreateUserDto.username);
      expect((newUser as User).password).toBeUndefined();

      // new user should be retrievable via userService.findOne
      const added = mockUserService.findOne(mockGeneratedId);
      expect(added).toEqual({
        id: mockGeneratedId,
        username: mockCreateUserDto.username,
        password: mockCreateUserDto.password,
      });
    });
  });

  // ----------------------------------------------------
  // logoutUser
  // ----------------------------------------------------
  describe('logoutUser', () => {
    it('should return true if the user ID exists', () => {
      const result = service.logoutUser(initialUser.id);
      expect(result).toBe(true);
      expect(mockUserService.findOne).toHaveBeenCalledWith(initialUser.id);
    });

    it('should throw NotFoundException if user ID does not exist', () => {
      expect(() => service.logoutUser('non-existent-id')).toThrow(
        NotFoundException,
      );
    });
  });

  // ----------------------------------------------------
  // updateMe
  // ----------------------------------------------------
  describe('updateMe', () => {
    it('should update the username of an existing user and return the updated user without password', () => {
      const original = mockUserService.findOne(initialUser.id);
      expect(original?.username).toBe('testuser');

      const updated = service.updateMe(initialUser.id, mockUpdateUserDto);

      expect(updated).toBeDefined();
      expect(updated.username).toBe(mockUpdateUserDto.username);
      expect((updated as User).password).toBeUndefined();

      const persisted = mockUserService.findOne(initialUser.id);
      expect(persisted?.username).toBe(mockUpdateUserDto.username);
    });

    it('should throw NotFoundException if user ID does not exist', () => {
      expect(() =>
        service.updateMe('non-existent-id', mockUpdateUserDto),
      ).toThrow(NotFoundException);
    });
  });
});
