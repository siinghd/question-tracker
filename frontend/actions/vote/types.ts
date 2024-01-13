import { z } from 'zod';

import { ActionState } from '@/lib/create-safe-action';
import { VoteSchema } from './schema';

export type VoteUpdateType = z.infer<typeof VoteSchema>;
export type ReturnTypeVoteUpdate = ActionState<
  VoteUpdateType,
  { upVotes: number; downVotes: number } | null
>;
