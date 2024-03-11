import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from 'src/chat/chat.service';
import { Chat, ChatSchema } from 'src/models/chat.schema';
import { User, UserSchema } from 'src/models/user.schema';
import { UsersModule } from 'src/users/users.module';
import { WSGateway } from './websockets.gateway';
import { ChatRoom, ChatRoomSchema } from 'src/models/chat-room.schema';

@Module({
  providers: [WSGateway, ChatService, JwtService],
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  exports: [WSGateway, ChatService, JwtService],
})
export class WebsocketsModule {}
