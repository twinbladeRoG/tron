import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { IDivision, IDivisionQueryParams, WithoutBase } from '@/types';

import {
  createDivision,
  getDivision,
  getDivisions,
  removeDivision,
} from '../requests/divisions.requests';

export const useDivision = (id: string) =>
  useQuery({
    queryKey: ['division', id],
    queryFn: async () => {
      return getDivision(id);
    },
  });

export const useDivisions = (query: IDivisionQueryParams) =>
  useQuery({
    queryKey: ['divisions', query],
    queryFn: () => getDivisions(query),
    placeholderData: keepPreviousData,
  });

export const useCreateDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WithoutBase<IDivision>) => createDivision(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['divisions'] }),
  });
};

export const useRemoveDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => removeDivision(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['divisions'] }),
  });
};

export const useDivisionsInfiniteQuery = (search?: string) =>
  useInfiniteQuery({
    queryKey: ['divisions-infinite', search],
    queryFn: async ({ pageParam = 0 }) => getDivisions({ page: pageParam, limit: 6 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.total_pages - 1) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });
