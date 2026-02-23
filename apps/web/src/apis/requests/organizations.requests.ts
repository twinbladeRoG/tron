import type { IOrganization, IOrganizationQueryParams, IPagination, WithoutBase } from '@/types';

import http from '../http';

export const getOrganizations = (params: IOrganizationQueryParams) => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  return http.get<{ data: Array<IOrganization>; pagination: IPagination }>(
    `/api/organizations?${query}`
  );
};

export const getOrganization = (id: string) => http.get<IOrganization>(`/api/organizations/${id}`);

export const createOrganization = (payload: WithoutBase<IOrganization>) =>
  http.post<IOrganization>(`/api/organizations`, payload);

export const updateOrganization = (id: string, payload: Partial<WithoutBase<IOrganization>>) =>
  http.patch<IOrganization>(`/api/organizations/${id}`, payload);

export const removeOrganization = (id: string) =>
  http.delete<IOrganization>(`/api/organizations/${id}`);
