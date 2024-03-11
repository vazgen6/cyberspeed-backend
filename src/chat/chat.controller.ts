import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IUser } from '../interfaces/IUser';
import { ChatService } from './chat.service';
import { ChatDto } from './chat.dto';
import { PaginationDto } from '../common/pagination.dto';

@ApiTags('Chat Rooms/Messages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  public async create(@Body() chat: ChatDto, @Req() req) {
    const user = req.user as IUser;
    return await this.chatService.createChat({
      ...chat,
      participants: [...chat.participants, user._id],
    });
  }

  @Get('/all')
  public async getAll(@Req() req, @Query() pagination: PaginationDto) {
    const user = req.user as IUser;
    return await this.chatService.getAllChatRooms(user._id, pagination);
  }

  @Get('/:id')
  public async get(@Req() req, @Param('id') chatId: string) {
    const user = req.user as IUser;
    return await this.chatService.getOneRoomById(chatId, user.id);
  }

  @Put('/:id')
  public async update(
    @Body() chat: ChatDto,
    @Req() req,
    @Param('id') chatId: string,
  ) {
    const user = req.user as IUser;
    return await this.chatService.updateChat(
      {
        ...chat,
        participants: [...chat.participants, user._id],
      },
      chatId,
    );
  }

  @Delete('/:id')
  public async deleteChat(@Param('id') chatId: string, @Req() req) {
    const user = req.user as IUser;
    return await this.chatService.deleteChat(chatId, user._id);
  }

  @Get('/:id/messages')
  public async getChatMessages(
    @Param('id') chatId: string,
    @Req() req,
    @Query() pagination: PaginationDto,
  ) {
    const user = req.user as IUser;
    return await this.chatService.getAllChatMessages(
      chatId,
      user._id,
      pagination,
    );
  }
}
