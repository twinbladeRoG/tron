import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IAddLlmModelRequest } from '@/types';

import {
  addLlmModel,
  getLlmModel,
  getLlmModels,
  removeLlmModel,
  updateLlmModel,
} from '../requests/llm-models.requests';

export const useLlmModels = () =>
  useQuery({
    queryKey: ['llm-models'],
    queryFn: async () => getLlmModels(),
  });

export const useLlmModel = (id: string) =>
  useQuery({
    queryKey: ['llm-model', id],
    queryFn: async () => getLlmModel(id),
    enabled: !!id,
  });

export const useAddLlmModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IAddLlmModelRequest) => {
      const res = await addLlmModel(data);
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['llm-models'] });
    },
  });
};

export const useUpdateLlmModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; payload: Partial<IAddLlmModelRequest> }) => {
      const res = await updateLlmModel(data.id, data.payload);
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['llm-models'] });
    },
  });
};

export const useRemoveLlmModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await removeLlmModel(id);
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['llm-models'] });
    },
  });
};
