import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IOrganization, IOrganizationQueryParams, WithoutBase } from '@/types';

import {
  createOrganization,
  getOrganization,
  getOrganizations,
  removeOrganization,
} from '../requests/organizations.requests';

export const useOrganization = (id: string) =>
  useQuery({
    queryKey: ['organization', id],
    queryFn: async () => {
      return getOrganization(id);
    },
  });

export const useOrganizations = (query: IOrganizationQueryParams) =>
  useQuery({
    queryKey: ['organizations', query],
    queryFn: () => getOrganizations(query),
    placeholderData: keepPreviousData,
  });

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WithoutBase<IOrganization>) => createOrganization(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  });
};

export const useRemoveOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => removeOrganization(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  });
};
