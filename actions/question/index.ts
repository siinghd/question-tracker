'use server';

import { auth } from '@/auth';
import { InputTypeCreate, ReturnTypeCreate } from './types';
import { revalidatePath } from 'next/cache';
import prisma from '@/PrismaClientSingleton';
import { QuestionInsertSchema } from './schema';
import { createSafeAction } from '@/lib/create-safe-action';

const createQuestionHandler = async (
  data: InputTypeCreate
): Promise<ReturnTypeCreate> => {
  const session = await auth();

  if (!session || !session.user.id) {
    return {
      error: 'Unauthorized',
    };
  }

  const { title, content, tags } = data;
  let question;

  try {
    question = await prisma.question.create({
      data: {
        title,
        content,
        tags,
        authorId: session.user.id,
      },
    });
  } catch (error) {
    console.log(error);
    return {
      error: 'Failed to copy.',
    };
  }

  revalidatePath(`/`);
  return { data: question };
};

export const createQuestion = createSafeAction(
  QuestionInsertSchema,
  createQuestionHandler
);
