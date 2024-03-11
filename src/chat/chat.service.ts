import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { PaginationDto } from '../common/pagination.dto';
import { IChat } from '../interfaces/IChat';
import { IChatRoom } from '../interfaces/IChatRoom';
import { ChatRoom } from '../models/chat-room.schema';
import { Chat } from '../models/chat.schema';
import { ChatDto } from './chat.dto';

@Injectable()
export class ChatService {
  private populateFieldsChat = [
    { path: 'participantsUsers', select: ['username'] },
  ];
  constructor(
    @InjectModel(ChatRoom.name)
    private chatRoomModel: Model<IChatRoom>,
    @InjectModel(Chat.name)
    private chatMessageModel: Model<IChat>,
  ) {}

  public async getAllChatRooms(userId: string, pagination: PaginationDto) {
    const pipeline: PipelineStage[] = [
      { $match: { participants: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'chatmessages',
          let: { convId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$$convId', '$chatId'] } } },
            { $sort: { _id: -1 } },
            { $limit: 1 },
          ],
          as: 'lastMessage',
        },
      },
      {
        $unwind: {
          path: '$lastMessage',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.senderId',
          foreignField: '_id',
          as: 'lastMessage.sender',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participantsUsers',
        },
      },
      {
        $unwind: {
          path: '$lastMessage.sender',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'lastMessage.sender.password': 0,
          'lastMessage.sender.role': 0,
          'lastMessage.sender.isEmailVerified': 0,
          'lastMessage.sender.isActive': 0,
          'lastMessage.senderId': 0,
          'lastMessage.chatId': 0,
          'participantsUsers.password': 0,
        },
      },
      { $skip: pagination.skip },
      { $limit: pagination.pageSize },
    ];

    return await this.chatRoomModel.aggregate(pipeline, {});
  }

  public async getOneRoomById(chatId: string, userId?: string) {
    const chat = await this.chatRoomModel
      .findOne({ _id: chatId })
      .populate(this.populateFieldsChat);
    if (!chat) {
      throw new HttpException('Chat Room not found', HttpStatus.NOT_FOUND);
    }
    if (userId && !chat.participants.includes(userId)) {
      throw new HttpException('Chat Room not found', HttpStatus.NOT_FOUND);
    }
    return chat;
  }

  public async createChat(chat: ChatDto) {
    if (chat.participants.length > 2 && chat.type !== 'group') {
      throw new HttpException(
        'Please select group type since you have more than 2 participants',
        HttpStatus.BAD_REQUEST,
      );
    }
    const existingChat = await this.chatRoomModel.findOne({
      groupName: chat.groupName,
    });
    if (existingChat) {
      throw new HttpException(
        'Chat with this name already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const createdChat = await this.chatRoomModel.create(chat);
    return await this.getOneRoomById(createdChat._id);
  }

  public async updateChat(chat: ChatDto, chatId: string) {
    if (chat.participants.length > 2 && chat.type !== 'group') {
      throw new HttpException(
        'Please select group type since you have more than 2 participants',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.chatRoomModel.updateOne({ _id: chatId }, chat);
    return await this.getOneRoomById(chatId);
  }

  public async deleteChat(chatId: string, userId: string) {
    const existingChat = await this.getOneRoomById(chatId, userId);
    await this.chatRoomModel.updateOne(
      { _id: chatId },
      {
        participants: existingChat.participants.filter(
          (participant) => participant.toString() !== userId.toString(),
        ),
      },
    );
    return {
      success: true,
      message: 'You have been successfully removed from this chat',
    };
  }

  public async getAllChatMessages(
    chatId: string,
    userId: string,
    pagination: PaginationDto,
  ) {
    const existingChat = await this.getOneRoomById(chatId, userId);
    const chatMessages = await this.chatMessageModel
      .find({ chatId })
      .sort('-createdAt')
      .skip(pagination.skip)
      .limit(pagination.pageSize);
    return {
      sucesss: true,
      chat: existingChat,
      messages: chatMessages.reverse(),
    };
  }

  public async getMyChatMessage(
    chatRoomId: string,
    messageId: string,
    userId: string,
  ) {
    const message = await this.chatMessageModel.findOne({
      _id: messageId,
      chatRoomId,
    });
    if (!message) {
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
    }

    if (message.senderId.toString() !== userId.toString()) {
      throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
    }
    return message;
  }

  public async createChatMessage(
    chatRoomId: string,
    senderId: string,
    message: string,
  ) {
    const createdMessage = await this.chatMessageModel.create({
      chatRoomId,
      senderId,
      message,
    });
    return this.getMyChatMessage(chatRoomId, createdMessage._id, senderId);
  }
}
