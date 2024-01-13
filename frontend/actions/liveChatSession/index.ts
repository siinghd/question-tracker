'use server';

import { auth, signOut } from '@/auth';
import {
  InputTypeCreate,
  InputTypeDelete,
  InputTypeUpadate,
  ReturnTypeCreate,
  ReturnTypeDelete,
  ReturnTypeUpdate,
} from './types';
import { Roles } from '@/types';
import prisma from '@/PrismaClientSingleton';
import { createSafeAction } from '@/lib/create-safe-action';
import {
  LiveChatSessionDeleteSchema,
  LiveChatSessionInsertSchema,
  LiveChatSessionUpdateSchema,
} from './schema';
import { revalidatePath } from 'next/cache';

const createLiveSessionHandler = async (
  data: InputTypeCreate
): Promise<ReturnTypeCreate> => {
  const session = await auth();

  if (!session || !session.user.id || session.user.role !== Roles.admin) {
    return { error: 'Unauthorized or insufficient permissions' };
  }

  const { title } = data;

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      await signOut();
    }
    const liveSessionData = {
      title,
      date: new Date(),
      isActive: true,
    };

    const liveSession = await prisma.liveChatSession.create({
      data: liveSessionData,
    });

    revalidatePath(`/livechats/${liveSession.id}`);
    revalidatePath('/livechats');
    return { data: liveSession };
  } catch (error) {
    console.error('Error in createLiveSessionHandler:', error);
    return { error: 'Failed to create live session.' };
  }
};
const updateLiveSessionHandler = async (
  data: InputTypeUpadate
): Promise<ReturnTypeUpdate> => {
  const session = await auth();

  if (!session || (!session.user.id && session.user.role !== Roles.admin)) {
    return { error: 'Unauthorized or insufficient permissions' };
  }

  const { sessionId, title, isActive } = data;

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      await signOut();
    }
    const updatedLiveSession = await prisma.liveChatSession.update({
      where: { id: sessionId },
      data: { title, isActive },
    });

    revalidatePath(`/livechats/${sessionId}`);
    revalidatePath('/livechats');
    return { data: updatedLiveSession };
  } catch (error) {
    console.error('Error in updateLiveSessionHandler:', error);
    return { error: 'Failed to update live session.' };
  }
};
const deleteLiveSessionHandler = async (
  data: InputTypeDelete
): Promise<ReturnTypeDelete> => {
  const session = await auth();

  if (!session || (!session.user.id && session.user.role !== Roles.admin)) {
    return { error: 'Unauthorized or insufficient permissions' };
  }

  const { sessionId } = data;

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      await signOut();
    }
    await prisma.liveChatSession.delete({
      where: { id: sessionId },
    });

    revalidatePath('/livechats');
    return { data: { message: 'Live session deleted successfully' } };
  } catch (error) {
    console.error('Error in deleteLiveSessionHandler:', error);
    return { error: 'Failed to delete live session.' };
  }
};

export const createLiveChatSession = createSafeAction(
  LiveChatSessionInsertSchema,
  createLiveSessionHandler
);
export const updateLiveChatSession = createSafeAction(
  LiveChatSessionUpdateSchema,
  updateLiveSessionHandler
);
export const deleteLiveChatSession = createSafeAction(
  LiveChatSessionDeleteSchema,
  deleteLiveSessionHandler
);
