import { z } from 'zod';

export const AnswerInsertSchema = z.object({
  content: z.string().min(20, 'Answer content too short'),
  questionId: z.string(),
  parentId: z.string().optional(), // Optional, used if the answer is a response to another answer
});
export const AnswerUpdateSchema = z.object({
  answerId: z.string(),
  content: z.string().min(20, 'Answer content too short'),
});
export const AnswerDeleteSchema = z.object({
  answerId: z.string(),
});
