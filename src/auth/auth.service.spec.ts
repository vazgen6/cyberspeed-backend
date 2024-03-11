import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as hashUtils from '../utils/hash';

jest.mock('../utils/hash.ts', () => ({
  compareHash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;

  beforeEach(async () => {
    const usersServiceMock = {
      provide: UsersService,
      useFactory: () => ({
        findByUsername: jest.fn(),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, usersServiceMock],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userService).toBeDefined();
  });

  it('should return a token', async () => {
    process.env.SECRET_KEY = 'secret'; // Ensure this matches your env setup
    const username = 'testuser';
    const token = await service.signPayload(username);
    expect(typeof token).toBe('string');
    expect(token).not.toBe('');
  });

  it('should return a user if it exists', async () => {
    const username = 'testuser';
    const mockUser = { username, password: 'hashedpassword' };
    jest
      .spyOn(userService, 'findByUsername')
      .mockResolvedValue(mockUser as any);

    const result = await service.validateUser(username);
    expect(result).toEqual(mockUser);
    expect(userService.findByUsername).toHaveBeenCalledWith(username);
  });

  it('should return true if password matches', async () => {
    const username = 'testuser';
    const password = 'password';
    const mockUser = { username, password: 'hashedpassword' };

    jest
      .spyOn(userService, 'findByUsername')
      .mockResolvedValue(mockUser as any);
    (hashUtils.compareHash as jest.Mock).mockResolvedValue(true);

    const isPasswordValid = await service.checkPassword(username, password);
    expect(isPasswordValid).toBe(true);
  });

  it('should throw NotFoundException if user not found', async () => {
    const username = 'nonexistentuser';
    const password = 'password';

    jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

    await expect(service.checkPassword(username, password)).rejects.toThrow(
      'User not found',
    );
  });
});
