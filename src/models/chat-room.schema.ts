import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';

export type ChatRoomDocument = ChatRoom & Document;

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: User.name }])
  participants: User[];

  @Prop({ required: true })
  type: string; // private, group

  @Prop()
  groupName: string;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

ChatRoomSchema.virtual('participantsUsers', {
  ref: User.name,
  localField: 'participants',
  foreignField: '_id',
});

ChatRoomSchema.set('toJSON', { virtuals: true });
