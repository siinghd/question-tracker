'use server';

import { createSafeAction } from '@/lib/create-safe-action';
import { SessionParticipantSchema } from './schema';
import prisma from '@/PrismaClientSingleton';
import {
  ReturnTypeSessionParticipantAdd,
  SessionParticipantAddType,
} from './types';
import { auth } from '@/auth';

const handleAddParticipant = async (
  data: SessionParticipantAddType
): Promise<ReturnTypeSessionParticipantAdd> => {
  const session = await auth();

  if (!session || session.user.id !== data.userId) {
    return {
      error: 'Unauthorized or incorrect user ID',
    };
  }

  const { userId, sessionId } = data;

  try {
    const existingParticipant = await prisma.sessionParticipant.findFirst({
      where: {
        userId: userId,
        sessionId: sessionId,
      },
    });

    if (existingParticipant) {
      return { error: 'User is already a participant in this session.' };
    }

    // Add new participant
    const newParticipant = await prisma.sessionParticipant.create({
      data: {
        userId,
        sessionId,
      },
    });

    return { data: newParticipant };
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to add participant to the session.',
    };
  }
};

export const addSessionParticipant = createSafeAction(
  SessionParticipantSchema,
  handleAddParticipant
);
