import { useQuery } from '@tanstack/react-query';

import { getAgentWorkflow } from '../requests/agent.requests';

export const useAgentWorkflow = (model: string | null | undefined) =>
  useQuery({
    queryKey: ['agent-workflow', model],
    queryFn: async () => {
      const res = await getAgentWorkflow(model!);
      return res;
    },
    enabled: !!model,
  });
