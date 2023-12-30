export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  user: User;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: User;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  accounts?: Account[];
  sessions?: Session[];
  questions?: Question[];
  answers?: Answer[];
  votes?: Vote[];
  messages?: Message[];
  messageVotes?: MessageVote[];
  sessionParticipations?: SessionParticipant[];
}

export interface VerificationToken {
  id: string;
  identifier: string;
  token: string;
  expires: Date;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: Date;
  author: User;
  authorId: string;
  upVotes?: number;
  downVotes?: number;
  totalAnswers: number;
  answers?: Answer[];
  votes?: Vote[];
  tags?: string[];
  updatedAt: Date;
}

export interface Answer {
  id: string;
  content: string;
  createdAt: Date;
  question?: Question;
  questionId: string;
  author?: User;
  authorId: string;
  votes?: Vote[];
  upVotes?: number;
  downVotes?: number;
  totalAnswers: number;
  updatedAt: Date;
  parentId?: string | null;
  responses?: Answer[];
  parent?: Answer | null;
}

export interface Vote {
  id: string;
  value: number;
  user?: User;
  userId: string;
  question?: Question | null;
  questionId?: string | null;
  answer?: Answer | null;
  answerId?: string | null;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  author: User;
  authorId: string;
  liveChatSession: LiveChatSession;
  sessionId: string;
  upVotes?: number;
  downVotes?: number;
  votes?: MessageVote[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageVote {
  id: string;
  value: number;
  user: User;
  userId: string;
  message: Message;
  messageId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveChatSession {
  id: string;
  title: string;
  date: Date;
  isActive: boolean;
  messages?: Message[];
  createdAt: Date;
  updatedAt: Date;
  participants?: SessionParticipant[];
}

export interface SessionParticipant {
  id: string;
  userId: string;
  sessionId: string;
  user: User;
  liveSession: LiveChatSession;
  joinedAt: Date;
}
