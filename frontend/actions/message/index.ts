'use server';

import {
  InputTypeCreateMessage,
  InputTypeDeleteMessage,
  InputTypeUpdateMessage,
  ReturnTypeCreateMessage,
  ReturnTypeDeleteMessage,
  ReturnTypeUpdateMessage,
} from './types';
import prisma from '@/PrismaClientSingleton';
import {
  MessageDeleteSchema,
  MessageInsertSchema,
  MessageUpdateSchema,
} from './schema';
import { createSafeAction } from '@/lib/create-safe-action';
import { Session } from 'next-auth/types';
import { auth, signOut } from '@/auth';
import { Roles } from '@/types';
interface RateLimiter {
  timestamps: Date[];
}
const RECENT_MESSAGE_LIMIT = 10;
const SIMILARITY_THRESHOLD = 0.8;
const userRateLimits = new Map<string, RateLimiter>();

const rateLimit = (userId: string): boolean => {
  const now = new Date();
  const limit = 30; // limit to 5 messages per minute
  const interval = 60000; // 1 minute

  const userLimiter = userRateLimits.get(userId) ?? { timestamps: [] };

  userLimiter.timestamps = userLimiter.timestamps.filter(
    timestamp => now.getTime() - timestamp.getTime() < interval
  );

  if (userLimiter.timestamps.length >= limit) {
    return false;
  }

  userLimiter.timestamps.push(now);
  userRateLimits.set(userId, userLimiter);
  return true;
};

export const fetchMessagesFromDatabase = async (
  sessionId: string,
  page: number,
  pageSize: number
) => {
  const messages = await prisma.message.findMany({
    where: {
      sessionId: sessionId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: page * pageSize,
    take: pageSize + 1, // one extra record to check if there are more records
    include: {
      author: true,
    },
  });

  const hasMore = messages.length > pageSize;
  const result = hasMore ? messages.slice(0, -1) : messages; // remove extra record

  return { result, nextPage: hasMore ? page + 1 : null };
};

const createMessageHandler = async (
  data: InputTypeCreateMessage
): Promise<ReturnTypeCreateMessage> => {
  const session = await auth();

  if (!session || !session?.user) {
    return { error: 'Unauthorized or insufficient permissions' };
  }
  const canCreateMessage = rateLimit(session.user.id!);
  if (!canCreateMessage) {
    return { error: 'Rate limit exceeded. Please try again later.' };
  }
  const { content, sessionId } = data;

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      await signOut();
      return { error: 'User not found.' };
    }
    const recentMessages = await prisma.message.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: RECENT_MESSAGE_LIMIT,
    });
    const message = await prisma.message.create({
      data: { content, authorId: session.user.id!, sessionId },
    });

    return { data: message };
  } catch (error) {
    return { error: 'Failed to create message.' };
  }
};
const updateMessageHandler = async (
  data: InputTypeUpdateMessage
): Promise<ReturnTypeUpdateMessage> => {
  const session = await auth();

  if (!session || !session.user) {
    return { error: 'Unauthorized or insufficient permissions' };
  }

  const { messageId, content } = data;

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      await signOut();
    }
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return { error: 'Message not found.' };
    }

    if (
      existingMessage.authorId !== session.user.id &&
      session.user.role !== Roles.admin
    ) {
      return { error: 'Unauthorized to update this message.' };
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { content },
    });

    return { data: updatedMessage };
  } catch (error) {
    return { error: 'Failed to update message.' };
  }
};
const deleteMessageHandler = async (
  data: InputTypeDeleteMessage
): Promise<ReturnTypeDeleteMessage> => {
  const session = await auth();

  if (!session || !session.user) {
    return { error: 'Unauthorized or insufficient permissions' };
  }

  const { messageId } = data;

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      await signOut();
    }
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return { error: 'Message not found.' };
    }

    if (
      message.authorId !== session.user.id &&
      session.user.role !== Roles.admin
    ) {
      return { error: 'Unauthorized to delete this message.' };
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return { data: { message: 'Deleted successfully' } };
  } catch (error) {
    return { error: 'Failed to delete message.' };
  }
};

export const createMessage = createSafeAction(
  MessageInsertSchema,
  createMessageHandler
);
export const updateMessage = createSafeAction(
  MessageUpdateSchema,
  updateMessageHandler
);
export const deleteMessage = createSafeAction(
  MessageDeleteSchema,
  deleteMessageHandler
);
