import { useQuery } from '@tanstack/react-query';

import { getUserTokenBalanceForModel } from '../requests/token-balance.requests';

export const useUserTokenBalanceForModel = (modelId: string) =>
  useQuery({
    queryKey: ['token-balance', modelId],
    queryFn: async () => getUserTokenBalanceForModel(modelId),
    enabled: !!modelId,
  });
