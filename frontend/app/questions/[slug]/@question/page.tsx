import prisma from '@/frontend/PrismaClientSingleton';
import { auth } from '@/frontend/auth';
import PostCard from '@/components/PostCard';
import { QueryParams } from '@/frontend/types';

import React from 'react';

const SingleQuestionPage = async ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: QueryParams;
}) => {
  const session = await auth();
  const sessionId = session?.user.id;
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
      votes: {
        where: {
          userId: sessionId,
        },
        select: {
          userId: true,
          value: true,
        },
      },
    },
  });

  return (
    <div className="pt-14 md:mx-[15%]">
      <div className="flex items-center justify-center  px-3">
        {question && (
          <PostCard
            post={question}
            sessionUser={session?.user}
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
