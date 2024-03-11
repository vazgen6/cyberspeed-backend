import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ChatRoom } from './chat-room.schema';
import { User } from './user.schema';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ChatRoom.name,
    required: true,
  })
  chatRoomId: ChatRoom;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  senderId: User;

  @Prop({
    required: function () {
      return !this.attachment;
    },
    maxlength: 255,
  })
  message: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
