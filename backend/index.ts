import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import { verify } from 'jsonwebtoken';

import Message from './models/message';
import LiveChatSession from './models/live-session-model';
import { jwtVerify } from 'jose';

enum SocketEvent {
  NewMessage = 'new message',
  MessageVoteUpdate = 'message vote update',
  MessageDeleted = 'message deleted',
  MessageReplaced = 'message replaced',
  Error = 'error',
  Notification = 'notification',
  Joined = 'joined',
  JoinSession = 'join session',
}

await mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

const io = new Server();

const authenticateSocket = async (socket: Socket, next: any) => {
  const token = socket.handshake.headers['authorization'];

  if (token) {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || '')
    );

    // Save the decoded token for future use
    socket.decoded = payload;
    next();
  } else {
    console.error('Authentication error: No token provided');
    next(new Error('Authentication error: No token provided'));
  }
};
const joinSession = async (socket: Socket, sessionId: string) => {
  try {
    const session = await LiveChatSession.findById(sessionId);

    if (!session) {
      socket.emit(SocketEvent.Error, 'Session not found');
      return;
    }

    const joinedRooms = Array.from(socket.rooms.values());
    if (joinedRooms.includes(sessionId)) {
      socket.emit(SocketEvent.Notification, 'You are already in the session');
      return;
    }

    socket.join(sessionId);
    socket.emit('joined', `Joined session ${sessionId}`);
  } catch (error: any) {
    console.error('Error joining session:', error.message);
    socket.emit(SocketEvent.Error, 'Error joining session');
  }
};

io.use(authenticateSocket).on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on(SocketEvent.JoinSession, (sessionId: string) =>
    joinSession(socket, sessionId)
  );
});

enum ChangeType {
  Insert = 'insert',
  Update = 'update',
  Delete = 'delete',
  Replace = 'replace',
}

Message.watch().on('change', async (change) => {
  try {
    if (change.operationType === ChangeType.Insert) {
      const newMessage = change.fullDocument;

      const sessionId = newMessage.liveChatSession.toString();
      io.to(sessionId).emit(SocketEvent.NewMessage, newMessage);
    } else if (change.operationType === ChangeType.Update) {
      const updatedFields = change.updateDescription?.updatedFields;
      const messageId = change.documentKey._id.toHexString(); // Convert ObjectId to string

      const updatedMessage = await Message.findById(messageId);
      if (updatedMessage) {
        const sessionId = updatedMessage.liveChatSession.toString();

        if (
          updatedFields &&
          ('upVotes' in updatedFields || 'downVotes' in updatedFields)
        ) {
          io.to(sessionId).emit(SocketEvent.MessageVoteUpdate, {
            messageId: updatedMessage._id,
            upVotes: updatedMessage.upVotes,
            downVotes: updatedMessage.downVotes,
          });
        }
      }
    } else if (change.operationType === ChangeType.Delete) {
      const messageId = change.documentKey._id.toHexString();
      io.emit(SocketEvent.MessageDeleted, { messageId });
    } else if (change.operationType === ChangeType.Replace) {
      const newMessage = change.fullDocument;
      if (newMessage) {
        const sessionId = newMessage.liveChatSession.toString();
        io.to(sessionId).emit(SocketEvent.MessageReplaced, newMessage);
      }
    }
  } catch (error) {
    console.error('Error processing change stream event:', error);
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
io.listen(PORT);
