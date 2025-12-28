import dayjs from 'dayjs';

import type { IConversation, IConversationQueryParams } from '@/types';

import http from '../http';

export const getUserConversations = (filter: IConversationQueryParams) => {
  const query = new URLSearchParams();
  query.append('from_date', dayjs(filter.from_date).toISOString());

  return http.get<Array<IConversation>>(`/api/conversations?${query}`);
};
