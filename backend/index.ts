import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import { verify } from 'jsonwebtoken';

import Message from './models/message';
import LiveChatSession from './models/live-session-model';
import { jwtVerify } from 'jose';
import './models/user';
import './models/message-vote';

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
  const token = socket.handshake.query.token as string;

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
    let message: any;
    if (['insert', 'update', 'replace'].includes(change.operationType)) {
      const messageId =
        change.operationType === 'insert'
          ? change.fullDocument._id
          : change.documentKey._id;

      message = await Message.findById(messageId).populate('authorId').lean();
    }
    if (!message) {
      return;
    }

    message.author = message.authorId;

    switch (change.operationType) {
      case ChangeType.Insert:
        io.to(message.sessionId.toString()).emit(
          SocketEvent.NewMessage,
          message
        );
        break;

      case ChangeType.Update:
        const updatedFields = change.updateDescription?.updatedFields;
        if (
          updatedFields &&
          ('upVotes' in updatedFields || 'downVotes' in updatedFields)
        ) {
          io.to(message.sessionId.toString()).emit(
            SocketEvent.MessageVoteUpdate,
            {
              messageId: message._id,
              upVotes: message.upVotes,
              downVotes: message.downVotes,
            }
          );
        }
        break;

      case ChangeType.Delete:
        const messageId = change.documentKey._id.toHexString();
        io.emit(SocketEvent.MessageDeleted, { messageId });
        break;

      case ChangeType.Replace:
        io.to(message.sessionId.toString()).emit(
          SocketEvent.MessageReplaced,
          message
        );
        break;
    }
  } catch (error) {
    console.error('Error processing change stream event:', error);
  }
});
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
io.listen(PORT, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*', // Allow all origins
    methods: ['GET', 'POST'],
    allowedHeaders: '*',
    credentials: true,
  },
  path: '/socket.io',
  transports: ['websocket'],
});
