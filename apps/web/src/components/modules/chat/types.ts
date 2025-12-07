export interface IMessage {
  id: string;
  role: 'bot' | 'user';
  message: string;
  reason?: string;
  isLoading?: boolean;
  isError?: boolean;
  isStreaming?: boolean;
  usage?: ITokenUsage;
}

export interface ITokenUsage {
  input_tokens: 22;
  output_tokens: 132;
  total_tokens: 154;
  input_token_details: { audio: 0; cache_read: 0 };
  output_token_details: { audio: 0; reasoning: 0 };
}
