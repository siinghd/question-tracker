import { auth } from '@/auth';
import Modal from '@/components/Modal';
import { NewPostDialog } from '@/components/NewPostDialog';
import useModal from '@/hooks/useModal';
import { QueryParams, TabType } from '@/types';
import { getUpdatedUrl, paginationData } from '@/lib/functions';
import Image from 'next/image';
import Link from 'next/link';

import prisma from '@/PrismaClientSingleton';
import Pagination from '@/components/pagination';
type QuestionAuthor = {
  name: string | null;
  id: string;
};

type QuestionData = {
  id: string;
  title: string;
  totalVotes: number;
  author: QuestionAuthor;
};
export default async function Home({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: QueryParams;
}) {
  const session = await auth();

  let data: QuestionData[] | null = null;
  const paginationQ = paginationData(searchParams);
  if (
    !searchParams ||
    !searchParams.tabType ||
    searchParams.tabType === TabType.mu
  ) {
    data = await prisma.question.findMany({
      take: paginationQ.pageSize,
      skip: paginationQ.skip,
      orderBy: {
        totalVotes: 'desc',
      },
      select: {
        id: true,
        title: true,
        totalVotes: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } else if (searchParams.tabType === TabType.mr) {
    data = await prisma.question.findMany({
      take: paginationQ.pageSize,
      skip: paginationQ.skip,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        totalVotes: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } else {
    data = await prisma.question.findMany({
      take: paginationQ.pageSize,
      skip: paginationQ.skip,
      where: {
        authorId: session?.user.id, // Replace with the actual user ID
      },

      select: {
        id: true,
        title: true,
        totalVotes: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
  console.log(data);
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
          <div className="space-y-4 w-full">
            {data?.map((post, index) => (
              <div
                key={index}
                className="w-full border rounded shadow dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Author: {post.author.name} | Votes: {post.totalVotes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Pagination dataLength={data?.length || 0} />
      </div>
    </>
  );
}
