import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { ITeam, ITeamQueryParams, WithoutBase } from '@/types';

import { createTeam, getTeam, getTeams, removeTeam } from '../requests/teams.requests';

export const useTeam = (id: string) =>
  useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      return getTeam(id);
    },
  });

export const useTeams = (query: ITeamQueryParams) =>
  useQuery({
    queryKey: ['teams', query],
    queryFn: () => getTeams(query),
    placeholderData: keepPreviousData,
  });

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WithoutBase<ITeam>) => createTeam(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
};

export const useRemoveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => removeTeam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  });
};

export const useTeamsInfiniteQuery = (search?: string) =>
  useInfiniteQuery({
    queryKey: ['team-infinite', search],
    queryFn: async ({ pageParam = 0 }) => getTeams({ page: pageParam, limit: 6 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.total_pages - 1) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
