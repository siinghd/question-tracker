'use client';
import React from 'react';
import { Button } from '../ui/button';
import { FormErrors } from './form-errors';
import { useAction } from '@/hooks/useAction';
import { updateVote } from '@/actions/vote';
import { toast } from 'sonner';
import { VoteBlock, VoteScore } from '../voteScore';
import { Minus, Plus } from 'lucide-react';
import clsx from 'clsx';

interface IVoteFormProps {
  questionId: string | undefined;
  answerId: string | undefined;
  votes: number;
  votesArr: any[];
}

const VoteForm: React.FC<IVoteFormProps> = ({
  questionId,
  answerId,
  votes = 0,
  votesArr,
}) => {
  const { execute, fieldErrors, setFieldErrors } = useAction(updateVote, {
    onSuccess: (data) => {
      toast.success(
        `Question has "${data?.upVotes}" up votes and "${data?.downVotes}" down votes Now`,
      );
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

  const userVoted = Boolean(votesArr.length);
  const userVoteVal = votesArr[0];

  return (
    <VoteScore className="w-[100px]">
      <form id="vote-up" action={handleUpVote} className="w-full">
        <VoteBlock
          className={clsx(
            `rounded-t-xl cursor-pointer bg-[#F3F4F6]  duration-300 ease-in-out dark:bg-gray-900`,
            userVoted && userVoteVal.value === 1
              ? 'opacity-20 cursor-not-allowed'
              : 'hover:bg-gray-200 dark:hover:bg-gray-950',
          )}
        >
          <button
            className={clsx(
              userVoted && userVoteVal.value === 1 ? 'cursor-not-allowed' : '',
            )}
            disabled={userVoted && userVoteVal.value === 1}
            type="submit"
          >
            <Plus size={20} />
          </button>
        </VoteBlock>
      </form>
      <VoteBlock className=" border-t-0 border-b-0 text-sm  font-medium dark:bg-gray-900">
        {votes}
      </VoteBlock>
      <form id="vote-down" action={handleDownVote} className="w-full">
        <VoteBlock
          className={clsx(
            'rounded-b-xl cursor-pointer bg-[#F3F4F6 duration-300 dark:bg-gray-900 ease-in-out',
            userVoted && userVoteVal.value === -1
              ? 'opacity-20 cursor-not-allowed'
              : 'hover:bg-gray-200 dark:hover:bg-gray-950',
          )}
        >
          <button
            disabled={userVoted && userVoteVal.value === -1}
            type="submit"
          >
            <Minus size={20} />
          </button>
        </VoteBlock>
      </form>
    </VoteScore>
  );
};

export default VoteForm;
