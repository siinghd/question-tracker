'use client';

import { SocketEvent } from '@/types';
import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAction } from './useAction';
import { addSessionParticipant } from '@/actions/sessionParticipant';
import { Session } from 'next-auth/types';
import { LiveChatSession } from '@prisma/client';

export function useSocket(
  userSession: Session,
  liveSession: LiveChatSession
): Socket | null {
  const socketRef = useRef<Socket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 3;
  const retryDelay = 5000;
  const { execute } = useAction(addSessionParticipant);

  useEffect(() => {
    if (
      !userSession.user.externalToken ||
      !liveSession.isActive ||
      socketRef.current
    ) {
      return;
    }

    socketRef.current = io(
      process.env.NEXT_PUBLIC_SOCKET_IO_SERVER_URL as string,
      {
        query: {
          sessionId: liveSession.id,
          token: userSession.user.externalToken,
        },
        transports: ['websocket'],
      }
    );

    socketRef.current.on('connect', () => {
      if (socketRef?.current) {
        socketRef?.current.emit(SocketEvent.JoinSession, liveSession.id);
        execute({
          sessionId: liveSession.id,
          userId: userSession.user.id!,
        });
        retryCountRef.current = 0;
      }
    });

    const handleReconnect = (reason: any) => {
      if (retryCountRef.current < maxRetries) {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        retryTimeoutRef.current = setTimeout(() => {
          retryCountRef.current += 1;
          if (socketRef.current?.disconnected) {
            socketRef.current.connect();
          }
        }, retryDelay);
      } else {
        toast.info('Max reconnection attempts reached');
      }
    };
    socketRef.current.on('disconnect', handleReconnect);
    socketRef.current.on('connect_error', handleReconnect);
    socketRef.current.on('error', (errorMessage: string) => {
      toast.error(errorMessage);
      socketRef.current?.close();
    });

    return () => {
      console.log('Closing socket connection');
      if (socketRef.current?.connected) {
        socketRef.current.close();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [
    userSession.user.externalToken,
    liveSession.isActive,
    liveSession.id,
    execute,
    userSession.user.id,
  ]);

  return socketRef.current;
}
