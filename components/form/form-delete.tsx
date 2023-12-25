'use client';
import React, { useId } from 'react';
import { useAction } from '@/hooks/useAction';
import { toast } from 'sonner';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { deleteQuestion } from '@/actions/question';
import { deleteAnswer } from '@/actions/answer';
import { ActionState } from '@/lib/create-safe-action';
import { Delete } from '@/types';
interface IVoteFormProps {
  questionId: string | undefined;
  answerId: string | undefined;
}
type DeleteActionData = { questionId?: string; answerId?: string };
type DeleteAction = (
  data: DeleteActionData
) => Promise<ActionState<DeleteActionData, Delete>>;

const DeleteForm: React.FC<IVoteFormProps> = ({ questionId, answerId }) => {
  const idForm = useId();

  // Define a unified delete action
  const deleteAction: DeleteAction = async ({ questionId, answerId }) => {
    if (questionId) {
      return deleteQuestion({ questionId });
    } else if (answerId) {
      return deleteAnswer({ answerId });
    } else {
      throw new Error('Neither questionId nor answerId is provided');
    }
  };

  const { execute, fieldErrors, setFieldErrors } = useAction(deleteAction, {
    onSuccess: (data) => {
      toast.success(`${data.message}`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const hanleDeleteFunction = () => {
    execute(questionId ? { questionId } : { answerId });
  };

  return (
    <form
      id={`delete-${idForm}`}
      action={hanleDeleteFunction}
      className="w-full"
    >
      <button type="submit">
        <DropdownMenuItem className="text-sm px-1 py-2 rounded-xl hover:border-none hover:outline-none">
          Delete
        </DropdownMenuItem>
      </button>
    </form>
  );
};

export default DeleteForm;
