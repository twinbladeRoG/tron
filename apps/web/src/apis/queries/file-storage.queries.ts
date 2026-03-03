import type { FileWithPath } from '@mantine/dropzone';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IFileQueryParams } from '@/types';

import {
  getFile,
  getUsersFiles,
  markFileAsPrivate,
  markFileAsPublic,
  removeFile,
  uploadFile,
} from '../requests/files-storage.requests';

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File | FileWithPath) => {
      const res = await uploadFile(file);
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-files'] });
    },
  });
};

export const useUserFiles = (filter: IFileQueryParams) =>
  useQuery({
    queryKey: ['user-files', filter],
    queryFn: async () => {
      const res = await getUsersFiles(filter);
      return res;
    },
    placeholderData: keepPreviousData,
  });

export const useRemoveFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const res = await removeFile(fileId);
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-files'] });
    },
  });
};

export const useFile = (fileId: string) =>
  useQuery({
    queryKey: ['file', fileId],
    queryFn: async () => {
      const res = await getFile(fileId);
      return res;
    },
  });

export const useMarkFileAsPrivate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => markFileAsPrivate(fileId),
    onSuccess: async (file) => {
      await queryClient.invalidateQueries({ queryKey: ['user-files'] });
      await queryClient.invalidateQueries({ queryKey: ['file', file.id] });
    },
  });
};

export const useMarkFileAsPublic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => markFileAsPublic(fileId),
    onSuccess: async (file) => {
      await queryClient.invalidateQueries({ queryKey: ['user-files'] });
      await queryClient.invalidateQueries({ queryKey: ['file', file.id] });
    },
  });
};
