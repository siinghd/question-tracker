'use server';

import { auth } from '@/auth';
import {
  DeleteTypeAnswer,
  InputTypeCreateAnswer,
  InputTypeUpdateAnswer,
  ReturnTypeCreateAnswer,
  ReturnTypeDeleteAnswer,
  ReturnTypeUpdateAnswer,
} from './types';
import prisma from '@/PrismaClientSingleton';
import { createSafeAction } from '@/lib/create-safe-action';
import {
  AnswerDeleteSchema,
  AnswerInsertSchema,
  AnswerUpdateSchema,
} from './schema';
import { revalidatePath } from 'next/cache';

const createAnswerHandler = async (
  data: InputTypeCreateAnswer
): Promise<ReturnTypeCreateAnswer> => {
  const session = await auth();

  if (!session || !session.user.id) {
    return {
      error: 'Unauthorized',
    };
  }

  const { content, questionId, parentId } = data;

  try {
    const answer = await prisma.answer.create({
      data: {
        content,
        questionId,
        authorId: session.user.id,
        parentId, // Include parentId if the answer is responding to another answer
      },
    });
    revalidatePath(`/questions/${answer.id}`);
    revalidatePath(`/`);
    return { data: answer };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to create answer.',
    };
  }
};

const updateAnswerHandler = async (
  data: InputTypeUpdateAnswer
): Promise<ReturnTypeUpdateAnswer> => {
  const session = await auth();

  if (!session || !session.user.id) {
    return {
      error: 'Unauthorized',
    };
  }

  const { answerId, content } = data;

  // Check if the user is the author of the answer
  const existingAnswer = await prisma.answer.findUnique({
    where: { id: answerId },
  });

  if (!existingAnswer || existingAnswer.authorId !== session.user.id) {
    return {
      error: 'Unauthorized: You can only update answers you have authored',
    };
  }

  try {
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        content, // Update content
      },
    });
    revalidatePath(`/questions/${answerId}`);
    revalidatePath(`/`);
    return { data: updatedAnswer };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to update answer.',
    };
  }
};
const deleteAnswerHandler = async (
  data: DeleteTypeAnswer
): Promise<ReturnTypeDeleteAnswer> => {
  const session = await auth();

  if (!session || !session.user.id) {
    return { error: 'Unauthorized' };
  }

  const { answerId } = data;

  // Check if the user is the author of the answer
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
  });

  if (!answer || answer.authorId !== session.user.id) {
    return {
      error: 'Unauthorized: You can only delete answers you have authored',
    };
  }

  try {
    await prisma.$transaction(async (prisma) => {
      // Function to recursively delete answers
      const deleteNestedAnswers = async (parentId: string) => {
        const childAnswers = await prisma.answer.findMany({
          where: { parentId },
        });

        for (const childAnswer of childAnswers) {
          await deleteNestedAnswers(childAnswer.id); // Recursively delete children
          await prisma.answer.delete({ where: { id: childAnswer.id } });
        }
      };

      // Delete all nested answers recursively
      await deleteNestedAnswers(answerId);

      // Now delete the answer itself
      await prisma.answer.delete({ where: { id: answerId } });
    });
    revalidatePath(`/questions/${answerId}`);
    revalidatePath(`/`);
    return {
      data: { message: 'Answer and all nested answers deleted successfully' },
    };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to delete answer and nested answers.' };
  }
};

export const createAnswer = createSafeAction(
  AnswerInsertSchema,
  createAnswerHandler
);
export const updateAnswer = createSafeAction(
  AnswerUpdateSchema,
  updateAnswerHandler
);
export const deleteAnswer = createSafeAction(
  AnswerDeleteSchema,
  deleteAnswerHandler
);
