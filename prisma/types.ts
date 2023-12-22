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
  accounts: Account[];
  sessions: Session[];
  questions: Question[];
  answers: Answer[];
  votes: Vote[];
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
  createdAt: Date;
  updatedAt: Date;
  author: User;
  authorId: string;
  answers: Answer[];
  votes: Vote[];
  tags: string[];
}

export interface Answer {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  question: Question;
  questionId: string;
  author: User;
  authorId: string;
  votes: Vote[];
  parentId?: string | null;
  responses: Answer[];
  parent?: Answer | null;
}

export interface Vote {
  id: string;
  value: number;
  user: User;
  userId: string;
  question?: Question | null;
  questionId?: string | null;
  answer?: Answer | null;
  answerId?: string | null;
  updatedAt: Date;
}
