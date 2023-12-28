import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user';
import { ILiveChatSession } from './live-session-model';
import { IMessageVote } from './message-vote';

export interface IMessage extends Document {
  _id: string;
  content: string;
  author: IUser['_id'];
  liveChatSession: ILiveChatSession['_id'];
  upVotes: number;
  downVotes: number;
  createdAt: Date;
  updatedAt: Date;
  votes: IMessageVote['_id'][]; // Array of MessageVote IDs
}

const messageSchema: Schema = new Schema(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    liveChatSession: { type: Schema.Types.ObjectId, ref: 'LiveChatSession' },
    createdAt: { type: Date, default: Date.now },
    upVotes: { type: Number, default: 0 },
    downVotes: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
    votes: [{ type: Schema.Types.ObjectId, ref: 'MessageVote' }],
  },
  { collection: 'Message' }
);

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
