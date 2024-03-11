import { Document } from 'mongoose';

export interface IChatRoom extends Document {
  participants: string[];
  participantsUsers: any[];
  type: string;
  groupName: string;
}
