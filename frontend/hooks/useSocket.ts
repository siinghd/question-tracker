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
  const { execute } = useAction(addSessionParticipant);

  useEffect(() => {
    // Only try to connect if we have the necessary tokens and the session is active
    if (
      !userSession.user.externalToken ||
      !liveSession.isActive ||
      socketRef.current
    ) {
      return;
    }

    // Define the reconnection attempts and delay
    const maxReconnectAttempts = 3;
    let reconnectAttempts = 0;
    const reconnectDelay = 3000; // reconnect after 3 seconds

    socketRef.current = io(
      process.env.NEXT_PUBLIC_SOCKET_IO_SERVER_URL as string,
      {
        query: {
          sessionId: liveSession.id,
          token: userSession.user.externalToken,
        },
        transports: ['websocket'],
        reconnectionAttempts: maxReconnectAttempts, // use this for automatic reconnection attempts
        reconnectionDelay: reconnectDelay,
      }
    );

    socketRef.current.on('connect', () => {
      reconnectAttempts = 0; // reset reconnect attempts on successful connect
      if (socketRef.current) {
        socketRef.current.emit(SocketEvent.JoinSession, liveSession.id);
        execute({
          sessionId: liveSession.id,
          userId: userSession.user.id!,
        });
      }
    });

    const handleReconnectAttempt = () => {
      reconnectAttempts++;
      if (reconnectAttempts > maxReconnectAttempts) {
        toast.error(
          'Failed to reconnect to the session after several attempts.'
        );
        socketRef.current?.close();
      } else {
        toast.info(`Attempt ${reconnectAttempts} to reconnect...`);
      }
    };

    // Register the event for reconnection attempts
    socketRef.current.on('reconnect_attempt', handleReconnectAttempt);

    // Error handling
    const handleError = (error: any) => {
      toast.error(
        error.message || 'An error occurred with the socket connection.'
      );
      socketRef.current?.close();
    };

    socketRef.current.on('disconnect', handleError);
    socketRef.current.on('connect_error', handleError);
    socketRef.current.on('error', handleError);

    return () => {
      if (socketRef.current?.connected) {
        toast.info('Disconnecting from session');
        socketRef.current.close();
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
