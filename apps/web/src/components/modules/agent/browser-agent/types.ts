import type { IUsage } from '../types';

export type StepStartPayload = {
  step: number;
  thought: string | null;
};

export type StepEndPayload = {
  step: number;
  last_action: {
    is_done: boolean;
    success: boolean | null;
    extracted_content: string | null;
    error: string | null;
  } | null;
  urls: string[];
};

export type ResultPayload = {
  result: string;
};

export type UsagePayload = {
  usage: IUsage;
};

export type ErrorPayload = {
  message: string;
};

export type PlanPayload = {
  plan: Array<IPlanItem>;
};

export type ScreenshotPayload = {
  screenshots: Array<string>;
};

export type AgentEvent =
  | ({ type: 'step_start' } & StepStartPayload)
  | ({ type: 'step_end' } & StepEndPayload)
  | ({ type: 'result' } & ResultPayload)
  | ({ type: 'usage' } & UsagePayload)
  | ({ type: 'error' } & ErrorPayload)
  | ({ type: 'plan' } & PlanPayload)
  | ({ type: 'screenshots' } & ScreenshotPayload);

export type StepStartEvent = Extract<AgentEvent, { type: 'step_start' }>;
export type StepEndEvent = Extract<AgentEvent, { type: 'step_end' }>;
export type ResultEvent = Extract<AgentEvent, { type: 'result' }>;
export type UsageEvent = Extract<AgentEvent, { type: 'usage' }>;
export type ErrorEvent = Extract<AgentEvent, { type: 'error' }>;
export type PlanEvent = Extract<AgentEvent, { type: 'plan' }>;
export type ScreenshotEvent = Extract<AgentEvent, { type: 'screenshots' }>;

export interface AgentStep {
  number: number;
  thought?: string | null;
  success?: boolean | null;
  extracted_content?: string | null;
  is_completed: boolean;
  error?: string | null;
  urls?: string[];
}

export interface IPlanItem {
  text: string;
  status: 'pending' | 'current' | 'done' | 'skipped';
}
