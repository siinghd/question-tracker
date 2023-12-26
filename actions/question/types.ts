import { z } from 'zod';

import { ActionState } from '@/lib/create-safe-action';
import {
  QuestionDeleteSchema,
  QuestionInsertSchema,
  QuestionUpdateSchema,
} from './schema';
import { Question } from '@prisma/client';
import { Delete } from '@/types';

export type InputTypeCreate = z.infer<typeof QuestionInsertSchema>;
export type ReturnTypeCreate = ActionState<InputTypeCreate, Question>;

export type InputTypeUpadate = z.infer<typeof QuestionUpdateSchema>;
export type ReturnTypeUpdate = ActionState<InputTypeUpadate, Question>;

export type DeleteTypeQuestion = z.infer<typeof QuestionDeleteSchema>;
export type ReturnTypeDelete = ActionState<DeleteTypeQuestion, Delete>;

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
    tags: boolean;
    totalAnswers: boolean;
    createdAt: true;
    updatedAt: true;
    author: {
      select: {
        id: boolean;
        name: boolean;
        image: boolean;
      };
    };
    votes: {
      where: {
        userId: string | undefined,
      },
      select: {
        userId: boolean,
        value: boolean
      },
    }
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

export interface Author {
  id: string;
  name: string | null; // Allow null
  image: string | null; // Allow null
}

export interface ExtendedQuestion {
  id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: Date;
  authorId: string;
  totalVotes: number;
  totalAnswers: number;
  tags: string[];
  updatedAt: Date;
  author: Author;
  votes: any[]
}
