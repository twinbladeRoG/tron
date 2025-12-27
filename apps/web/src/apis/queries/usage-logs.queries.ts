import { useQuery } from '@tanstack/react-query';

import type { IUsageLogQueryParams } from '@/types';

import { getUsageLogs } from '../requests/usage-logs.requests';

export const useUsageLogs = (query?: IUsageLogQueryParams) =>
  useQuery({
    queryKey: ['usage-logs', query],
    queryFn: async () => {
      const res = await getUsageLogs(query!);
      return res;
    },
    enabled: !!query?.model_name,
  });
