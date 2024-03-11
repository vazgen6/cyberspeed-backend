import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

jest.mock('./auth.service');
jest.mock('../users/users.service');

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UsersService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a user and return a token', async () => {
    const mockUser = { username: 'Vazgen', password: 'Awesome Dev' };
    const mockToken = 'Cyberspeed token';
    const registerDto: RegisterDTO = mockUser;

    jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser as any);
    jest.spyOn(authService, 'signPayload').mockResolvedValue(mockToken);

    const result = await controller.register(registerDto);
    expect(result).toEqual({ user: mockUser, token: mockToken });
    expect(usersService.createUser).toHaveBeenCalledWith(registerDto);
    expect(authService.signPayload).toHaveBeenCalledWith(mockUser.username);
  });

  it('should login a user and return a token', async () => {
    const mockUser = { username: 'Vazgen', password: 'Awesome Dev' };
    const mockToken = 'Cyberspeed token';
    const loginDto: LoginDTO = mockUser;

    jest.spyOn(usersService, 'findByLogin').mockResolvedValue(mockUser as any);
    jest.spyOn(authService, 'signPayload').mockResolvedValue(mockToken);

    const result = await controller.login(loginDto);
    expect(result).toEqual({ user: mockUser, token: mockToken });
    expect(usersService.findByLogin).toHaveBeenCalledWith(loginDto);
    expect(authService.signPayload).toHaveBeenCalledWith(mockUser.username);
  });

  it('should return hidden information', async () => {
    expect(await controller.hiddenInformation()).toBe('hidden information');
  });

  it('should return public information', async () => {
    expect(await controller.publicInformation()).toBe(
      'this can be seen by anyone',
    );
  });
});
