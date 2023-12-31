'use server';

import { createSafeAction } from '@/lib/create-safe-action';
import { MessageVoteSchema } from './schema';
import prisma from '@/PrismaClientSingleton';
import { auth, signOut } from '@/auth';
import { MessageVoteUpdateType, ReturnTypeMessageVoteUpdate } from './types';

const handleMessageVote = async (
  data: MessageVoteUpdateType
): Promise<ReturnTypeMessageVoteUpdate> => {
  const session = await auth();

  if (!session || !session.user.id) {
    return {
      error: 'Unauthorized',
    };
  }

  const { value, messageId } = data;

  if (![1, -1].includes(value)) {
    return {
      error: 'Invalid vote value',
    };
  }

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      await signOut();
    }
    await prisma.$transaction(async prisma => {
      const existingVote = await prisma.messageVote.findFirst({
        where: {
          userId: session.user.id,
          messageId: messageId,
        },
      });

      const incrementField = value === 1 ? 'upVotes' : 'downVotes';
      const decrementField = value === 1 ? 'downVotes' : 'upVotes';

      if (existingVote) {
        if (existingVote.value === value) {
          return {
            error: `You have already ${
              value === 1 ? 'upvoted' : 'downvoted'
            } this message.`,
          };
        }

        await prisma.messageVote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            value,
          },
        });

        // Update message vote counts
        const updateData = {
          [decrementField]: { decrement: 1 },
          [incrementField]: { increment: 1 },
          totalVotes: { increment: value * 2 },
        };

        await prisma.message.update({
          where: { id: messageId },
          data: updateData,
        });
      } else {
        await prisma.messageVote.create({
          data: {
            value,
            userId: session.user.id!,
            messageId: messageId,
          },
        });

        // Update message vote counts
        const updateData = {
          [incrementField]: { increment: 1 },
          totalVotes: { increment: value },
        };

        await prisma.message.update({
          where: { id: messageId },
          data: updateData,
        });
      }
    });

    const updatedMessage = await prisma.message.findUnique({
      where: { id: messageId },
      select: { upVotes: true, downVotes: true, totalVotes: true },
    });

    // Optionally revalidate paths as needed
    return { data: updatedMessage };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to process the vote.',
    };
  }
};

export const updateMessageVote = createSafeAction(
  MessageVoteSchema,
  handleMessageVote
);
