import type { LlmProvider } from './enums';

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ITokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface IAddLlmModelRequest {
  name: string;
  display_name: string;
  provider: LlmProvider;
}

export interface IUsageLogQueryParams {
  model_name: string;
  from_date?: Date;
  to_date?: Date;
}
