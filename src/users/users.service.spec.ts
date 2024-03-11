import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../models/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel;

  beforeEach(async () => {
    const createUserMock = jest.fn().mockImplementation((dto) => dto);

    // Mock for our UserModel
    mockUserModel = {
      create: createUserMock,
      findOne: jest.fn(),
      findById: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const userDto = { username: 'test', password: 'password' };
    mockUserModel.findOne.mockReturnValue(null);
    mockUserModel.findById.mockReturnValue(userDto);
    const user = await service.createUser(userDto);
    expect(user).toEqual(userDto);
  });

  it('should throw an error if username is taken', async () => {
    const userDto = { username: 'test', password: 'password' };
    mockUserModel.findOne.mockReturnValue(userDto);
    await expect(service.createUser(userDto)).rejects.toThrow(
      'username already taken',
    );
  });
});
