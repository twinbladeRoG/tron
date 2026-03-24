import type { IPagination, IUsageLog, IUsageLogQueryParams } from '@/types';

import http from '../http';

export const getUsageLogs = (payload: IUsageLogQueryParams) => {
  const query = new URLSearchParams({
    page: payload.page.toString(),
    limit: payload.limit.toString(),
    model_name: payload.model_name,
  });

  if (payload.user_id) query.append('user_id', payload.user_id);

  if (payload.from_date && payload.to_date) {
    query.append('from_date', payload.from_date.toISOString());
    query.append('to_date', payload.to_date.toISOString());
  }

  return http.get<{ data: Array<IUsageLog>; pagination: IPagination }>(`/api/usage-logs?${query}`);
};
