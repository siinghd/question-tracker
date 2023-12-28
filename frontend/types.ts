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
