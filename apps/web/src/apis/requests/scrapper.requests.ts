import type { IScrapeResult } from '@/types';

import http from '../http';

export const scrapeUrl = (url: string) => http.post<IScrapeResult>('/api/scrapper', { url });

export const discoverUrls = (url: string) =>
  http.post<Array<string>>('/api/scrapper/discover', { url });
