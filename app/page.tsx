import { auth } from '@/auth';
import { NewPostDialog } from '@/components/NewPostDialog';
import { QueryParams, TabType } from '@/types';
import { getUpdatedUrl, paginationData } from '@/lib/functions';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import prisma from '@/PrismaClientSingleton';
import Pagination from '@/components/pagination';
import { QuestionQuery } from '@/actions/question/types';
import { Question } from '@prisma/client';
import Search from '@/components/search';

import VoteForm from '@/components/form/form-vote';
import { Card, CardBody } from '@/components/card';
import { VoteBlock, VoteScore } from '@/components/voteScore';
import { Minus, MoreHorizontal, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TextSnippet from '@/components/textSnippet';
import Tag from '@/components/tag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DeleteForm from '@/components/form/form-delete';
type Author = {
  id: string;
  name: string;
  image: string;
  // include other fields if necessary
};
type ExtendedQuestion = Question & {
  author: Author;
};
type QuestionsResponse = {
  data: ExtendedQuestion[] | null;
  error: string | null;
};

export default async function Home({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: QueryParams;
}) {
  const session = await auth();

  const getQuestionsWithQuery = async (
    additionalQuery: Partial<QuestionQuery>
  ): Promise<QuestionsResponse> => {
    const paginationQuery = {
      take: paginationData(searchParams).pageSize,
      skip: paginationData(searchParams).skip,
    };

    const searchQuery = searchParams.search
      ? {
          where: {
            ...additionalQuery.where, // Merge with existing where conditions
            title: {
              contains: searchParams.search,
              mode: 'insensitive' as const, // Ensuring the mode is a specific allowed value
            },
          },
        }
      : {};
    const baseQuery: QuestionQuery = {
      ...paginationQuery,
      select: {
        id: true,
        title: true,
        totalVotes: true,
        totalAnswers: true,
        tags: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    };
    try {
      const data: any = await prisma.question.findMany({
        ...baseQuery,
        ...searchQuery,
        ...additionalQuery,
      });
      return { data, error: null };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { data: null, error: errorMessage };
    }
  };

  let response;

  if (
    !searchParams ||
    !searchParams.tabType ||
    searchParams.tabType === TabType.mu
  ) {
    response = await getQuestionsWithQuery({ orderBy: { totalVotes: 'desc' } });
  } else if (searchParams.tabType === TabType.mr) {
    response = await getQuestionsWithQuery({ orderBy: { createdAt: 'desc' } });
  } else {
    response = await getQuestionsWithQuery({
      where: { authorId: session?.user.id },
    });
  }

  return (
    <>
      <NewPostDialog />
      <div className="container mx-auto md:p-10 ">
        <div className="flex flex-col items-center p-4 dark:text-white">
          <p>Coming soon: Reply to answers, Live session with questions</p>
          {/* <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <Image
              alt="User profile"
              className="w-24 h-24 rounded-full"
              height="96"
              src={session?.user.image || ''}
              style={{
                aspectRatio: '96/96',
                objectFit: 'cover',
              }}
              width="96"
            />
          </div> */}
          <div className="w-full my-4 border-b dark:border-gray-600 flex justify-center space-x-4">
            <Link
              className="py-2"
              href={getUpdatedUrl('/', searchParams, {
                tabType: TabType.mu,
              })}
            >
              Most upvoted
            </Link>
            <Link
              className="py-2"
              href={getUpdatedUrl('/', searchParams, {
                tabType: TabType.mr,
              })}
            >
              Most recent
            </Link>
            <Link
              className="py-2"
              href={getUpdatedUrl('/', searchParams, {
                tabType: TabType.mq,
              })}
            >
              Your questions
            </Link>

            <Link
              className="py-2"
              href={getUpdatedUrl('/', searchParams, {
                newPost:
                  searchParams.newPost === 'close' || !searchParams.newPost
                    ? 'open'
                    : 'close',
              })}
            >
              AAQ
            </Link>
          </div>
          <Search />
          <div className="w-full m-auto">
            <div className="space-y-4 w-full">
              {response?.data?.map((post, index) => (
                <Card className="md:w-[70%] bg-background mx-auto" key={index}>
                  <CardBody className="flex gap-5 items-start justify-between">
                    <VoteForm
                      votes={post.totalVotes}
                      questionId={post.id}
                      answerId={undefined}
                      key={post.id}
                    />

                    <div className="flex flex-1 flex-row items-start justify-between">
                      <Link href={`/questions/${post.id}`}>
                        <div>
                          <div className="flex items-center justify-start gap-3 my-2">
                            <Avatar className="cursor-pointer">
                              <AvatarImage
                                className="h-10 w-10 rounded-full"
                                src={post.author.image}
                              />
                              <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <TextSnippet className="font-medium">
                              {post.author.name}
                            </TextSnippet>
                            <TextSnippet className="text-sm text-gray-500">
                              {dayjs(post.createdAt).format(
                                'MMM YYYY/DD HH:mm'
                              )}
                            </TextSnippet>
                            <TextSnippet className="w-[10px] h-[10px] bg-blue-500 rounded-full"></TextSnippet>
                            <TextSnippet className="text-sm text-gray-500 -ml-2">
                              Edited on
                              {dayjs(post.updatedAt).format(
                                'MMM YYYY/DD HH:mm'
                              )}
                            </TextSnippet>
                          </div>
                          {post.tags
                            .filter((v) => v !== '')
                            .map((v, index) => (
                              <Tag name={v} key={index + v} />
                            ))}

                          <TextSnippet className="text-lg  py-2">
                            {post.title}
                          </TextSnippet>
                        </div>{' '}
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal
                            size={35}
                            className="active:outline-none hover:outline-none rounded-full border p-1.5 "
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-xl backdrop-blur bg-gray-200/30  dark:bg-gray-700/30 px-2 cursor-pointer py-2">
                          {post.author.id === session?.user.id && (
                            <DeleteForm
                              key={post.id}
                              questionId={post.id}
                              answerId={undefined}
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
                </Card>
              ))}
            </div>
          </div>
        </div>
        <Pagination dataLength={response?.data?.length || 0} />
      </div>
    </>
  );
}
