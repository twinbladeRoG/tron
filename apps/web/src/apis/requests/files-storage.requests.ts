import { type FileWithPath } from '@mantine/dropzone';

import type { IFile, IFileQueryParams, IPagination } from '@/types';

import http from '../http';

export const getUsersFiles = async (query: IFileQueryParams) => {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });

  if (query?.search) params.append('search', query.search);
  if (query?.file_types) {
    query.file_types.forEach((item) => {
      params.append('file_types', item);
    });
  }
  if (query?.exclude_ids) {
    query.exclude_ids.forEach((item) => {
      params.append('exclude_ids', item);
    });
  }

  return http.get<{ data: Array<IFile>; pagination: IPagination }>(
    `/api/file-storage/?${params.toString()}`
  );
};

export const uploadFile = (file: File | FileWithPath) => {
  const headers = new Headers();
  const formData = new FormData();
  formData.append('file', file);

  return http.post<IFile>('/api/file-storage/', formData, { headers });
};

export const removeFile = (fileId: string) => http.delete(`/api/file-storage/${fileId}`);

export const getFile = (fileId: string) => http.get<IFile>(`/api/file-storage/${fileId}`);

export const markFileAsPrivate = (fileId: string) =>
  http.patch<IFile>(`/api/file-storage/${fileId}/mark-as-private`);

export const markFileAsPublic = (fileId: string) =>
  http.patch<IFile>(`/api/file-storage/${fileId}/mark-as-public`);
