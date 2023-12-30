import prisma from '@/PrismaClientSingleton';
import { auth } from '@/auth';
import InfiniteMessageList from '@/components/Infinite-message-list';
import { Button } from '@/components/ui/button';

import { QueryParams, Roles } from '@/types';
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
      <div className="flex justify-between items-center mb-6 px-8 pt-3">
        <div className="text-3xl dark:text-white  text-black transition-colors duration-500">
          <h1 className="text-black  dark:text-white">
            Session : {isSession.title}
          </h1>
        </div>
        {session.user.role === Roles.admin && isSession.isActive && (
          <Button className="bg-black text-white dark:bg-white dark:text-black light:text-black transition-colors duration-500 sticky p-3 rounded-md">
            Close session
          </Button>
        )}
      </div>
      <InfiniteMessageList liveSession={isSession} userSession={session} />
    </div>
  );
};

export default page;
