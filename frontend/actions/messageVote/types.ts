import { z } from 'zod';
import { ActionState } from '@/lib/create-safe-action';
import { MessageVoteSchema } from './schema';

export type MessageVoteUpdateType = z.infer<typeof MessageVoteSchema>;
export type ReturnTypeMessageVoteUpdate = ActionState<
  MessageVoteUpdateType,
  { upVotes: number; downVotes: number; totalVotes: number } | null
>;
