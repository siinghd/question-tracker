import { z } from 'zod';

export const LiveChatSessionInsertSchema = z.object({
  title: z.string().min(5, 'LiveSession title too short'),
});

export const LiveChatSessionUpdateSchema = z.object({
  sessionId: z.string(),
  title: z.string().min(5, 'LiveSession title too short'),
  isActive: z.boolean(),
});
export const LiveChatSessionDeleteSchema = z.object({
  sessionId: z.string(),
});
