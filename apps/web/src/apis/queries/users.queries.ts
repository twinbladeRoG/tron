import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
