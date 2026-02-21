import type { IPolicy } from '@/types';

import http from '../http';

export const addPolicy = (policy: IPolicy) => http.post<IPolicy>('/api/access-control', policy);

export const getPolicies = () => http.get<Array<IPolicy>>('/api/access-control');

export const deletePolicy = (policy: IPolicy) =>
  http.delete<IPolicy>('/api/access-control', policy);
