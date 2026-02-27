import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IPolicy } from '@/types';

import {
  addPolicy,
  checkFeatureAccess,
  deletePolicy,
  getPolicies,
  getUserFeatures,
} from '../requests/policy.requests';

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

export const useCheckFeatureAccess = () =>
  useMutation({
    mutationFn: async ({ feature, action = 'access' }: { feature: string; action?: string }) =>
      checkFeatureAccess(feature, action),
  });

export const useFeatureAccess = (feature: string, action: string = 'access') =>
  useQuery({
    queryKey: ['feature-access', feature, action],
    queryFn: async () => checkFeatureAccess(feature, action),
    staleTime: 5 * 60 * 1000, // cached for 5 mins
  });

export const useUserFeatures = () =>
  useQuery({
    queryKey: ['user-features'],
    queryFn: async () => getUserFeatures(),
  });
