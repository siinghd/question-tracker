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
  const sessionId = session?.user.id;
  const question = await prisma.question.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      id: true,
      title: true,
      upVotes: true,
      downVotes: true,
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
    <div className="md:mx-[15%] mt-5">
      <div className="flex items-center justify-center  px-3">
        {question && (
          <PostCard
            post={question}
            sessionUser={session?.user}
            reply={true}
            questionId={question.id}
            isAnswer={false}
            enableLink={false}
          />
        )}
      </div>
    </div>
  );
};

export default SingleQuestionPage;
