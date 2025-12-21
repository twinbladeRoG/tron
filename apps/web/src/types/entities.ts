import type { IBaseEntity } from './common';
import type { LlmProvider } from './enums';

export interface IAgentWorkflowEdge {
  source: string;
  target: string;
}

export interface IAgentWorkflowSchemaNode {
  id: string;
  type: 'schema';
  data: string;
}

export interface IAgentWorkflowRunnableNode {
  id: string;
  type: 'runnable';
  data: {
    id: string[];
    name: string;
  };
}

export type IAgentWorkflowNode = IAgentWorkflowSchemaNode | IAgentWorkflowRunnableNode;

export interface IAgentWorkflow {
  mermaid: string;
  state: {
    nodes: Array<IAgentWorkflowNode>;
    edges: Array<IAgentWorkflowEdge>;
  };
}

export interface IUser extends IBaseEntity {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface IFile extends IBaseEntity {
  filename: string;
  content_type: string;
  content_length: number;
  original_filename: string;
  owner_id: string;
}

export interface ILlmModel extends IBaseEntity {
  name: string;
  display_name: string;
  provider: LlmProvider;
}

export interface IScrapeResult {
  result: string;
  metadata: {
    page_content: string;
    page_type: string;
    customer_persona: string;
  };
}
