import { type FileWithPath } from '@mantine/dropzone';

import type { IFile } from '@/types';

import http from '../http';

export const uploadFile = (file: File | FileWithPath) => {
  const headers = new Headers();
  const formData = new FormData();
  formData.append('file', file);

  return http.post<IFile>('/api/file-storage/', formData, { headers });
};

export const removeFile = (fileId: string) => http.delete(`/api/file-storage/${fileId}`);

export const getFile = (fileId: string) => http.get<IFile>(`/api/file-storage/${fileId}`);
