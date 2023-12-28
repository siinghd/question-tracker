'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

import { Button } from './ui/button';
import { LiveChatSession } from '@/prisma/types';
import dayjs from 'dayjs';

import { Roles } from '@/types';
import { Session } from 'next-auth/types';
import { Badge } from './ui/badge';
import Link from 'next/link';
import FormLiveSessionUpdate from './form/form-update-live-session';

interface LiveChatSessionCardProps {
  liveChat: LiveChatSession;
  session: Session;
}
const LiveChatSessionCard: React.FC<LiveChatSessionCardProps> = ({
  liveChat,
  session,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">
          {liveChat.title}
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {dayjs(liveChat.createdAt).format('MMM DD, YYYY')}
        </p>
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-between py-4">
        <Badge
          className={`text-white ${
            liveChat.isActive
              ? 'bg-green-500 dark:bg-green-600'
              : 'bg-red-500 dark:bg-red-600'
          }`}
        >
          {liveChat.isActive ? 'On going' : 'Terminated'}
        </Badge>
        <div className="flex gap-3 items-center justify-center">
          <Link
            className="text-gray-900 dark:text-white p-3 hover:underline "
            href={`/livechat/${liveChat.id}`}
          >
            View
          </Link>
          {session.user.role === Roles.admin && liveChat.isActive && (
            <FormLiveSessionUpdate
              idForm={liveChat.id}
              formData={{
                sessionId: liveChat.id,
                isActive: false,
                title: liveChat.title,
              }}
              btnLabel="Terminate"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveChatSessionCard;
