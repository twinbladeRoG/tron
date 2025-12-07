export type ObjectValues<T> = T[keyof T];

export const EXTRACTION_STATUS = {
  FAILURE: 'FAILURE',
  PENDING: 'PENDING',
  RECEIVED: 'RECEIVED',
  RETRY: 'RETRY',
  REVOKED: 'REVOKED',
  STARTED: 'STARTED',
  SUCCESS: 'SUCCESS',
} as const;

export type ExtractionStatus = ObjectValues<typeof EXTRACTION_STATUS>;

export const LLM_MODEL_PROVIDERS = {
  OPEN_AI: 'openai',
  AZURE: 'azure',
  GOOGLE: 'google',
  AWS: 'aws',
  LLAMA_CPP: 'llama-cpp',
} as const;

export type LlmProvider = ObjectValues<typeof LLM_MODEL_PROVIDERS>;
