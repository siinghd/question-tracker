import { z } from "zod";

import { ActionState } from "@/lib/create-safe-action";
import { QuestionInsertSchema, QuestionUpdateSchema } from "./schema";
import { Question } from "@prisma/client";

export type InputTypeCreate = z.infer<typeof QuestionInsertSchema>;
export type ReturnTypeCreate = ActionState<InputTypeCreate, Question>;

export type InputTypeUpadte = z.infer<typeof QuestionUpdateSchema>;
export type ReturnTypeUpdate = ActionState<InputTypeUpadte, Question>;
