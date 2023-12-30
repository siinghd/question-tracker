'use client';
import React from 'react';
import { Button } from '../ui/button';

import { useAction } from '@/hooks/useAction';

import { toast } from 'sonner';

import { ArrowDownNarrowWideIcon, ArrowUpNarrowWideIcon } from 'lucide-react';

import { updateMessageVote } from '@/actions/messageVote';

interface IVoteFormProps {
  messageId: string;
  votes: number;
}

const VoteFormMessage: React.FC<IVoteFormProps> = ({
  messageId,

  votes = 0,
}) => {
  const { execute, fieldErrors, setFieldErrors } = useAction(
    updateMessageVote,
    {
      onSuccess: (data) => {
        toast.success(
          `Message has "${data?.upVotes}" up votes and "${data?.downVotes}" down votes Now`,
        );
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );
  const handleDownVote = () => {
    execute({ value: -1, messageId });
  };
  const handleUpVote = () => {
    execute({ value: 1, messageId });
  };

  // const userVoted = Boolean(votesArr.length);
  // const userVoteVal = votesArr[0];

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <form id="vote-up" action={handleUpVote} className="w-full">
        <button type="submit">
          <ArrowUpNarrowWideIcon
            className="w-4 h-4 animate-pulse"
            color="green"
          />
        </button>
      </form>
      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {votes}
      </span>
      <form id="vote-down" action={handleDownVote} className="w-full">
        <button type="submit">
          <ArrowDownNarrowWideIcon
            className="w-4 h-4 animate-pulse"
            color="red"
          />
        </button>
      </form>
    </div>
  );
};

export default VoteFormMessage;
