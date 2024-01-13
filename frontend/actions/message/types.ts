import { Message } from '@prisma/client';
import { ActionState } from '@/lib/create-safe-action';
import { z } from 'zod';
import {
  MessageDeleteSchema,
  MessageInsertSchema,
  MessageUpdateSchema,
} from './schema';
import { Delete } from '@/types';
import { Author } from '../question/types';

export type InputTypeCreateMessage = z.infer<typeof MessageInsertSchema>;
export type ReturnTypeCreateMessage = ActionState<
  InputTypeCreateMessage,
  Message
>;

export type InputTypeUpdateMessage = z.infer<typeof MessageUpdateSchema>;
export type ReturnTypeUpdateMessage = ActionState<
  InputTypeUpdateMessage,
  Message
>;

export type InputTypeDeleteMessage = z.infer<typeof MessageDeleteSchema>;
export type ReturnTypeDeleteMessage = ActionState<
  InputTypeDeleteMessage,
  Delete
>;

export interface ExtentedMessage extends Message {
  author: Author;
}
