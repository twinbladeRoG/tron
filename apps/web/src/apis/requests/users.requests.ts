import type { IPagination, IUser, IUserExtended, IUserQueryParams } from '@/types';

import http from '../http';

export const getUsers = (params: IUserQueryParams) => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
  });

  return http.get<{ data: Array<IUserExtended>; pagination: IPagination }>(`/api/users?${query}`);
};

export const attachOrganizationToUser = (userId: string, organizationId: string) =>
  http.patch<IUser>(`/api/users/${userId}/organization`, { organization_id: organizationId });

export const attachDivisionToUser = (userId: string, divisionId: string) =>
  http.patch<IUser>(`/api/users/${userId}/division`, { division_id: divisionId });

export const attachTeamsToUser = (userId: string, teamIds: string[]) =>
  http.patch<IUser>(`/api/users/${userId}/teams`, { team_ids: teamIds });
