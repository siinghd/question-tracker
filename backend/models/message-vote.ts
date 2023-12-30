import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user';
import { IMessage } from './message';

export interface IMessageVote extends Document {
  _id: string;
  value: number;
  user: IUser['_id'] 
  messageId: IMessage['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const messageVoteSchema: Schema = new Schema(
  {
    value: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'MessageVote' }
);

const MessageVote = mongoose.model<IMessageVote>(
  'MessageVote',
  messageVoteSchema
);

export default MessageVote;
