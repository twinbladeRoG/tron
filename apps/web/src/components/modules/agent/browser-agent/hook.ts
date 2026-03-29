import { useCallback, useReducer, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';

import { getToken } from '@/apis/http';

import type { IUsage } from '../types';

import type {
  AgentEvent,
  AgentStep,
  ErrorPayload,
  IPlanItem,
  PlanPayload,
  ResultPayload,
  ScreenshotPayload,
  StepEndEvent,
  StepEndPayload,
  StepStartEvent,
  StepStartPayload,
  UsagePayload,
} from './types';

const API_URL = import.meta.env.VITE_API_URL;

type BrowserAgentRunOptions = {
  max_steps: number;
};

export interface BrowserAgentState {
  events: AgentEvent[];
  plans: IPlanItem[];
  steps: AgentStep[];
  finalResult: string | null;
  isDone: boolean;
  isStreaming: boolean;
  query: string | null;
  options: BrowserAgentRunOptions;
  usage: IUsage | undefined;
  screenshots: string[];
}

export type BrowserAgentAction =
  | { type: 'PUSH_EVENT'; payload: AgentEvent }
  | { type: 'SET_PLANS'; payload: IPlanItem[] }
  | { type: 'UPSERT_STEP'; payload: StepStartEvent | StepEndEvent }
  | { type: 'SET_FINAL_RESULT'; payload: string }
  | { type: 'SET_IS_DONE'; payload: boolean }
  | { type: 'SET_IS_STREAMING'; payload: boolean }
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_OPTIONS'; payload: BrowserAgentRunOptions }
  | { type: 'SET_USAGE'; payload: IUsage }
  | { type: 'SET_SCREENSHOTS'; payload: string[] }
  | { type: 'RESET' };

const initialState: BrowserAgentState = {
  events: [],
  plans: [],
  steps: [],
  finalResult: null,
  isDone: false,
  isStreaming: false,
  query: null,
  options: { max_steps: 7 },
  usage: undefined,
  screenshots: [],
};

function browserAgentReducer(
  state: BrowserAgentState,
  action: BrowserAgentAction
): BrowserAgentState {
  switch (action.type) {
    case 'PUSH_EVENT':
      return { ...state, events: [...state.events, action.payload] };

    case 'SET_PLANS': {
      return { ...state, plans: action.payload };
    }

    case 'UPSERT_STEP': {
      const event = action.payload;
      const exists = state.steps.some((s) => s.number === event.step);

      if (event.type === 'step_start') {
        const updated: AgentStep = {
          number: event.step,
          thought: event.thought,
          is_completed: false,
        };

        return {
          ...state,
          steps: exists
            ? state.steps.map((s) => (s.number === event.step ? { ...s, ...updated } : s))
            : [...state.steps, updated],
        };
      }

      if (event.type === 'step_end') {
        const updated: AgentStep = {
          number: event.step,
          success: event.last_action?.success,
          extracted_content: event.last_action?.extracted_content,
          urls: event.urls,
          is_completed: true,
          error: event.last_action?.error,
        };

        return {
          ...state,
          steps: exists
            ? state.steps.map((s) => (s.number === event.step ? { ...s, ...updated } : s))
            : [...state.steps, updated],
        };
      }

      return state;
    }

    case 'SET_FINAL_RESULT':
      return { ...state, finalResult: action.payload };

    case 'SET_IS_DONE':
      return { ...state, isDone: action.payload };

    case 'SET_IS_STREAMING':
      return { ...state, isStreaming: action.payload };

    case 'SET_QUERY':
      return { ...state, query: action.payload };

    case 'SET_OPTIONS':
      return { ...state, options: action.payload };

    case 'SET_USAGE':
      return { ...state, usage: action.payload };

    case 'SET_SCREENSHOTS':
      return { ...state, screenshots: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useBrowserAgent() {
  const [state, dispatch] = useReducer(browserAgentReducer, initialState);
  const abortRef = useRef<AbortController | null>(null);

  const updateOption = (value: BrowserAgentRunOptions) =>
    dispatch({ type: 'SET_OPTIONS', payload: value });

  const pushEvent = (event: AgentEvent) => dispatch({ type: 'PUSH_EVENT', payload: event });

  const pushStep = (event: StepStartEvent | StepEndEvent) => {
    switch (event.type) {
      case 'step_start': {
        const { step, thought } = event;
        dispatch({
          type: 'UPSERT_STEP',
          payload: { type: 'step_start', step, thought: thought ?? null },
        });

        break;
      }
      case 'step_end': {
        const { step, last_action, urls } = event;
        dispatch({
          type: 'UPSERT_STEP',
          payload: { type: 'step_end', step, last_action: last_action ?? null, urls: urls ?? [] },
        });
        break;
      }
      default:
        break;
    }
  };

  const run = useCallback(async (task: string, options?: BrowserAgentRunOptions) => {
    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_IS_STREAMING', payload: true });
    dispatch({ type: 'SET_QUERY', payload: task });

    const controller = new AbortController();
    abortRef.current = controller;

    await fetchEventSource(`${API_URL}/api/browser-agent/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify({ task, ...options }),
      signal: controller.signal,

      // eslint-disable-next-line @typescript-eslint/require-await
      async onopen(response) {
        if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
          return;
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          notifications.show({ color: 'red', message: 'Fatal error occurred!' });
        } else {
          notifications.show({ color: 'yellow', message: 'Retry again!' });
          dispatch({ type: 'SET_IS_STREAMING', payload: false });
        }
      },

      onmessage(msg) {
        try {
          switch (msg.event as AgentEvent['type']) {
            case 'step_start': {
              const { step, thought } = JSON.parse(msg.data) as StepStartPayload;
              const event = { type: 'step_start', step, thought } satisfies StepStartEvent;
              pushEvent(event);
              pushStep(event);
              break;
            }
            case 'step_end': {
              const { step, last_action, urls } = JSON.parse(msg.data) as StepEndPayload;
              const event = {
                type: 'step_end',
                step,
                last_action: last_action ?? null,
                urls: urls ?? [],
              } satisfies StepEndEvent;
              pushEvent(event);
              pushStep(event);
              break;
            }
            case 'result': {
              const { result } = JSON.parse(msg.data) as ResultPayload;
              pushEvent({ type: 'result', result });
              dispatch({ type: 'SET_FINAL_RESULT', payload: result });
              break;
            }
            case 'usage': {
              const { usage } = JSON.parse(msg.data) as UsagePayload;
              pushEvent({ type: 'usage', usage });
              dispatch({ type: 'SET_USAGE', payload: usage });
              break;
            }
            case 'error': {
              const { message } = JSON.parse(msg.data) as ErrorPayload;
              pushEvent({ type: 'error', message });
              notifications.show({ color: 'red', message });
              dispatch({ type: 'SET_IS_STREAMING', payload: false });
              break;
            }
            case 'plan': {
              const { plan } = JSON.parse(msg.data) as PlanPayload;
              dispatch({ type: 'SET_PLANS', payload: plan });
              break;
            }
            case 'screenshots': {
              const { screenshots } = JSON.parse(msg.data) as ScreenshotPayload;
              dispatch({ type: 'SET_SCREENSHOTS', payload: screenshots });
              break;
            }
            default:
              // eslint-disable-next-line no-console
              console.warn('[useBrowserAgent] Unknown event:', msg.event, msg.data);
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[useBrowserAgent] Failed to parse event data:', msg, err);
        }
      },

      onclose() {
        dispatch({ type: 'SET_IS_STREAMING', payload: false });
        dispatch({ type: 'SET_IS_DONE', payload: true });
      },

      onerror(_err) {
        dispatch({ type: 'SET_IS_STREAMING', payload: false });
        dispatch({ type: 'SET_IS_DONE', payload: true });
        controller.abort();
      },
    });
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: 'SET_IS_STREAMING', payload: false });
    dispatch({ type: 'SET_IS_DONE', payload: true });
  }, []);

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  return {
    ...state,
    run,
    stop,
    updateOption,
    reset,
  };
}
