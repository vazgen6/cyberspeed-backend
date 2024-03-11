import { Document } from 'mongoose';

export interface IChat extends Document {
  chatId: string;
  senderId: string;
  message: string;
  attachment: string;
}
