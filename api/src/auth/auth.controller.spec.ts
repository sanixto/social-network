import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return user profile data', () => {
    expect(controller.getProfile()).toBe('User profile data');
  });

  it('should return login success message', () => {
    expect(controller.login()).toBe('Login successful!');
  });

  it('should return registration success message', () => {
    expect(controller.register()).toBe('Registration successful!');
  });

  it('should return logout success message', () => {
    expect(controller.logout()).toBe('Logout successful!');
  });
});
