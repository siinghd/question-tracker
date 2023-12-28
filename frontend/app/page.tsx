import { auth } from '@/auth';
import { NewPostDialog } from '@/components/NewPostDialog';
import { QueryParams, TabType } from '@/types';
import { getUpdatedUrl, paginationData } from '@/lib/functions';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import prisma from '@/PrismaClientSingleton';
import Pagination from '@/components/pagination';
import { ExtendedQuestion, QuestionQuery } from '@/actions/question/types';
import { Question } from '@prisma/client';
import Search from '@/components/search';

import VoteForm from '@/components/form/form-vote';
import { Card, CardBody } from '@/components/card';
import { VoteBlock, VoteScore } from '@/components/voteScore';
import { ArrowUpDownIcon, Minus, MoreHorizontal, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TextSnippet from '@/components/textSnippet';
import Tag from '@/components/tag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DeleteForm from '@/components/form/form-delete';
import MDEditor from '@uiw/react-md-editor';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';

type QuestionsResponse = {
  data: ExtendedQuestion[] | null;
  error: string | null;
};
const getQuestionsWithQuery = async (
  additionalQuery: Partial<QuestionQuery>,
  searchParams: QueryParams,
  sessionId: string
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
      upVotes: true,
      downVotes: true,
      totalAnswers: true,
      tags: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      votes: {
        where: {
          userId: sessionId,
        },
        select: {
          userId: true,
          value: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  };
  const dateFilter = searchParams.date;
  if (dateFilter) {
    const startDate = dayjs(dateFilter).startOf('day').toISOString();
    const endDate = dayjs(dateFilter).endOf('day').toISOString();

    additionalQuery.where = {
      ...additionalQuery.where,
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    };
  }
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

export default async function Home({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: QueryParams;
}) {
  const session = await auth();
  const sessionId = session?.user.id;

  let response;
  const tabType = searchParams.tabType || TabType.mu;
  if (
    !searchParams ||
    !searchParams.tabType ||
    searchParams.tabType === TabType.mu
  ) {
    response = await getQuestionsWithQuery(
      { orderBy: { upVotes: 'desc' } },
      searchParams,
      sessionId!
    );
  } else if (searchParams.tabType === TabType.mr) {
    response = await getQuestionsWithQuery(
      { orderBy: { createdAt: 'desc' } },
      searchParams,
      sessionId!
    );
  } else if (searchParams.tabType === TabType.md) {
    response = await getQuestionsWithQuery(
      { orderBy: { downVotes: 'desc' } },
      searchParams,
      sessionId!
    );
  } else {
    response = await getQuestionsWithQuery(
      {
        where: { authorId: sessionId },
      },
      searchParams,
      sessionId!
    );
  }

  return (
    <>
      <div className="h-screen md:p-8 transition-colors duration-500">
        <div className="flex justify-between items-center mb-6 px-8 pt-3">
          <div className="text-3xl dark:text-white  text-black transition-colors duration-500">
            <h1 className="text-black  dark:text-white">Questions</h1>
          </div>
          <Link
            className="bg-black text-white dark:bg-white dark:text-black light:text-black transition-colors duration-500 sticky p-3 rounded-md"
            href={getUpdatedUrl('/', searchParams, {
              newPost:
                searchParams.newPost === 'close' || !searchParams.newPost
                  ? 'open'
                  : 'close',
            })}
          >
            New Question
          </Link>
        </div>
        <NewPostDialog />
        <div className="md:mx-[15%] mx-auto md:p-10 ">
          <div className="flex flex-col items-center p-4 dark:text-white">
            <p>Coming soon: Live session with questions and more</p>
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
            <div className="w-full my-4 border-b dark:border-gray-600 flex justify-center space-x-4"></div>
            <div className="flex ">
              <Search />
              <div className="px-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="shrink-0" variant="outline">
                      <ArrowUpDownIcon className="w-4 h-4 mr-2" />
                      Sort by
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuRadioGroup value={tabType}>
                      <Link
                        className="py-2"
                        href={getUpdatedUrl('/', searchParams, {
                          tabType: TabType.mq,
                        })}
                      >
                        <DropdownMenuRadioItem value={TabType.mq}>
                          Your questions
                        </DropdownMenuRadioItem>
                      </Link>

                      <Link
                        href={getUpdatedUrl('/', searchParams, {
                          tabType: TabType.mu,
                        })}
                      >
                        <DropdownMenuRadioItem value={TabType.mu}>
                          Most Voted
                        </DropdownMenuRadioItem>
                      </Link>
                      <Link
                        href={getUpdatedUrl(`/`, searchParams, {
                          tabType: TabType.md,
                        })}
                      >
                        <DropdownMenuRadioItem value={TabType.md}>
                          Most Down Voted
                        </DropdownMenuRadioItem>
                      </Link>
                      <Link
                        href={getUpdatedUrl('/', searchParams, {
                          tabType: TabType.mr,
                        })}
                      >
                        <DropdownMenuRadioItem value={TabType.mr}>
                          Most Recent
                        </DropdownMenuRadioItem>
                      </Link>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="w-full m-auto">
              <div className="space-y-4 w-full">
                {response?.data?.map((post, index) => (
                  <PostCard
                    post={post}
                    sessionUser={session?.user}
                    key={post.id}
                    isAnswer={false}
                    questionId={post.id}
                    enableLink={true}
                    reply={false}
                    votes={post.votes}
                  />
                ))}
              </div>
            </div>
          </div>
          <Pagination dataLength={response?.data?.length || 0} />
        </div>
      </div>
    </>
  );
}
