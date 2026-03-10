import type { IAgentWorkflow } from '@/types/entities';

import http from '../http';

export const getAgentWorkflow = (model: string) =>
  http.get<IAgentWorkflow>(`/api/agent/workflow/${model}`);

export const getRagAgentWorkflow = (model: string) =>
  http.get<IAgentWorkflow>(`/api/rag/workflow/${model}`);
