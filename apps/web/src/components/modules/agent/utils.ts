import type { IConversation } from '@/types';

export const getPathFromConversationFeature = (feat: IConversation['feature']) => {
  switch (feat) {
    case 'chat':
      return '/agent';
    case 'rag':
      return '/rag-agent';
    default:
      return '/agent';
  }
};
