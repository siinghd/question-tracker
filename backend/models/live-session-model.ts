import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveChatSession extends Document {
  _id: string;
  title: string;
  date: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // add other later if needed
}

const liveChatSessionSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // add other later if needed
  },
  { collection: 'LiveChatSession' }
);

const LiveChatSession = mongoose.model<ILiveChatSession>(
  'LiveChatSession',
  liveChatSessionSchema
);
export default LiveChatSession;
