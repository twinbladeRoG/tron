import { useMutation, useQuery } from '@tanstack/react-query';

import {
  chatWithBrowserAgent,
  getAgentWorkflow,
  getRagAgentWorkflow,
} from '../requests/agent.requests';

export const useAgentWorkflow = (model: string | null | undefined) =>
  useQuery({
    queryKey: ['agent-workflow', model],
    queryFn: async () => {
      const res = await getAgentWorkflow(model!);
      return res;
    },
    enabled: !!model,
  });

export const useRagAgentWorkflow = (model: string | null | undefined) =>
  useQuery({
    queryKey: ['agent-workflow', model],
    queryFn: async () => {
      const res = await getRagAgentWorkflow(model!);
      return res;
    },
    enabled: !!model,
  });

export const useChatWithBrowserAgent = () =>
  useMutation({
    mutationFn: (data: string) => chatWithBrowserAgent(data),
  });
