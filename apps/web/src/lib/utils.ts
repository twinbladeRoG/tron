import { ReadyState } from 'react-use-websocket';
import type { DefaultMantineColor } from '@mantine/core';
import { MIME_TYPES } from '@mantine/dropzone';
import { type ClassValue, clsx } from 'clsx';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { twMerge } from 'tailwind-merge';

import {
  EXTRACTION_STATUS,
  type ExtractionStatus,
  FILE_PROCESSING_STATUS,
  type FileProcessingStatus,
  KNOWLEDGE_BASE_STATUS,
  type KnowledgeBaseStatus,
  type LlmProvider,
} from '@/types';

dayjs.extend(duration);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a given number of bytes into a human-readable string representation
 * with appropriate units (Bytes, KB, MB, GB, TB).
 *
 * @param bytes - The size in bytes to be converted.
 * @returns A string representing the size in a human-readable format.
 *          Returns "n/a" if the input is 0.
 *
 * @example
 * ```typescript
 * bytesToSize(1024); // "1.0 KB"
 * bytesToSize(1048576); // "1.0 MB"
 * bytesToSize(0); // "n/a"
 * ```
 */
export const bytesToSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return 'n/a';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i == 0) return bytes + ' ' + sizes[i];
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

export const getFileIcon = (type: string) => {
  switch (type) {
    case MIME_TYPES.pdf:
      return 'mdi:file-pdf';
    case MIME_TYPES.docx:
      return 'mdi:file-word';
    case MIME_TYPES.csv:
      return 'mdi:file-csv';
    case MIME_TYPES.xlsx:
      return 'mdi:file-excel';
    default:
      return 'mdi:file-document';
  }
};

export const getFileIconColor = (type: string) => {
  switch (type) {
    case MIME_TYPES.pdf:
      return 'text-red-400';
    case MIME_TYPES.docx:
      return 'text-blue-500';
    case MIME_TYPES.csv:
      return 'text-teal-500';
    case MIME_TYPES.xlsx:
      return 'text-green-500';
    default:
      return 'text-cyan-500';
  }
};

export const getExtractionStatusColor = (status?: ExtractionStatus | null): DefaultMantineColor => {
  switch (status) {
    case EXTRACTION_STATUS.FAILURE:
      return 'red';
    case EXTRACTION_STATUS.PENDING:
      return 'yellow';
    case EXTRACTION_STATUS.RECEIVED:
      return 'green';
    case EXTRACTION_STATUS.RETRY:
      return 'orange';
    case EXTRACTION_STATUS.REVOKED:
      return 'red';
    case EXTRACTION_STATUS.STARTED:
      return 'green';
    case EXTRACTION_STATUS.SUCCESS:
      return 'teal';
    default:
      return 'gray';
  }
};

export const formatMonths = (totalMonths: number) => {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years && months)
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  if (years) return `${years} year${years > 1 ? 's' : ''}`;
  return `${months} month${months > 1 ? 's' : ''}`;
};

export const getLlmProviderIcon = (value: LlmProvider) => {
  switch (value) {
    case 'aws':
      return 'mdi:aws';
    case 'azure':
      return 'devicon:azure';
    case 'openai':
      return 'ph:open-ai-logo-duotone';
    case 'google':
      return 'devicon:google';
    case 'llama-cpp':
      return 'simple-icons:ollama';
    default:
      return 'si:ai-duotone';
  }
};

export function formatDuration(seconds: number): string {
  const d = dayjs.duration(seconds, 'seconds');

  const h = Math.floor(d.asHours());
  const m = d.minutes();
  const s = d.seconds();
  const ms = d.milliseconds();

  const parts: string[] = [];

  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  if (s <= 0) parts.push(`${ms}ms`);
  return parts.join(' ');
}

export function safeParseJsonString<T = unknown>(value: unknown): T | null {
  if (typeof value !== 'string') return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const webSocketStatusColor = (readyState: ReadyState): DefaultMantineColor => {
  switch (readyState) {
    case ReadyState.UNINSTANTIATED:
      return 'gray';
    case ReadyState.CONNECTING:
      return 'blue';
    case ReadyState.CLOSING:
      return 'yellow';
    case ReadyState.CLOSED:
      return 'red';
    case ReadyState.OPEN:
      return 'green';
    default:
      return 'gray';
  }
};

export const getFileProcessingStatusColor = (
  status?: FileProcessingStatus
): DefaultMantineColor => {
  switch (status) {
    case FILE_PROCESSING_STATUS.PENDING:
      return 'yellow';
    case FILE_PROCESSING_STATUS.EXTRACTING:
      return 'lime';
    case FILE_PROCESSING_STATUS.EXTRACTED:
      return 'orange';
    case FILE_PROCESSING_STATUS.EMBEDDING:
      return 'grape';
    case FILE_PROCESSING_STATUS.COMPLETED:
      return 'green';
    case FILE_PROCESSING_STATUS.FAILED:
      return 'red';
    default:
      return 'gray';
  }
};

export const getKnowledgeBaseStatusColor = (status?: KnowledgeBaseStatus): DefaultMantineColor => {
  switch (status) {
    case KNOWLEDGE_BASE_STATUS.PENDING:
      return 'yellow';
    case KNOWLEDGE_BASE_STATUS.PARTIALLY_PROCESSED:
      return 'orange';
    case KNOWLEDGE_BASE_STATUS.PROCESSING:
      return 'blue';
    case KNOWLEDGE_BASE_STATUS.READY:
      return 'green';
    case KNOWLEDGE_BASE_STATUS.FAILED:
      return 'red';
    default:
      return 'gray';
  }
};

export const decimalNumberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
});

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 6,
});

export const compactNumberFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
});
