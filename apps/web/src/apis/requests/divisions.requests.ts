import type { IDivision, IDivisionQueryParams, IPagination, WithoutBase } from '@/types';

import http from '../http';

export const getDivisions = (params: IDivisionQueryParams) => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  return http.get<{ data: Array<IDivision>; pagination: IPagination }>(`/api/divisions?${query}`);
};

export const getDivision = (id: string) => http.get<IDivision>(`/api/divisions/${id}`);

export const createDivision = (payload: WithoutBase<IDivision>) =>
  http.post<IDivision>(`/api/divisions`, payload);

export const updateDivision = (id: string, payload: Partial<WithoutBase<IDivision>>) =>
  http.patch<IDivision>(`/api/divisions/${id}`, payload);

export const removeDivision = (id: string) => http.delete<IDivision>(`/api/divisions/${id}`);
