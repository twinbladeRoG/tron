import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IKnowledgeBaseCreateRequest, IKnowledgeBaseQueryParams } from '@/types';

import {
  createKnowledgeBase,
  getKnowledgeBase,
  getKnowledgeBases,
  removeKnowledgeBase,
} from '../requests/knowledge-base.requests';

export const useKnowledgeBases = (filter: IKnowledgeBaseQueryParams) =>
  useQuery({
    queryKey: ['knowledge-bases', filter],
    queryFn: async () => getKnowledgeBases(filter),
    placeholderData: keepPreviousData,
  });

export const useKnowledgeBase = (fileId: string) =>
  useQuery({
    queryKey: ['knowledge-base', fileId],
    queryFn: async () => getKnowledgeBase(fileId),
  });

export const useRemoveKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => removeKnowledgeBase(fileId),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
      await queryClient.invalidateQueries({ queryKey: ['knowledge-base', res.id] });
    },
  });
};

export const useCreateKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IKnowledgeBaseCreateRequest) => createKnowledgeBase(data),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
      await queryClient.invalidateQueries({ queryKey: ['knowledge-base', res.id] });
    },
  });
};
