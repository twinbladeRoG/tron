import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ILlmCredentialPayload } from '@/types';

import {
  addLlmCredential,
  getLlmCredential,
  getLlmCredentials,
  removeLlmCredential,
  updateLlmCredential,
} from '../requests/llm-credentials.requests';

export const useLlmCredentials = () =>
  useQuery({
    queryKey: ['llm-credentials'],
    queryFn: async () => getLlmCredentials(),
  });

export const useLlmCredential = (id: string) =>
  useQuery({
    queryKey: ['llm-credential', id],
    queryFn: async () => getLlmCredential(id),
    enabled: !!id,
  });

export const useCreateLlmCredential = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ILlmCredentialPayload) => addLlmCredential(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['llm-credentials'] });
    },
  });
};

export const useUpdateLlmCredential = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; data: ILlmCredentialPayload }) =>
      updateLlmCredential(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['llm-credentials'] });
    },
  });
};

export const useRemoveLlmCredential = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => removeLlmCredential(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['llm-credentials'] });
    },
  });
};
