import type { IPolicy } from '@/types';

import http from '../http';

export const addPolicy = (policy: Array<string>) =>
  http.post('/api/access-control', { params: policy });

export const getPolicies = () => http.get<Array<IPolicy>>('/api/access-control');

export const deletePolicy = (policy: Array<string>) =>
  http.delete('/api/access-control', { params: policy });
