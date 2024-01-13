'use server';

import { auth, signOut } from '@/auth';
import { ReturnTypeVoteUpdate, VoteUpdateType } from './types';
import { revalidatePath } from 'next/cache';
import prisma from '@/PrismaClientSingleton';
import { VoteSchema } from './schema';
import { createSafeAction } from '@/lib/create-safe-action';

const handleVote = async (
  data: VoteUpdateType
): Promise<ReturnTypeVoteUpdate> => {
  const session = await auth();

  if (!session || !session.user.id) {
    return {
      error: 'Unauthorized',
    };
  }

  const { value, questionId, answerId } = data;

  if (!questionId && !answerId) {
    return {
      error: 'Question ID or Answer ID is required',
    };
  }

  if (![1, -1].includes(value)) {
    return {
      error: 'Invalid vote value',
    };
  }

  const voteType = questionId ? 'question' : 'answer';
  const typeId = questionId || answerId;

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      await signOut();
    }
    await prisma.$transaction(async prisma => {
      const existingVote = await prisma.vote.findFirst({
        where: {
          userId: session.user.id,
          [`${voteType}Id`]: typeId,
        },
      });

      const incrementField = value === 1 ? 'upVotes' : 'downVotes';
      const decrementField = value === 1 ? 'downVotes' : 'upVotes';

      if (existingVote) {
        if (existingVote.value === value) {
          return {
            error: `You have already ${
              value === 1 ? 'upvoted' : 'downvoted'
            } this ${voteType}.`,
          };
        }

        await prisma.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            value,
          },
        });

        const updateData = {
          [decrementField]: { decrement: 1 },
          [incrementField]: { increment: 1 },
          totalVotes: { increment: value * 2 },
        };

        if (questionId) {
          await prisma.question.update({
            where: { id: typeId },
            data: updateData,
          });
        } else {
          await prisma.answer.update({
            where: { id: typeId },
            data: updateData,
          });
        }
      } else {
        await prisma.vote.create({
          data: {
            value,
            userId: session.user.id!,
            [`${voteType}Id`]: typeId,
          },
        });

        const updateData = {
          [incrementField]: { increment: 1 },
          totalVotes: { increment: value },
        };

        if (questionId) {
          await prisma.question.update({
            where: { id: typeId },
            data: updateData,
          });
        } else {
          await prisma.answer.update({
            where: { id: typeId },
            data: updateData,
          });
        }
      }
    });

    const updatedEntity = questionId
      ? await prisma.question.findFirst({
          where: { id: typeId },
          select: { upVotes: true, downVotes: true, totalVotes: true },
        })
      : await prisma.answer.findFirst({
          where: { id: typeId },
          select: { upVotes: true, downVotes: true, totalVotes: true },
        });

    revalidatePath(`/questions/${typeId}`);
    revalidatePath(`/`);
    return { data: updatedEntity };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to process the vote.',
    };
  }
};

export const updateVote = createSafeAction(VoteSchema, handleVote);
