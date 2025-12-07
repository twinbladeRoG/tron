import type { IAddLlmModelRequest, ILlmModel } from '@/types';

import http from '../http';

export const getLlmModels = () => http.get<Array<ILlmModel>>('/api/llm-models');

export const addLlmModel = (data: IAddLlmModelRequest) =>
  http.post<ILlmModel>('/api/llm-models', data);

export const updateLlmModel = (id: string, data: Partial<IAddLlmModelRequest>) =>
  http.patch<ILlmModel>(`/api/llm-models/${id}`, data);

export const removeLlmModel = (id: string) => http.delete<ILlmModel>(`/api/llm-models/${id}`);
