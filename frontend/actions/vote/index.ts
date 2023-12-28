'use server';

import { auth } from '@/auth';
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

        // User is changing their vote
        await prisma.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            value,
          },
        });
        if (questionId) {
          // Decrement the previous vote count
          await prisma.question.update({
            where: { id: typeId },
            data: {
              [decrementField]: {
                decrement: 1,
              },
            },
          });
        } else {
          await prisma.answer.update({
            where: { id: typeId },
            data: {
              [decrementField]: {
                decrement: 1,
              },
            },
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
      }
      if (questionId) {
        // Decrement the previous vote count
        await prisma.question.update({
          where: { id: typeId },
          data: {
            [incrementField]: {
              increment: 1,
            },
          },
        });
      } else {
        await prisma.answer.update({
          where: { id: typeId },
          data: {
            [incrementField]: {
              increment: 1,
            },
          },
        });
      }
    });

    // Fetch the updated entity after the transaction is complete
    const updatedEntity = questionId
      ? await prisma.question.findFirst({
          where: { id: typeId },
          select: { upVotes: true, downVotes: true },
        })
      : await prisma.answer.findFirst({
          where: { id: typeId },
          select: { upVotes: true, downVotes: true },
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
