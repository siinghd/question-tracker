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
import { auth } from '@/auth';
import { Roles } from '@/types';

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

  const { content, sessionId } = data;

  try {
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
