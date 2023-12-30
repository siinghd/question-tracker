import { z } from 'zod';

export const SessionParticipantSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
});
