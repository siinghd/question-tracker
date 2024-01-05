'use client';
import React from 'react';
import { Button } from '../ui/button';
import { FormErrors } from './form-errors';
import { useAction } from '@/hooks/useAction';
import { updateVote } from '@/actions/vote';
import { toast } from 'sonner';
import { VoteBlock, VoteScore } from '../voteScore';
import {
  ArrowDownNarrowWideIcon,
  ArrowUpNarrowWideIcon,
  Minus,
  Plus,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'lucide-react';
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
      // toast(JSON.stringify(data));
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const handleDownVote = () => {
    toast.promise(execute({ value: -1, questionId, answerId }), {
      loading: 'Downvoting...',
      success: 'Question has been downvoted.',
      error: 'Error',
    });
  };
  const handleUpVote = () => {
    toast.promise(execute({ value: 1, questionId, answerId }), {
      loading: 'Upvoting...',
      success: 'Question has been upvoted.',
      error: 'Error',
    });
  };

  const userVoted = Boolean(votesArr.length);
  const userVoteVal = votesArr[0];

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <form id="vote-up" action={handleUpVote} className="w-full">
        <Button
          className="text-green-600 dark:text-green-400"
          variant="ghost"
          disabled={userVoted && userVoteVal.value === 1}
        >
          <ArrowUpNarrowWideIcon className="w-4 h-4" />
          upvote
        </Button>
      </form>
      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {votes}
      </span>
      <form id="vote-down" action={handleDownVote} className="w-full">
        <Button
          className="text-red-600 dark:text-red-400"
          variant="ghost"
          disabled={userVoted && userVoteVal.value === -1}
        >
          <ArrowDownNarrowWideIcon className="w-4 h-4" />
          downvote
        </Button>
      </form>
    </div>
  );
};

export default VoteForm;
