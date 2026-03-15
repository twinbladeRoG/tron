import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import queryClient from '@/lib/query-client';
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
    mutationFn: async ({ feature, action = 'view' }: { feature: string; action?: string }) =>
      checkFeatureAccess(feature, action),
  });

const featureAccessQuery = (feature: string, action: string = 'view') => ({
  queryKey: ['feature-access', feature, action],
  queryFn: async () => checkFeatureAccess(feature, action),
  staleTime: 5 * 60 * 1000, // cached for 5 mins
});

export const useFeatureAccess = (feature: string, action: string = 'view') =>
  useQuery(featureAccessQuery(feature, action));

const fetchUserFeaturesQuery = {
  queryKey: ['user-features'],
  queryFn: async () => getUserFeatures(),
  staleTime: 5 * 60 * 1000, // cached for 5 mins
};

export const fetchUserFeatures = () => queryClient.fetchQuery(fetchUserFeaturesQuery);

export const useUserFeatures = () => useQuery(fetchUserFeaturesQuery);
