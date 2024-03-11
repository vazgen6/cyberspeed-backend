import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatDto } from './chat.dto';
import { PaginationDto } from 'src/common/pagination.dto';

jest.mock('./chat.service');

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: Partial<ChatService>;

  beforeEach(async () => {
    chatService = {
      createChat: jest.fn(),
      getAllChatRooms: jest.fn(),
      getOneRoomById: jest.fn(),
      updateChat: jest.fn(),
      deleteChat: jest.fn(),
      getAllChatMessages: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [{ provide: ChatService, useValue: chatService }],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should successfully create a chat', async () => {
    const req = { user: { _id: 'userId' } };
    const chatDto: ChatDto = {
      participants: ['participantId'],
      groupName: 'Test Group',
      type: 'private',
    };
    const expectedResponse = {
      ...chatDto,
      participants: [...chatDto.participants, req.user._id],
    };

    (chatService.createChat as jest.Mock).mockResolvedValue(expectedResponse);

    expect(await controller.create(chatDto, req)).toEqual(expectedResponse);
    expect(chatService.createChat).toHaveBeenCalledWith(expectedResponse);
  });

  it('should return all chat rooms for a user', async () => {
    const user = { _id: 'userId' };
    const pagination: PaginationDto = { skip: 0, pageSize: 10 };
    const expectedResponse = [{ groupName: 'Test Group' }];

    jest
      .spyOn(chatService, 'getAllChatRooms')
      .mockResolvedValue(expectedResponse);

    expect(await controller.getAll({ user } as any, pagination)).toEqual(
      expectedResponse,
    );
    expect(chatService.getAllChatRooms).toHaveBeenCalledWith(
      user._id,
      pagination,
    );
  });

  it('should handle errors when creating a chat fails', async () => {
    const req = { user: { _id: 'userId' } };
    const chatDto: ChatDto = {
      participants: ['participantId'],
      groupName: 'Test Group',
      type: 'private',
    };

    (chatService.createChat as any).mockRejectedValue(
      new Error('Create chat failed'),
    );

    await expect(controller.create(chatDto, req)).rejects.toThrow(
      'Create chat failed',
    );
  });
});
