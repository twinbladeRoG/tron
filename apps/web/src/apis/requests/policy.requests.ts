import type { IFeatureAccess, IPolicy } from '@/types';

import http from '../http';

export const addPolicy = (policy: IPolicy) => http.post<IPolicy>('/api/access-control', policy);

export const getPolicies = () => http.get<Array<IPolicy>>('/api/access-control');

export const deletePolicy = (policy: IPolicy) =>
  http.delete<IPolicy>('/api/access-control', policy);

export const checkFeatureAccess = (feature: string) =>
  http.get<{ is_allowed: boolean; policy_enforced: string }>(
    `/api/access-control/features/${feature}`
  );

export const getUserFeatures = () =>
  http.get<Array<IFeatureAccess>>(`/api/access-control/features`);
