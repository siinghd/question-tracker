'use client';
import React from 'react';
import { Button } from '../ui/button';
import { FormErrors } from './form-errors';
import { useAction } from '@/hooks/useAction';
import { updateVote } from '@/actions/vote';
import { toast } from 'sonner';
import { VoteBlock, VoteScore } from '../voteScore';
import { Minus, Plus } from 'lucide-react';
interface IVoteFormProps {
  questionId: string | undefined;
  answerId: string | undefined;
  votes: number;
}

const VoteForm: React.FC<IVoteFormProps> = ({
  questionId,
  answerId,
  votes = 0,
}) => {
  const { execute, fieldErrors, setFieldErrors } = useAction(updateVote, {
    onSuccess: (data) => {
      toast.success(`Question has "${data?.totalVotes}" votes Now`);
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
    <VoteScore className="w-[100px]">
      <form id="vote-up" action={handleUpVote} className="w-full">
        <VoteBlock className=" rounded-t-xl cursor-pointer bg-[#F3F4F6] hover:bg-gray-200 duration-300 ease-in-out dark:bg-gray-900 dark:hover:bg-gray-950">
          <button type="submit">
            <Plus size={20} />
          </button>
        </VoteBlock>
      </form>
      <VoteBlock className=" border-t-0 border-b-0 text-sm  font-medium dark:bg-gray-900">
        {votes}
      </VoteBlock>
      <form id="vote-down" action={handleDownVote} className="w-full">
        <VoteBlock className="rounded-b-xl cursor-pointer bg-[#F3F4F6] hover:bg-gray-100 duration-300 dark:bg-gray-900 ease-in-out dark:hover:bg-gray-950">
          <button type="submit">
            <Minus size={20} />
          </button>
        </VoteBlock>
      </form>
    </VoteScore>
  );
};

export default VoteForm;
