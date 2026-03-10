import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { IKnowledgeBaseCreateRequest, IKnowledgeBaseQueryParams } from '@/types';

import {
  addFileToKnowledgeBase,
  createKnowledgeBase,
  getKnowledgeBase,
  getKnowledgeBaseFileLink,
  getKnowledgeBaseFiles,
  getKnowledgeBases,
  removeFileFromKnowledgeBase,
  removeKnowledgeBase,
  trainKnowledgeBase,
} from '../requests/knowledge-base.requests';

export const useKnowledgeBases = (filter: IKnowledgeBaseQueryParams) =>
  useQuery({
    queryKey: ['knowledge-bases', filter],
    queryFn: async () => getKnowledgeBases(filter),
    placeholderData: keepPreviousData,
  });

export const useKnowledgeBasesInfiniteQuery = (search?: string) =>
  useInfiniteQuery({
    queryKey: ['knowledge-bases-infinite', search],
    queryFn: async ({ pageParam = 0 }) => getKnowledgeBases({ page: pageParam, limit: 5, search }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.total_pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

export const useKnowledgeBase = (identifier?: string | null) =>
  useQuery({
    queryKey: ['knowledge-base', identifier],
    queryFn: async () => getKnowledgeBase(String(identifier)),
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
      await queryClient.invalidateQueries({ queryKey: ['knowledge-base-files', res.id] });
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
      await queryClient.invalidateQueries({ queryKey: ['knowledge-base-files', res.id] });
    },
  });
};

export const useTrainKnowledgeBase = () => {
  return useMutation({
    mutationFn: async (id: string) => trainKnowledgeBase(id),
    onSuccess: () => {},
  });
};

export const useKnowledgeBaseFileLink = (id: string, fileId: string) =>
  useQuery({
    queryKey: ['knowledge-base-file-link', id, fileId],
    queryFn: async () => getKnowledgeBaseFileLink(id, fileId),
  });

export const useKnowledgeBaseFiles = (id: string) =>
  useQuery({
    queryKey: ['knowledge-base-files', id],
    queryFn: async () => getKnowledgeBaseFiles(id),
  });
