import { z } from 'zod';

export const LiveChatSessionInsertSchema = z.object({
  title: z.string().min(2, 'LiveSession title too short'),
});

export const LiveChatSessionUpdateSchema = z.object({
  sessionId: z.string(),
  title: z.string().optional(),
  isActive: z.boolean().optional(),
});
export const LiveChatSessionDeleteSchema = z.object({
  sessionId: z.string(),
});
