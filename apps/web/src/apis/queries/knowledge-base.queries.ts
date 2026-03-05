import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IKnowledgeBaseCreateRequest, IKnowledgeBaseQueryParams } from '@/types';

import {
  addFileToKnowledgeBase,
  createKnowledgeBase,
  getKnowledgeBase,
  getKnowledgeBases,
  removeFileFromKnowledgeBase,
  removeKnowledgeBase,
} from '../requests/knowledge-base.requests';

export const useKnowledgeBases = (filter: IKnowledgeBaseQueryParams) =>
  useQuery({
    queryKey: ['knowledge-bases', filter],
    queryFn: async () => getKnowledgeBases(filter),
    placeholderData: keepPreviousData,
  });

export const useKnowledgeBase = (identifier: string) =>
  useQuery({
    queryKey: ['knowledge-base', identifier],
    queryFn: async () => getKnowledgeBase(identifier),
    enabled: !!identifier,
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

export const useAddFileToKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fileIds }: { id: string; fileIds: string[] }) =>
      addFileToKnowledgeBase(id, fileIds),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['knowledge-base', res.id] });
      await queryClient.invalidateQueries({ queryKey: ['knowledge-base', res.slug] });
    },
  });
};

export const useRemoveFileFromKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fileId }: { id: string; fileId: string }) =>
      removeFileFromKnowledgeBase(id, fileId),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ['knowledge-base', res.id] });
      await queryClient.invalidateQueries({ queryKey: ['knowledge-base', res.slug] });
    },
  });
};
