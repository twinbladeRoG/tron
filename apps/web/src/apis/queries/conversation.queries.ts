import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IConversationQueryParams } from '@/types';

import {
  deleteConversation,
  getConversationMessages,
  getUserConversations,
} from '../requests/conversation.requests';

export const useConversations = (filter?: IConversationQueryParams) =>
  useQuery({
    queryKey: ['conversations', filter],
    queryFn: async () => {
      const res = await getUserConversations(filter!);
      return res;
    },
    enabled: !!filter,
  });

export const useConversationMessages = (id: string) =>
  useQuery({
    queryKey: ['conversation-messages', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await getConversationMessages(id);
      return res;
    },
  });

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteConversation(id);
      return res.id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
