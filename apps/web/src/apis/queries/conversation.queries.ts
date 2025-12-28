import { useQuery } from '@tanstack/react-query';

import type { IConversationQueryParams } from '@/types';

import { getUserConversations } from '../requests/conversation.requests';

export const useConversations = (filter?: IConversationQueryParams) =>
  useQuery({
    queryKey: ['conversations', filter],
    queryFn: async () => {
      const res = await getUserConversations(filter!);
      return res;
    },
    enabled: !!filter,
  });
