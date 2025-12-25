export interface IMessage {
  id: string;
  role: 'bot' | 'user';
  message: string;
  reason?: string;
  isLoading?: boolean;
  isError?: boolean;
  isStreaming?: boolean;
  token_usage?: ITokenUsage;
  usage?: IUsage;
  tools_calls?: Array<IToolCall>;
}

export interface ITokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  input_token_details: { audio: number; cache_read: number };
  output_token_details: { audio: number; reasoning: number };
}

export interface IUsage {
  total_tokens: number;
  prompt_tokens: number;
  prompt_tokens_cached: number;
  completion_tokens: number;
  reasoning_tokens: number;
  successful_requests: number;
  total_cost: number;
  time: number;
}

export interface IToolCall {
  name: string;
  id: string;
  type: string;
}
