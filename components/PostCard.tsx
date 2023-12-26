"use client";

import React, { useState } from "react";
import { Card, CardBody, CardFooter } from "./card";
import VoteForm from "./form/form-vote";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import TextSnippet from "./textSnippet";
import dayjs from "dayjs";
import MDEditor from "@uiw/react-md-editor";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import DeleteForm from "./form/form-delete";

import Link from "next/link";
import Tag from "./tag";
import { MessageSquareReply, MoreHorizontal } from "lucide-react";
import { ExtendedQuestion } from "@/actions/question/types";
import { useAction } from "@/hooks/useAction";
import { createAnswer } from "@/actions/answer";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { FormErrors } from "./form/form-errors";
import { Answer } from "@/prisma/types";

interface IProps {

	post: ExtendedQuestion | Answer;
	userId: string | undefined | null;
	reply?: boolean;
	enableLink?: boolean;
	isAnswer?: boolean;
	questionId: string;
  votes?: any[];

}
const isExtendedQuestion = (
	post: ExtendedQuestion | Answer
): post is ExtendedQuestion => {
	return (post as ExtendedQuestion).slug !== undefined;
};
const PostCard: React.FC<IProps> = ({

  post,
  userId,
  questionId,
  reply = false,
  enableLink = false,
  isAnswer = true,
  votes,

}) => {
	const [markDownValue, setMarkDownValue] = useState("");
	const [enableReply, setEnableReply] = useState(false);
	const handleMarkdownChange = (newValue?: string) => {
		if (typeof newValue === "string") {
			setMarkDownValue(newValue);
		}
	};

	const { execute, fieldErrors, setFieldErrors } = useAction(createAnswer, {
		onSuccess: (data) => {
			toast.success(`Answer created`);
			if (!fieldErrors?.content) {
				setEnableReply((prev) => !prev);
				setMarkDownValue("");
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
        <div className="flex items-center justify-start gap-3 my-2">
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
            {dayjs(post.createdAt).format('MMM YYYY/DD HH:mm')}
          </TextSnippet>
          <TextSnippet className="w-[10px] h-[10px] bg-blue-500 rounded-full"></TextSnippet>
          <TextSnippet className="text-sm text-gray-500 -ml-2">
            Edited on&nbsp;
            {dayjs(post.updatedAt).format('MMM YYYY/DD HH:mm')}
          </TextSnippet>
        </div>
        {isExtendedQuestion(post) &&
          post.tags
            .filter((v) => v !== '')
            .map((v, index) => <Tag name={v} key={index + v} />)}


				{!isAnswer && isExtendedQuestion(post) && (
					<TextSnippet className='text-lg  py-2'>{post?.title}</TextSnippet>
				)}
				{post.content && (
					<MDEditor.Markdown
						source={post.content}
						style={{
							whiteSpace: "pre-wrap",
							wordBreak: "break-word",
							overflowWrap: "break-word",
						}}
					/>
				)}

				<div className='flex gap-3 p-3'>
					{reply && (
						<TextSnippet
							className='flex items-center gap-2 cursor-pointer'
							onClick={() => setEnableReply((prev) => !prev)}>
							<MessageSquareReply
								size={18}
								color='#3B81F6'
								fill='#3B81F6'
								className='hover:scale-125 duration-300 ease-in-out'
							/>
							<p className='text-sm'>
								{reply && enableReply ? "close" : "reply"}
							</p>
						</TextSnippet>
					)}
					<TextSnippet className='flex items-center gap-2 cursor-pointer'>
						<MessageSquareReply
							size={18}
							color='#3B81F6'
							fill='#3B81F6'
							className='hover:scale-125 duration-300 ease-in-out'
						/>
						<p className='text-sm'>{post.totalAnswers}</p>
					</TextSnippet>
				</div>

        {enableReply && (
          <form onSubmit={handleSubmit}>
            <MDEditor
              id={post.id}
              value={markDownValue}
              onChange={handleMarkdownChange}
            />
            <FormErrors id="content" errors={fieldErrors} />
            <Button type="submit" className="m-3">
              Reply
            </Button>
          </form>
        )}
      </div>
    );
  };
  return (
    <Card className="w-full  bg-background ">
      <CardBody className="flex gap-5 items-start justify-between">
        <VoteForm
          votes={post.totalVotes}
          questionId={isAnswer ? undefined : post.id}
          answerId={isAnswer ? post.id : undefined}
          key={post.id}
          votesArr={votes || []}
        />


				<div className='flex flex-1 flex-row items-start justify-between w-full'>
					{enableLink && isExtendedQuestion(post) ? (
						<Link href={`/questions/${post?.slug}`}>{internalDetails()}</Link>
					) : (
						internalDetails()
					)}

					<DropdownMenu>
						<DropdownMenuTrigger>
							<MoreHorizontal
								size={35}
								className='active:outline-none hover:outline-none rounded-full border p-1.5 '
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='rounded-xl backdrop-blur bg-gray-200/30  dark:bg-gray-700/30 px-2 cursor-pointer py-2'>
							{post?.author?.id === userId && (
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
      </CardBody>
      {isAnswer && !isExtendedQuestion(post) && (
        <CardFooter className="m-0 w-full flex-col">
          {post.responses &&
            post?.responses.length > 0 &&
            post?.responses.map((post: Answer) => (
              <PostCard
                key={post.id}
                questionId={post.questionId}
                post={post}
                userId={userId}
                reply={true}
              />
            ))}
        </CardFooter>
      )}
    </Card>
  );

};

export default PostCard;
