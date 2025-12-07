import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IAddLlmModelRequest } from '@/types';

import {
  addLlmModel,
  getLlmModels,
  removeLlmModel,
  updateLlmModel,
} from '../requests/llm-models.requests';

export const useLlmModels = () =>
  useQuery({
    queryKey: ['llm-models'],
    queryFn: async () => {
      const res = await getLlmModels();
      return res;
    },
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
