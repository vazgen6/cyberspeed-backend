import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from 'src/models/chat-room.schema';
import { Chat, ChatSchema } from 'src/models/chat.schema';
import { User, UserSchema } from 'src/models/user.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
})
export class ChatModule {}
