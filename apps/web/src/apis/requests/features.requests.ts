import type { IFeature, WithoutBase } from '@/types';

import http from '../http';

export const getFeatures = () => http.get<Array<IFeature>>('/api/features');

export const addFeature = (payload: WithoutBase<IFeature>) =>
  http.post<IFeature>('/api/features', payload);

export const removeFeature = (id: string) => http.delete<IFeature>(`/api/features/${id}`);
