import { z } from 'zod';

export const MessageVoteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(1)]),
  messageId: z.string(),
});
