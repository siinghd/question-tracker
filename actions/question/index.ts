'use server';

import { auth } from '@/auth';
import { InputTypeCreate, ReturnTypeCreate } from './types';
import { revalidatePath } from 'next/cache';
import prisma from '@/PrismaClientSingleton';
import { QuestionInsertSchema } from './schema';
import { createSafeAction } from '@/lib/create-safe-action';
import { generateHandle } from '@/lib/functions';

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

  // Create initial slug
  let slug = generateHandle(title);

  try {
    // Check if slug already exists
    const existingQuestion = await prisma.question.findFirst({
      where: { slug },
    });

    if (existingQuestion) {
      // Modify the slug if it already exists (e.g., append a random string or number)
      slug += '-' + Math.random().toString(36).substr(2, 5);
    }

    // Create question with the slug
    const question = await prisma.question.create({
      data: {
        title,
        content,
        tags,
        authorId: session.user.id,
        slug, // Include the slug
      },
    });

    revalidatePath(`/`);
    return { data: question };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to create question.',
    };
  }
};

export const createQuestion = createSafeAction(
  QuestionInsertSchema,
  createQuestionHandler
);
