import prisma from '@/PrismaClientSingleton';
import { auth } from '@/auth';
import PostCard from '@/components/PostCard';
import { QueryParams } from '@/types';

import React from 'react';

const SingleQuestionPage = async ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: QueryParams;
}) => {
  const session = await auth();
  const question = await prisma.question.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      id: true,
      title: true,
      totalVotes: true,
      totalAnswers: true,
      tags: true,
      slug: true,
      authorId: true,
      content: true,
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
  });

  return (
    <div className="pt-14">
      <div className=" flex items-center justify-center  px-3 min-w-[70%]">
        {question && (
          <PostCard
            post={question}
            userId={session?.user.id}
            reply={true}
            questionId={question.id}
            isAnswer={false}
          />
        )}
      </div>
    </div>
  );
};

export default SingleQuestionPage;
