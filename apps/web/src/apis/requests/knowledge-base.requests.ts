import {
  type IKnowledgeBase,
  type IKnowledgeBaseCreateRequest,
  type IKnowledgeBaseExtended,
  type IKnowledgeBaseFileLink,
  type IKnowledgeBaseFileWithLink,
  type IKnowledgeBaseQueryParams,
  type IPagination,
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
  http.get<IKnowledgeBaseExtended>(`/api/knowledge-base/${id}`);

export const createKnowledgeBase = (payload: IKnowledgeBaseCreateRequest) =>
  http.post<IKnowledgeBase>(`/api/knowledge-base`, payload);

export const addFileToKnowledgeBase = (id: string, fileIds: string[]) =>
  http.patch<IKnowledgeBase>(`/api/knowledge-base/${id}/file`, { file_ids: fileIds });

export const removeFileFromKnowledgeBase = (id: string, fileId: string) =>
  http.delete<IKnowledgeBase>(`/api/knowledge-base/${id}/file/${fileId}`);

export const trainKnowledgeBase = (id: string) => http.post(`/api/knowledge-base/${id}/train`, {});

export const getKnowledgeBaseFileLink = (id: string, fileId: string) =>
  http.get<IKnowledgeBaseFileLink>(`/api/knowledge-base/${id}/file/${fileId}`);

export const getKnowledgeBaseFiles = (id: string) =>
  http.get<Array<IKnowledgeBaseFileWithLink>>(`/api/knowledge-base/${id}/files`);
