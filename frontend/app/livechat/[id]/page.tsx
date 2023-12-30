import prisma from '@/PrismaClientSingleton';
import { auth } from '@/auth';
import InfiniteMessageList from '@/components/Infinite-message-list';

import { QueryParams } from '@/types';
import { redirect } from 'next/navigation';
import React from 'react';

const page = async ({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: QueryParams;
}) => {
  const session = await auth();
  const isSession = await prisma.liveChatSession.findUnique({
    where: {
      id: params.id,
    },
  });
  if (!session) {
    redirect('/login');
  }
  if (!isSession) {
    redirect('/404');
  }
  return (
    <div className=" px-8  md:p-8 transition-colors duration-500">
      <InfiniteMessageList liveSession={isSession} userSession={session} />
    </div>
  );
};

export default page;
