'use client'
import React from 'react';
import { Button } from '../ui/button';
import { FormErrors } from './form-errors';
import { useAction } from '@/hooks/useAction';
import { updateVote } from '@/actions/vote';
import { toast } from 'sonner';
interface IVoteFormProps {
  questionId: string | undefined;
  answerId: string | undefined;
}

const VoteForm: React.FC<IVoteFormProps> = ({ questionId, answerId }) => {
  const { execute, fieldErrors, setFieldErrors } = useAction(updateVote, {
    onSuccess: (data) => {
      toast.success(`Question has "${data?.totalVotes}" Now`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const handleDownVote = () => {
    execute({ value: -1, questionId, answerId });
  };
  const handleUpVote = () => {
    execute({ value: 1, questionId, answerId });
  };

  return (
    <div className="flex space-x-2">
      <form id="vote-up" action={handleUpVote}>
        <Button
          type="submit"
          className="bg-green-500 text-white dark:bg-green-400 dark:text-gray-900"
          variant="secondary"
        >
          Upvote
        </Button>
      </form>
      <form id="vote-down" action={handleDownVote}>
        <Button
          type="submit"
          className="bg-red-500 text-white dark:bg-red-400 dark:text-gray-900"
          variant="secondary"
        >
          Downvote
        </Button>
      </form>
      <FormErrors id="error" errors={fieldErrors} />
    </div>
  );
};

export default VoteForm;
