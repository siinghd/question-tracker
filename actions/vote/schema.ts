import { z } from 'zod';


export const VoteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(1)]),
  questionId: z.string().optional(),
  answerId: z.string().optional(),
});
