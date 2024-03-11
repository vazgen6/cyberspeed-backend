import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { ChatRoom } from '../models/chat-room.schema';
import { Chat } from '../models/chat.schema';

const mockChatRoomModel = () => ({
  aggregate: jest.fn(),
  findOne: jest.fn().mockImplementation(() => ({
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(null),
  })),
  create: jest.fn(),
  updateOne: jest.fn(),
  populate: jest.fn().mockReturnThis(),
});
const mockChatModel = () => ({
  find: jest.fn(),
  create: jest.fn(),
});

describe('ChatService', () => {
  let service: ChatService;
  let chatRoomModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(ChatRoom.name),
          useFactory: mockChatRoomModel,
        },
        {
          provide: getModelToken(Chat.name),
          useFactory: mockChatModel,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRoomModel = module.get(getModelToken(ChatRoom.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of chat rooms', async () => {
    chatRoomModel.aggregate.mockResolvedValue(['chatRoom1', 'chatRoom2']); // Mock implementation
    const result = await service.getAllChatRooms('65ed9f0bdbf20f400e429c0f', {
      skip: 0,
      pageSize: 10,
    });
    expect(result).toEqual(['chatRoom1', 'chatRoom2']);
    expect(chatRoomModel.aggregate).toHaveBeenCalled();
  });

  it('should create a new chat successfully', async () => {
    const newGroup = {
      participants: ['65ed9f0bdbf20f400e429c0f', '65edac8fc584513e36b8c33a'],
      groupName: 'testGroup',
      type: 'group',
    };
    chatRoomModel.findOne.mockResolvedValueOnce(null);

    chatRoomModel.create.mockResolvedValue({
      ...newGroup,
      _id: 'newChatId',
    });

    const newChat = await service.createChat(newGroup);
    expect(newChat).toBeDefined();
    expect(chatRoomModel.findOne).toHaveBeenCalledWith({
      groupName: 'testGroup',
    });
    expect(chatRoomModel.create).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if chat with the same name already exists', async () => {
    chatRoomModel.findOne.mockResolvedValue({ groupName: 'existingGroup' });

    await expect(
      service.createChat({
        participants: ['65ed9f0bdbf20f400e429c0f', '65edac8fc584513e36b8c33a'],
        groupName: 'existingGroup',
        type: 'group',
      }),
    ).rejects.toThrow('Chat with this name already exist');
  });

  it('should throw an error if trying to create a non-group chat with more than 2 participants', async () => {
    await expect(
      service.createChat({
        participants: [
          '65ed9f0bdbf20f400e429c0f',
          '65edac8fc584513e36b8c33a',
          '65edaae697e75c976aad1c69',
        ],
        groupName: 'newGroup',
        type: 'private',
      }),
    ).rejects.toThrow(
      'Please select group type since you have more than 2 participants',
    );
  });
});
