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
    upVotes?: 'asc' | 'desc';
    downVotes?: 'asc' | 'desc';
    totalVotes?: 'asc' | 'desc';
    createdAt?: 'asc' | 'desc';
    // Add other fields as needed
  };
  select?: {
    id: boolean;
    title: boolean;
    totalVotes?: boolean;
    upVotes: boolean;
    downVotes: boolean;
    slug?: boolean;
    tags?: boolean;
    totalAnswers?: boolean;
    createdAt: true;
    updatedAt: true;
    author: {
      select: {
        id: boolean;
        name: boolean;
        image: boolean;
      };
    };
    // Add other fields as needed
    votes: {
      where: {
        userId: string | undefined;
      };
      select: {
        userId: boolean;
        value: boolean;
      };
    };
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
    createdAt?: {
      gte?: string;
      lt?: string;
    };
  };
}

export interface Author {
  id: string | undefined;
  name: string | null; // Allow null
  image: string | null; // Allow null
  role?: string | null;
}

export interface ExtendedQuestion {
  id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: Date;
  authorId: string;
  upVotes: number;
  downVotes: number;
  totalAnswers: number;
  tags: string[];
  updatedAt: Date;
  author: Author;
  votes: any[];
}
