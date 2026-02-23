import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

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

export const useOrganizationsInfiniteQuery = (search?: string) =>
  useInfiniteQuery({
    queryKey: ['organizations-infinite', search],
    queryFn: async ({ pageParam = 0 }) => getOrganizations({ page: pageParam, limit: 5 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.total_pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
