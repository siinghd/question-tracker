import { z } from 'zod';

import { ActionState } from '@/lib/create-safe-action';

import { Delete } from '@/types';
import {
  LiveChatSessionDeleteSchema,
  LiveChatSessionInsertSchema,
  LiveChatSessionUpdateSchema,
} from './schema';
import { LiveChatSession } from '@prisma/client';

export type InputTypeCreate = z.infer<typeof LiveChatSessionInsertSchema>;
export type ReturnTypeCreate = ActionState<InputTypeCreate, LiveChatSession>;

export type InputTypeUpadate = z.infer<typeof LiveChatSessionUpdateSchema>;
export type ReturnTypeUpdate = ActionState<InputTypeUpadate, LiveChatSession>;

export type InputTypeDelete = z.infer<typeof LiveChatSessionDeleteSchema>;
export type ReturnTypeDelete = ActionState<InputTypeDelete, Delete>;
