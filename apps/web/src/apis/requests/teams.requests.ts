import type { IPagination, ITeam, ITeamExtended, ITeamQueryParams, WithoutBase } from '@/types';

import http from '../http';

export const getTeams = (params: ITeamQueryParams) => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  return http.get<{ data: Array<ITeamExtended>; pagination: IPagination }>(`/api/teams?${query}`);
};

export const getTeam = (id: string) => http.get<ITeam>(`/api/teams/${id}`);

export const createTeam = (payload: WithoutBase<ITeam>) => http.post<ITeam>(`/api/teams`, payload);

export const updateTeam = (id: string, payload: Partial<WithoutBase<ITeam>>) =>
  http.patch<ITeam>(`/api/teams/${id}`, payload);

export const removeTeam = (id: string) => http.delete<ITeam>(`/api/teams/${id}`);
