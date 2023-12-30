import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  // add other later if needed
}

const userSchema: Schema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    emailVerified: Date,
    image: String,
    // same here add other later if needed
  },
  { collection: 'User' }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
