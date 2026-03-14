import type {
  ICreateUserTokenBucketRequest,
  IModelBucketQueryParams,
  IPagination,
  ITokenBucket,
  ITokenBucketWithSubject,
  ITokenUsageForModel,
  WithoutBase,
} from '@/types';

import http from '../http';

export const getUserBucketsForModel = (modelId: string) =>
  http.get<Array<ITokenBucket>>(`/api/token-buckets/model/${modelId}`);

export const createBucketForUser = (userId: string, data: ICreateUserTokenBucketRequest) =>
  http.post<ITokenBucket>(`/api/token-buckets/user/${userId}`, data);

export const getBucketsForUser = (userId: string, modelId: string) =>
  http.get<Array<ITokenBucket>>(`/api/token-buckets/user/${userId}/model/${modelId}`);

export const getTokenUsageForModel = (modelId: string) =>
  http.get<ITokenUsageForModel>(`/api/token-buckets/usage/${modelId}`);

export const getModelBuckets = (modelId: string, params: IModelBucketQueryParams) => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  if (params?.subject_type) query.append('subject_type', params.subject_type);
  if (params?.subject_id) query.append('subject_id', params.subject_id);
  if (params?.period_type) query.append('?.period_type', params?.period_type);

  return http.get<{ data: Array<ITokenBucketWithSubject>; pagination: IPagination }>(
    `/api/token-buckets/models/${modelId}?${query}`
  );
};

export const createBucket = (data: WithoutBase<ITokenBucket>) =>
  http.post<ITokenBucket>(`/api/token-buckets/`, data);
