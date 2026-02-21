import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IPolicy } from '@/types';

import { addPolicy, deletePolicy, getPolicies } from '../requests/policy.requests';

export const usePolicies = () =>
  useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const res = await getPolicies();
      return res;
    },
  });

export const useAddPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policy: IPolicy) => {
      const res = await addPolicy(policy);
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policy: IPolicy) => {
      const res = await deletePolicy(policy);
      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};
