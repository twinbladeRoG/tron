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

export const KNOWLEDGE_BASE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
  PARTIALLY_PROCESSED: 'partially-processed',
} as const;

export type KnowledgeBaseStatus = ObjectValues<typeof KNOWLEDGE_BASE_STATUS>;

export const FILE_PROCESSING_STATUS = {
  PENDING: 'pending',
  EXTRACTING: 'extracting',
  EXTRACTED: 'extracted',
  EMBEDDING: 'embedding',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type FileProcessingStatus = ObjectValues<typeof FILE_PROCESSING_STATUS>;
