import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IFeature, WithoutBase } from '@/types';

import { addFeature, getFeatures, removeFeature } from '../requests/features.requests';

export const useFeatures = () =>
  useQuery({
    queryKey: ['features'],
    queryFn: async () => getFeatures(),
  });

export const useAddFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: WithoutBase<IFeature>) => addFeature(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
};

export const useRemoveFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => removeFeature(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
};
