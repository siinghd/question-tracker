'use server';

import { auth, signOut } from '@/auth';
import {
  DeleteTypeQuestion,
  InputTypeCreate,
  InputTypeUpadate,
  ReturnTypeCreate,
  ReturnTypeDelete,
  ReturnTypeUpdate,
} from './types';
import { revalidatePath } from 'next/cache';
import prisma from '@/PrismaClientSingleton';
import {
  QuestionDeleteSchema,
  QuestionInsertSchema,
  QuestionUpdateSchema,
} from './schema';
import { createSafeAction } from '@/lib/create-safe-action';
import { generateHandle } from '@/lib/functions';
import { Roles } from '@/types';

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
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      await signOut({
        redirectTo: '/login',
      });
    }
    // Check if slug already exists
    const existingQuestion = await prisma.question.findFirst({
      where: { slug },
    });

    if (existingQuestion) {
      slug += '-' + Math.random().toString(36).substring(2, 5);
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
    revalidatePath(`/questions/${question.id}`);
    revalidatePath(`/`);

    return { data: question };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to create question.',
    };
  }
};

const updateQuestionHandler = async (
  data: InputTypeUpadate
): Promise<ReturnTypeUpdate> => {
  const session = await auth();

  if (!session || !session.user.id) {
    return {
      error: 'Unauthorized',
    };
  }

  const { title, content, tags, questionId } = data;
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userExists) {
    await signOut({
      redirectTo: '/login',
    });
  }
  // Check if the user is the author of the question
  const existingQuestion = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!existingQuestion || existingQuestion.authorId !== session.user.id) {
    return {
      error: 'Unauthorized: You can only update questions you have authored',
    };
  }

  // Create initial slug
  let slug = generateHandle(title);

  try {
    // Check if slug already exists for another question
    const anotherExistingQuestion = await prisma.question.findFirst({
      where: {
        slug,
        AND: {
          id: {
            not: questionId, // Exclude the current question from the check
          },
        },
      },
    });

    if (anotherExistingQuestion) {
      // Modify the slug if it already exists (e.g., append a random string or number)
      slug += '-' + Math.random().toString(36).substring(2, 5);
    }

    // Update question with the new slug
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        title,
        content,
        tags,
        slug, // Include the new slug
      },
    });
    revalidatePath(`/questions/${questionId}`);
    revalidatePath(`/`);

    return { data: updatedQuestion };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to update question.',
    };
  }
};
const deleteQuestionHandler = async (
  data: DeleteTypeQuestion
): Promise<ReturnTypeDelete> => {
  const session = await auth();

  if (!session || !session.user.id) {
    return { error: 'Unauthorized' };
  }
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userExists) {
    await signOut({
      redirectTo: '/login',
    });
  }
  const { questionId } = data;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (
    !question ||
    (question.authorId !== session.user.id && session.user.role !== Roles.admin)
  ) {
    return {
      error: 'Unauthorized: You can only delete questions you have authored',
    };
  }

  try {
    await prisma.$transaction(async prisma => {
      // Function to recursively delete answers and their responses
      const deleteAnswers = async (answerId: string) => {
        const responses = await prisma.answer.findMany({
          where: { parentId: answerId },
        });

        for (const response of responses) {
          await deleteAnswers(response.id); // Recursively delete child responses
        }

        await prisma.answer.delete({
          where: { id: answerId },
        });
      };

      // Delete all answers (and their responses) associated with the question
      const answers = await prisma.answer.findMany({
        where: { questionId: questionId },
      });
      for (const answer of answers) {
        await deleteAnswers(answer.id);
      }

      // Now delete the question itself
      await prisma.question.delete({
        where: { id: questionId },
      });
    });

    // Revalidate paths if needed (this depends on your specific setup)
    revalidatePath(`/questions/${questionId}`);
    revalidatePath(`/`);

    return {
      data: {
        message: 'Question and all associated answers deleted successfully',
      },
    };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete question and answers.' };
  }
};

export const createQuestion = createSafeAction(
  QuestionInsertSchema,
  createQuestionHandler
);
export const updateQuestion = createSafeAction(
  QuestionUpdateSchema,
  updateQuestionHandler
);
export const deleteQuestion = createSafeAction(
  QuestionDeleteSchema,
  deleteQuestionHandler
);
