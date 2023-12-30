import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';

import { fetchMessagesFromDatabase } from '@/actions/message';
import { ExtentedMessage } from '@/actions/message/types';

export function useInfiniteMessages(sessionId: string): UseInfiniteQueryResult<
  {
    pages: { result: ExtentedMessage[]; nextPage: number | null }[];
    pageParams: (number | null)[];
  },
  unknown
> {
  return useInfiniteQuery({
    queryKey: ['messages', sessionId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetchMessagesFromDatabase(
        sessionId,
        pageParam,
        20
      );
      return response;
    },
    getNextPageParam: lastPage => {
      // use lastPage.nextPage to determine if there are more pages
      return lastPage.nextPage;
    },
    initialPageParam: 0,
  });
}
