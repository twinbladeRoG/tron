import type { IUsageLog, IUsageLogQueryParams } from '@/types';

import http from '../http';

export const getUsageLogs = (payload: IUsageLogQueryParams) => {
  const query = new URLSearchParams({ model_name: payload.model_name });

  if (payload.from_date && payload.to_date) {
    query.append('from_date', payload.from_date.toISOString());
    query.append('to_date', payload.to_date.toISOString());
  }

  return http.get<Array<IUsageLog>>(`/api/usage-logs?${query}`);
};
