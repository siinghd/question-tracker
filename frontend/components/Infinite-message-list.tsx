'use client';
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  use,
  useMemo,
} from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteMessages } from '../hooks/useInfiniteMessages';
import { useSocket } from '../hooks/useSocket';
import { LiveChatSession } from '@prisma/client';
import { Session } from 'next-auth/types';
import { PRIORITY_HIGH, PRIORITY_ZER0, Roles, SocketEvent } from '@/types';

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
import VoteFormMessage from './form/form-vote-message';
import { CheckCheckIcon } from 'lucide-react';
import FormLiveSessionUpdate from './form/form-update-live-session';

dayjs.extend(relativeTime);
interface InfiniteMessageListProps {
  userSession: Session;
  liveSession: LiveChatSession;
}

const InfiniteMessageList: React.FC<InfiniteMessageListProps> = ({
  userSession,
  liveSession,
}) => {
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [liveMessages, setLiveMessages] = useState<ExtentedMessage[]>([]);
  const socket = useSocket(userSession, liveSession);
  const { data, fetchNextPage, hasNextPage } = useInfiniteMessages(
    liveSession.id,
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { ref: topMessageRef, inView } = useInView({ threshold: 0.5 });
  const { ref: bottomMessageRef, inView: isBottomInView } = useInView({
    threshold: 1,
  });
  const { execute } = useAction(createMessage);

  const mergeMessages = useCallback(
    (incomingMessages: ExtentedMessage[]) => {
      console.log(incomingMessages);
      setLiveMessages((prevMessages) => {
        // Create a map from existing messages for easy lookup
        const messagesById = new Map(prevMessages.map((msg) => [msg.id, msg]));

        incomingMessages.forEach((incomingMessage) => {
          const existingMessage = messagesById.get(incomingMessage.id);

          if (existingMessage) {
            // update the message if it already exists
            const updatedMessage = {
              ...existingMessage,
              upVotes:
                incomingMessage.upVotes !== undefined
                  ? incomingMessage.upVotes
                  : existingMessage.upVotes,
              downVotes:
                incomingMessage.downVotes !== undefined
                  ? incomingMessage.downVotes
                  : existingMessage.downVotes,
            };
            messagesById.set(incomingMessage.id, updatedMessage);
          } else {
            // If the message is new, add it to the map
            messagesById.set(incomingMessage.id, incomingMessage);
          }
        });

        // Convert the map back to an array and sort it
        return Array.from(messagesById.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });

      if (!messagesLoaded) setMessagesLoaded(true);
    },
    [messagesLoaded],
  );

  const handleNewMessage = useCallback(
    (newMessage: ExtentedMessage) => mergeMessages([newMessage]),
    [mergeMessages],
  );

  useEffect(() => {
    if (socket && socket.connected) {
      socket.on(SocketEvent.NewMessage, handleNewMessage);
      socket.on(SocketEvent.MessageVoteUpdate, handleNewMessage);
      return () => {
        socket.off(SocketEvent.NewMessage, handleNewMessage);
        socket.off(SocketEvent.MessageVoteUpdate, handleNewMessage);
      };
    }
  }, [socket, handleNewMessage]);
  useEffect(() => {
    if (isBottomInView && endRef.current && messagesLoaded) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveMessages, isBottomInView, messagesLoaded]);
  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
    if (data?.pages) mergeMessages(data.pages.flatMap((page) => page.result));
  }, [inView, hasNextPage, fetchNextPage, data, mergeMessages]);

  const handleMessageSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const message = new FormData(e.currentTarget).get('message') as string;
      execute({ content: message, sessionId: liveSession.id });
    },
    [execute, liveSession.id],
  );
  const handleRemoveItem = useCallback(
    (id: string) => {
      setLiveMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== id),
      );
    },
    [setLiveMessages],
  );
  const filteredLowPriorityMessages = useMemo(
    () => liveMessages.filter((msg) => msg.upVotes < PRIORITY_ZER0),
    [liveMessages],
  );

  const filteredMediumPriorityMessages = useMemo(
    () => liveMessages.filter((msg) => msg.upVotes >= PRIORITY_ZER0 && msg.upVotes <= PRIORITY_HIGH),
    [liveMessages],
  );

  const filteredHighPriorityMessages = useMemo(
    () => liveMessages.filter((msg) => msg.upVotes > PRIORITY_HIGH),
    [liveMessages],
  );

  const renderMessages = (
    filterFn: any,
    messages: ExtentedMessage[],
    dismissBtn = false,
  ) =>
    messages.filter(filterFn).map((message) => (
      <div className="flex flex-col space-y-2 " key={message.id}>
        <div className="flex items-center gap-2">
          <Avatar className="cursor-pointer">
            <AvatarImage
              className="h-10 w-10 rounded-full"
              src={message?.author.image || ''}
            />
            <AvatarFallback>
              {message?.author.name?.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <h2 className="font-semibold">{message.author.name}</h2>
          <p className="text-sm text-gray-500">
            {dayjs(message.createdAt).fromNow()}
          </p>

          <VoteFormMessage messageId={message.id} votes={message.upVotes} />

          {dismissBtn && userSession.user.role === Roles.admin && (
            <div className="flex gap-4">
              <div>{message.upVotes} </div>
              <div>
                <CheckCheckIcon
                  color="green"
                  className="hover:animate-pulse hover:underline cursor-pointer"
                  onClick={() => handleRemoveItem(message.id)}
                />
              </div>
            </div>
          )}
        </div>

        <p className="w-full break-all">{message.content}</p>
      </div>
    ));
  return (
    <div>
      <div className="flex justify-between items-center mb-6 px-8 pt-3">
        <div className="text-3xl dark:text-white  text-black transition-colors duration-500 w-full">
          <h1 className="text-black  dark:text-white w-full">
            Session : {liveSession.title}
          </h1>
        </div>
        <div>
          {userSession.user.role === Roles.admin && liveSession.isActive && (
            <FormLiveSessionUpdate
              idForm={liveSession.id}
              formData={{ sessionId: liveSession.id, isActive: false }}
              btnLabel="Close session"
            />
          )}
        </div>
      </div>
      <div key="1" className="grid grid-cols-1 lg:grid-cols-3 gap-4 ">
        <main className="flex flex-col p-4 h-[calc(100dvh_-_300px)] w-full">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Chat </h1>
          </header>
          <ScrollArea className="flex-grow overflow-y-auto mb-4 ">
            <div ref={topMessageRef}>Loading more messages...</div>
            <div className="space-y-4">
              {renderMessages(
                (msg: ExtentedMessage) => msg.upVotes < 1,
                filteredLowPriorityMessages,
              )}
            </div>
            <div ref={endRef} className="scroll-mb-0" />
            <div ref={bottomMessageRef} className="scroll-mb-0 mb-4" />
          </ScrollArea>
          {liveSession.isActive && (
            <form
              onSubmit={handleMessageSubmit}
              className="border-t pt-4 flex items-end"
            >
              <textarea
                className="flex-grow mr-2 rounded-md p-2"
                id="message"
                rows={2}
                name="message"
                placeholder="Type your message..."
              />

              <Button type="submit">Send</Button>
            </form>
          )}
        </main>

        <main className="flex flex-col p-4 h-[calc(100dvh_-_300px)] w-full">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">MEDIUM PRIORITY </h1>
          </header>
          <ScrollArea className="flex-grow overflow-y-auto mb-4 ">
            <div className="space-y-4">
              {renderMessages(
                (msg: ExtentedMessage) => msg.upVotes > 0,
                filteredMediumPriorityMessages,
                true,
              )}
            </div>
          </ScrollArea>
        </main>
        <main className="flex flex-col p-4 h-[calc(100dvh_-_300px)] w-full">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">HIGH PRIORITY </h1>
          </header>
          <ScrollArea className="flex-grow overflow-y-auto mb-4 ">
            <div className="space-y-4">
              {renderMessages(
                (msg: ExtentedMessage) => msg.upVotes > 20,
                filteredHighPriorityMessages,
                true,
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default InfiniteMessageList;
