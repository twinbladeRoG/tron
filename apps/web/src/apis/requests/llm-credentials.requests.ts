import type { ILlmCredential, ILlmCredentialPayload } from '@/types';

import http from '../http';

export const getLlmCredentials = () => http.get<Array<ILlmCredential>>('/api/llm-credentials');

export const getLlmCredential = (id: string) =>
  http.get<ILlmCredential>(`/api/llm-credentials/${id}`);

export const addLlmCredential = (payload: ILlmCredentialPayload) =>
  http.post<ILlmCredential>('/api/llm-credentials', payload);

export const updateLlmCredential = (id: string, payload: ILlmCredentialPayload) =>
  http.patch<ILlmCredential>(`/api/llm-credentials/${id}`, payload);

export const removeLlmCredential = (id: string) =>
  http.delete<ILlmCredential>(`/api/llm-credentials/${id}`);
