'use server';

import { auth } from '@/frontend/auth';
import { ReturnTypeVoteUpdate, VoteUpdateType } from './types';
import { revalidatePath } from 'next/cache';
import prisma from '@/frontend/PrismaClientSingleton';
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
    await prisma.$transaction(async prisma => {
      const existingVote = await prisma.vote.findFirst({
        where: {
          userId: session.user.id!,
          [`${voteType}Id`]: typeId,
        },
      });

      let incrementValue = value;
      if (existingVote) {
        if (existingVote.value === value) {
          throw new Error(
            `You have already ${
              value === 1 ? 'upvoted' : 'downvoted'
            } this ${voteType}.`
          );
        }
        incrementValue *= 2; // Adjust for reversing the previous vote and applying the new one
        await prisma.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            value,
          },
        });
      } else {
        await prisma.vote.create({
          data: {
            value,
            userId: session.user.id!,
            [`${voteType}Id`]: typeId,
          },
        });
      }

      // Update total votes on question or answer
      const updateData = {
        totalVotes: {
          increment: incrementValue,
        },
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
    });

    // Fetch the updated entity after the transaction is complete
    const updatedEntity = questionId
      ? await prisma.question.findFirst({
          where: { id: typeId },
          select: { totalVotes: true },
        })
      : await prisma.answer.findFirst({
          where: { id: typeId },
          select: { totalVotes: true },
        });

    // Revalidate paths outside the transaction
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
