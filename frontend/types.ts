export const PRIORITY_ZER0 = 10
export const PRIORITY_HIGH = 20;


export enum TabType {
  md = 'Most downvotes',
  mu = 'Most upvotes',
  mr = 'Most Recent',
  mq = 'My question',
}
export enum Roles {
  admin = 'admin',
  user = 'user',
}

export interface QueryParams {
  limit?: number;
  page?: number;
  tabType?: TabType;
  newPost?: 'open' | 'close';
  search?: string;
  date?: string;
}

export type Delete = {
  message: string;
};
export enum SocketEvent {
  NewMessage = 'new message',
  MessageVoteUpdate = 'message vote update',
  MessageDeleted = 'message deleted',
  MessageReplaced = 'message replaced',
  Error = 'error',
  Notification = 'notification',
  Joined = 'joined',
  JoinSession = 'join session',
}
