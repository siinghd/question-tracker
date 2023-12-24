import { z } from "zod";

import { ActionState } from '@/lib/create-safe-action';
import {
  QuestionInsertSchema,
  QuestionUpdateSchema,

} from './schema';
import { Question } from '@prisma/client';

export type InputTypeCreate = z.infer<typeof QuestionInsertSchema>;
export type ReturnTypeCreate = ActionState<InputTypeCreate, Question>;

export type InputTypeUpadate = z.infer<typeof QuestionUpdateSchema>;
export type ReturnTypeUpdate = ActionState<InputTypeUpadate, Question>;


export interface QuestionQuery {
  take?: number;
  skip?: number;
  orderBy?: {
    totalVotes?: 'asc' | 'desc';
    createdAt?: 'asc' | 'desc';
    // Add other fields as needed
  };
  select?: {
    id: boolean;
    title: boolean;
    totalVotes: boolean;
    slug: boolean;
    totalAnswers: boolean;
    createdAt: true;
    author: {
      select: {
        id: boolean;
        name: boolean;
      };
    };
    // Add other fields as needed
  };
  where?: {
    authorId?: string;
    // Add other conditions as needed
    // Example: Searching in the title
    title?: {
      contains: string;
    };
    // Or a more generic search field
    search?: string;
  };
}
