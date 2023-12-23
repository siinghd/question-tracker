import { auth } from '@/auth';
import Modal from '@/components/Modal';
import { NewPostDialog } from '@/components/NewPostDialog';
import useModal from '@/hooks/useModal';
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
type Author = {
  id: string;
  name: string;
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
        slug: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
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
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
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
          </div>
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
                <div
                  key={index}
                  className="max-w-lg p-4 border rounded shadow-sm dark:bg-gray-800 dark:border-gray-700 w-full m-auto"
                >
                  <Link href={`/question/${post.slug}`}>
                    <p className="break-words text-gray-900 dark:text-gray-200 underline">
                      {post.title}{' '}
                      <span className="text-xs text-gray-500">
                        {dayjs(post.createdAt).format('YYYY/MM/DD HH:mm')}
                      </span>
                    </p>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Author: {post.author.name} | Votes: {post.totalVotes} |
                      Replies: {post.totalAnswers}
                    </span>
                    <VoteForm questionId={post.id} answerId={undefined} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Pagination dataLength={response?.data?.length || 0} />
      </div>
    </>
  );
}
