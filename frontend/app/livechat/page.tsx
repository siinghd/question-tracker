import prisma from '@/PrismaClientSingleton';
import { auth } from '@/auth';
import LiveChatSessionCard from '@/components/live-chat-session-card';
import { NewLiveChatSession } from '@/components/new-chat-session';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { paginationData } from '@/lib/functions';
import { QueryParams } from '@/types';
import React from 'react';
async function getLiveChatSessions(searchParams: QueryParams) {
  const paginationQ = paginationData(searchParams); // pageNumber: number;  pageSize: number;   skip: number;

  try {
    const sessions = await prisma.liveChatSession.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: paginationQ.pageSize,
      skip: paginationQ.skip,
    });

    return sessions;
  } catch (error) {
    console.error('Error fetching live chat sessions:', error);
    throw error;
  }
}
const LiveChat = async ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: QueryParams;
}) => {
  const session = await auth();
  const data = await getLiveChatSessions(searchParams);

  return (
    <div className="h-screen p-8 transition-colors duration-500 ">
      <div className="flex justify-between items-center mb-6">
        <div className="text-3xl dark:text-white  text-black transition-colors duration-500">
          <h1 className="text-black  dark:text-white">Sessions</h1>
        </div>
        <NewLiveChatSession />
      </div>
      <main className=" p-4 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {data.map(chatSession => (
            <LiveChatSessionCard
              liveChat={chatSession}
              session={session!}
              key={chatSession.id}
            />
          ))}
        </div>
      </main>
      <Pagination dataLength={data.length} />
    </div>
  );
};

export default LiveChat;
