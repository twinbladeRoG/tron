import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  ICreateUserTokenBucketRequest,
  IModelBucketQueryParams,
  ITokenBucket,
  WithoutBase,
} from '@/types';

import {
  createBucket,
  createBucketForUser,
  getBucketsForUser,
  getModelBuckets,
  getTokenUsageForModel,
  getUserBucketsForModel,
} from '../requests/token-bucket.requests';

export const useUserTokenBuckets = (modelId: string) =>
  useQuery({
    queryKey: ['token-bucket', modelId],
    queryFn: async () => getUserBucketsForModel(modelId),
    enabled: !!modelId,
  });

export const useBucketsForUser = (userId: string, modelId: string) =>
  useQuery({
    queryKey: ['user-token-bucket', userId, modelId],
    queryFn: async () => getBucketsForUser(userId, modelId),
    enabled: !!modelId,
  });

export const useCreateTokenBucket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: ICreateUserTokenBucketRequest }) =>
      createBucketForUser(userId, data),
    onSuccess: async (_, { userId, data }) => {
      await queryClient.invalidateQueries({
        queryKey: ['user-token-bucket', userId, data.model_id],
      });
      await queryClient.invalidateQueries({
        queryKey: ['token-bucket', data.model_id],
      });
    },
  });
};

export const useTokenUsageForModel = (model: string) =>
  useQuery({
    queryKey: ['token-usage', model],
    queryFn: () => getTokenUsageForModel(model),
    enabled: !!model,
  });

export const useModelBuckets = (modelId: string, query: IModelBucketQueryParams) =>
  useQuery({
    queryKey: ['model-buckets', modelId, query],
    queryFn: () => getModelBuckets(modelId, query),
    enabled: !!modelId,
    placeholderData: keepPreviousData,
  });

export const useModelBucketsQuery = (
  modelId: string,
  query?: Omit<IModelBucketQueryParams, 'page' | 'limit'>
) =>
  useInfiniteQuery({
    queryKey: ['model-buckets-infinite', modelId, query],
    queryFn: async ({ pageParam = 0 }) =>
      getModelBuckets(modelId, { page: pageParam, limit: 6, ...query }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.total_pages - 1) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    enabled: !!modelId,
    initialPageParam: 0,
  });

export const useCreateBucket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WithoutBase<ITokenBucket>) => createBucket(data),
    onSuccess: async (_, data) => {
      await queryClient.invalidateQueries({
        queryKey: ['user-token-bucket'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['token-bucket'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['model-buckets', data.model_id],
      });
      await queryClient.invalidateQueries({
        queryKey: ['model-buckets-infinite', data.model_id],
      });
    },
  });
};
