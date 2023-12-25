import prisma from '@/PrismaClientSingleton';
import { auth } from '@/auth';
import PostCard from '@/components/PostCard';
import { QueryParams } from '@/types';
import React from 'react';
import { Answer } from '@/prisma/types';

const organizeAnswers = (
  answers: Answer[],
  parentId: string | null = null
): Answer[] => {
  return answers
    .filter((answer) => {
      return answer.parentId === parentId;
    })
    .map((answer) => {
      const organizedResponses = organizeAnswers(answers, answer.id);

      return {
        ...answer,
        responses: organizedResponses,
      };
    });
};

const fetchAnswersForQuestion = async (slug: string) => {
  const questionWithAnswers = await prisma.question.findUnique({
    where: {
      slug: slug,
    },
    include: {
      answers: {
        include: {
          author: true, // Include author details for each answer
          votes: true, // Include votes for each answer
          responses: true, // Include sub-answers (responses) for each answer
          // You can include other fields as needed
        },
      },
    },
  });

  return questionWithAnswers
    ? organizeAnswers(questionWithAnswers.answers, null)
    : [];
};
const SingleAnswerPage = async ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: QueryParams;
}) => {
  const session = await auth();
  const answers = await fetchAnswersForQuestion(params.slug);
  
  return (
    <div className="pt-14 pb-14">
      <div className=" flex items-center justify-center  px-3 flex-col gap-2">
        {answers.map((post) => (
          <PostCard
            key={post.id}
            questionId={post.questionId}
            post={post}
            userId={session?.user.id}
            reply={true}
          />
        ))}
      </div>
    </div>
  );
};

export default SingleAnswerPage;
