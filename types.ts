export enum TabType {
	mu = "Most upvotes",
	mr = "Most Recent",
	mq = "My question",
}

export interface QueryParams {
  limit?: number;
  page?: number;
  tabType?: TabType;
  newPost?: 'open' | 'close';
  search?: string;
}
