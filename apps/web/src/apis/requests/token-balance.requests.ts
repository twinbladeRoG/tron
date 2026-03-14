import type { ITokenBalance } from '@/types';

import http from '../http';

export const getUserTokenBalanceForModel = (modelId: string) =>
  http.get<Array<ITokenBalance>>(`/api/token-balance/model/${modelId}`);
