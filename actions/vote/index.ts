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

  const voteType = questionId ? 'question' : 'answer';
  const typeId = questionId || answerId;

  try {
    // Check for existing vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.id,
        [`${voteType}Id`]: typeId,
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        return {
          error: `You have already ${
            value === 1 ? 'upvoted' : 'downvoted'
          } this ${voteType}.`,
        };
      }

      await prisma.$transaction([
        prisma.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            value,
          },
        }),
        questionId
          ? prisma.question.update({
              where: {
                id: typeId,
              },
              data: {
                totalVotes: {
                  increment: value * 2,
                },
              },
            })
          : prisma.answer.update({
              where: {
                id: typeId,
              },
              data: {
                totalVotes: {
                  increment: value * 2,
                },
              },
            }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.vote.create({
          data: {
            value,
            userId: session.user.id,
            [`${voteType}Id`]: typeId,
          },
        }),
        questionId
          ? prisma.question.update({
              where: {
                id: typeId,
              },
              data: {
                totalVotes: {
                  increment: value,
                },
              },
            })
          : prisma.answer.update({
              where: {
                id: typeId,
              },
              data: {
                totalVotes: {
                  increment: value,
                },
              },
            }),
      ]);
    }

    const updatedEntity = questionId
      ? await prisma.question.findFirst({
          where: {
            id: typeId,
          },
          select: {
            totalVotes: true,
          },
        })
      : await prisma.answer.findFirst({
          where: {
            id: typeId,
          },
          select: {
            totalVotes: true,
          },
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
