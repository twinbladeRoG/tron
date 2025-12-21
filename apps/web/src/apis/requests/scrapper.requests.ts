import type { IScrapeResult } from '@/types';

import http from '../http';

export const scrapeUrl = (url: string) => http.post<IScrapeResult>('/api/scrapper', { url });
