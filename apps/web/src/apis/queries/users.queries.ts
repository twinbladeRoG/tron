import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { IUserQueryParams } from '@/types';

import {
  attachDivisionToUser,
  attachOrganizationToUser,
  attachTeamsToUser,
  getUsers,
} from '../requests/users.requests';

export const useUsers = (query: IUserQueryParams) =>
  useQuery({
    queryKey: ['users', query],
    queryFn: () => getUsers(query),
    placeholderData: keepPreviousData,
  });

export const useUsersInfiniteQuery = (search?: string) =>
  useInfiniteQuery({
    queryKey: ['users-infinite', search],
    queryFn: async ({ pageParam = 0 }) => getUsers({ page: pageParam, limit: 6 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.total_pages - 1) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

export const useAttachOrganizationToUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, organizationId }: { userId: string; organizationId: string }) =>
      attachOrganizationToUser(userId, organizationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['feature-access'] });
      await queryClient.invalidateQueries({ queryKey: ['user-features'] });
    },
  });
};

export const useAttachDivisionToUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, divisionId }: { userId: string; divisionId: string }) =>
      attachDivisionToUser(userId, divisionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['feature-access'] });
      await queryClient.invalidateQueries({ queryKey: ['user-features'] });
    },
  });
};

export const useAttachTeamsToUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, teamIds }: { userId: string; teamIds: string[] }) =>
      attachTeamsToUser(userId, teamIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['feature-access'] });
      await queryClient.invalidateQueries({ queryKey: ['user-features'] });
    },
  });
};
