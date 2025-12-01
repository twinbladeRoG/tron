import type { FileWithPath } from '@mantine/dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getFile, removeFile, uploadFile } from '../requests/files-storage.requests';

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
