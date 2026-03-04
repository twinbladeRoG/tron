import type {
  IKnowledgeBase,
  IKnowledgeBaseCreateRequest,
  IKnowledgeBaseQueryParams,
  IPagination,
} from '@/types';

import http from '../http';

export const getKnowledgeBases = async (query: IKnowledgeBaseQueryParams) => {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });

  if (query?.search) params.append('search', query.search);

  return http.get<{ data: Array<IKnowledgeBase>; pagination: IPagination }>(
    `/api/knowledge-base/?${params.toString()}`
  );
};

export const removeKnowledgeBase = (id: string) =>
  http.delete<IKnowledgeBase>(`/api/knowledge-base/${id}`);

export const getKnowledgeBase = (id: string) =>
  http.get<IKnowledgeBase>(`/api/knowledge-base/${id}`);

export const createKnowledgeBase = (payload: IKnowledgeBaseCreateRequest) =>
  http.post<IKnowledgeBase>(`/api/knowledge-base`, payload);
