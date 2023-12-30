import { z } from 'zod';
import { ActionState } from '@/lib/create-safe-action';
import { SessionParticipant } from '@prisma/client';
import { SessionParticipantSchema } from './schema';

export type SessionParticipantAddType = z.infer<
  typeof SessionParticipantSchema
>;
export type ReturnTypeSessionParticipantAdd = ActionState<
  SessionParticipantAddType,
  SessionParticipant | null
>;
