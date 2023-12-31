'use client';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import React, { useState } from 'react';
import { Card, CardBody, CardFooter } from './card';
import VoteForm from './form/form-vote';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import TextSnippet from './textSnippet';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import MDEditor from '@uiw/react-md-editor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import DeleteForm from './form/form-delete';

import Link from 'next/link';
import Tag from './tag';
import {
  ArrowDownNarrowWideIcon,
  ArrowUpNarrowWideIcon,
  MessageSquareReply,
  MoreHorizontal,
} from 'lucide-react';
import { Author, ExtendedQuestion } from '@/actions/question/types';
import { useAction } from '@/hooks/useAction';
import { createAnswer } from '@/actions/answer';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { FormErrors } from './form/form-errors';
import { Answer } from '@/prisma/types';
import { Roles } from '@/types';
import { useTheme } from 'next-themes';

interface IProps {
  post: ExtendedQuestion | Answer;
  sessionUser: Author | undefined | null;
  reply?: boolean;
  enableLink?: boolean;
  isAnswer?: boolean;
  questionId: string;
  votes?: any[];
}
const isExtendedQuestion = (
  post: ExtendedQuestion | Answer,
): post is ExtendedQuestion => {
  return (post as ExtendedQuestion).slug !== undefined;
};
const PostCard: React.FC<IProps> = ({
  post,
  sessionUser,
  questionId,
  reply = false,
  enableLink = false,
  isAnswer = true,
  votes,
}) => {
  const { theme } = useTheme();

  const [markDownValue, setMarkDownValue] = useState('');
  const [enableReply, setEnableReply] = useState(false);
  const handleMarkdownChange = (newValue?: string) => {
    if (typeof newValue === 'string') {
      setMarkDownValue(newValue);
    }
  };

  const { execute, fieldErrors, setFieldErrors } = useAction(createAnswer, {
    onSuccess: (data) => {
      toast.success(`Answer created`);
      if (!fieldErrors?.content) {
        setEnableReply((prev) => !prev);
        setMarkDownValue('');
      }
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    execute({
      content: markDownValue,
      questionId: questionId,
      parentId: isAnswer ? post.id : undefined,
    });
  };

  const internalDetails = () => {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between gap-3 my-2">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="cursor-pointer">
              <AvatarImage
                className="h-10 w-10 rounded-full"
                src={post?.author?.image || ''}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <TextSnippet className="font-medium">
              {post?.author?.name}
            </TextSnippet>
            <TextSnippet className="text-sm text-gray-500">
              {dayjs(post.createdAt).fromNow()}
            </TextSnippet>
            <TextSnippet className="w-[10px] h-[10px] bg-blue-500 rounded-full"></TextSnippet>
            <TextSnippet className="text-sm text-gray-500 -ml-2">
              Edited on&nbsp;
              {dayjs(post.updatedAt).fromNow()}
            </TextSnippet>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal
                size={35}
                className="active:outline-none hover:outline-none rounded-full border p-1.5 "
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl backdrop-blur bg-gray-200/30  dark:bg-gray-700/30 px-2 cursor-pointer py-2">
              {(sessionUser?.role === Roles.admin ||
                post?.author?.id === sessionUser?.id) && (
                <DeleteForm
                  key={post.id}
                  questionId={!isAnswer ? post.id : undefined}
                  answerId={isAnswer ? post.id : undefined}
                />
              )}
              <hr />
              {/* <DropdownMenuItem className="text-sm px-1 py-2 hover:border-none hover:outline-none">
                            Report spam
                          </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isExtendedQuestion(post) &&
          post.tags
            .filter((v) => v !== '')
            .map((v, index) => <Tag name={v} key={index + v} />)}

        {!isAnswer && enableLink && isExtendedQuestion(post) && (
          <Link href={`/questions/${post?.slug}`}>
            <TextSnippet className="text-lg  py-2 hover:underline">
              {post?.title}
            </TextSnippet>
          </Link>
        )}
        {!isAnswer && !enableLink && isExtendedQuestion(post) && (
          <TextSnippet className="text-lg  py-2 hover:underline">
            {post?.title}
          </TextSnippet>
        )}
        {post.content && (
          <div data-color-mode={theme}>
            <div className="wmde-markdown-var"> </div>
            <MDEditor.Markdown
              className="text-black dark:text-white"
              source={post.content}
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                backgroundColor: 'transparent',
              }}
            />
          </div>
        )}

        {enableReply && (
          <div>
            <hr className="mt-3 mb-3" />
            <form onSubmit={handleSubmit}>
              <div data-color-mode={theme}>
                <div className="wmde-markdown-var"> </div>
                <MDEditor
                  id={post.id}
                  value={markDownValue}
                  onChange={handleMarkdownChange}
                />
                <FormErrors id="content" errors={fieldErrors} />
                <Button type="submit" className="m-3">
                  Reply
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };
  return (
    <Card className="w-full bg-background ">
      <CardBody className="flex gap-5 items-start justify-between">
        <div className="flex flex-1 flex-row items-start justify-between w-full">
          {internalDetails()}
        </div>
      </CardBody>

      <CardFooter className="flex items-center justify-between p-2 sm:p-4 border-gray-200 dark:border-gray-700 flex-col">
        <div className="flex justify-between w-full">
          <div className="flex">
            <VoteForm
              votes={post.upVotes || 0 /*  - (post.downVotes || 0) */} // todo fix
              questionId={isAnswer ? undefined : post.id}
              answerId={isAnswer ? post.id : undefined}
              key={post.id}
              votesArr={votes || []}
            />
            <TextSnippet className="flex items-center gap-2 cursor-pointer">
              <MessageSquareReply
                size={18}
                color="#3B81F6"
                fill="#3B81F6"
                className="hover:scale-125 duration-300 ease-in-out"
              />
              <p className="text-sm">{post.totalAnswers}</p>
            </TextSnippet>
          </div>
          {reply && (
            <Button
              className="text-blue-600 dark:text-blue-400"
              variant="ghost"
              onClick={() => setEnableReply((prev) => !prev)}
            >
              {reply && enableReply ? 'close' : 'reply'}
            </Button>
          )}
        </div>
        {isAnswer &&
          !isExtendedQuestion(post) &&
          post.responses &&
          post?.responses.length > 0 &&
          post?.responses.map((post: Answer) => (
            <div key={post.id} className="w-full">
              <hr className="mt-1 mb-1 w-3 m-auto" />
              <PostCard
                questionId={post.questionId}
                post={post}
                sessionUser={sessionUser}
                reply={true}
              />
            </div>
          ))}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
