'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteMessages } from '../hooks/useInfiniteMessages';
import { useSocket } from '../hooks/useSocket';
import { LiveChatSession } from '@prisma/client';
import { Session } from 'next-auth/types';
import { SocketEvent } from '@/types';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { useAction } from '@/hooks/useAction';
import { createMessage } from '@/actions/message';
import { toast } from 'sonner';
import { ExtentedMessage } from '@/actions/message/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
interface InfiniteMessageListProps {
  userSession: Session;
  liveSession: LiveChatSession;
}

const InfiniteMessageList: React.FC<InfiniteMessageListProps> = ({
  userSession,
  liveSession,
}) => {
  const [liveMessages, setLiveMessages] = useState<ExtentedMessage[]>([]);
  const socket = useSocket(userSession, liveSession);

  const { data, fetchNextPage, hasNextPage } = useInfiniteMessages(
    liveSession.id,
  );
  const { ref, inView } = useInView();

  const { execute, fieldErrors, setFieldErrors } = useAction(createMessage, {
    onSuccess: (data) => {
      // toast.success(`${data.message}`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  useEffect(() => {
    // Function to merge new messages avoiding duplicates
    const mergeMessages = (newMessage: ExtentedMessage) => {
      console.log(newMessage)
      setLiveMessages((prevMessages: ExtentedMessage[]) => {
        if (!prevMessages.some((msg) => msg.id === newMessage.id)) {
          return [newMessage, ...prevMessages];
        }
        return prevMessages.map((msg) =>
          msg.id === newMessage.id ? newMessage : msg,
        );
      });
    };

    if (socket && socket.connected) {
      socket.on(SocketEvent.NewMessage, mergeMessages);
      socket.on(SocketEvent.MessageVoteUpdate, mergeMessages);
    }

    return () => {
      socket?.off(SocketEvent.NewMessage, mergeMessages);
      socket?.off(SocketEvent.MessageVoteUpdate, mergeMessages);
    };
  }, [socket]);

  useEffect(() => {
    if (data?.pages) {
      const loadedMessages = data.pages.flatMap((page) => page.result);
      setLiveMessages((prevMessages: ExtentedMessage[]) => {
        const combined = [...prevMessages, ...loadedMessages];
        return combined.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
        );
      });
    }
  }, [data]);
  const handleMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message') as string;
    execute({ content: message, sessionId: liveSession.id });
  };

  console.log(liveMessages, data);
  return (
    <div key="1" className="grid grid-cols-1 lg:grid-cols-3 gap-4 ">
      <div className="h-full flex flex-col max-h-[calc(100dvh_-_21%)]">
        <div className="border-r border-gray-200 overflow-hidden relative h-full pb-10">
          <h2 className="text-lg font-bold">Chat</h2>
          <ScrollArea className="h-full w-full p-4 space-y-4">
            <div className="space-y-4">
              {liveMessages.map((message) => (
                <div className="flex items-start space-x-2" key={message.id}>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      className="h-10 w-10 rounded-full"
                      src={message?.author.image || ''}
                    />
                    <AvatarFallback>
                      {message?.author.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p>
                      <strong>{message?.author.name}:</strong>
                      {message.content}
                    </p>
                    <p className="text-gray-500">
                      {dayjs(message.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="p-4 border-t border-gray-200 ">
          <form
            className="flex items-center space-x-2"
            onSubmit={handleMessageSubmit}
          >
            <Input type="text" id="message" name="message" />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
      <div>
        <div className="border-r border-gray-200 overflow-auto ">
          <ScrollArea className="h-full w-full p-4 space-y-4">
            <h2 className="text-lg font-bold">Medium Priority</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Question 1</h3>
                  <Badge>Medium Priority</Badge>
                </CardHeader>
                <CardContent>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Question 2</h3>
                  <Badge>Medium Priority</Badge>
                </CardHeader>
                <CardContent>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="overflow-auto">
        <ScrollArea className="h-full w-full p-4 space-y-4">
          <h2 className="text-lg font-bold">High Priority</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Message 1</h3>
                <Badge color="red">High Priority</Badge>
              </CardHeader>
              <CardContent>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Message 2</h3>
                <Badge color="red">High Priority</Badge>
              </CardHeader>
              <CardContent>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default InfiniteMessageList;
