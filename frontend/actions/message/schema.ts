import { z } from 'zod';

export const MessageInsertSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  authorId: z.string(),
  sessionId: z.string(),
});

export const MessageUpdateSchema = z.object({
  messageId: z.string(),
  content: z.string().optional(),
  upVotes: z.number().optional(),
  downVotes: z.number().optional(),
});

export const MessageDeleteSchema = z.object({
  messageId: z.string(),
});
