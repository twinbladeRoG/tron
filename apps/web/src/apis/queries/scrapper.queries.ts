import { notifications } from '@mantine/notifications';
import { useMutation } from '@tanstack/react-query';

import { discoverUrls, scrapeUrl } from '../requests/scrapper.requests';

export const useScrapper = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      const res = await scrapeUrl(url);
      return res;
    },
    onError: (error) => {
      notifications.show({
        title: 'Oops! Something went wrong!',
        message: error.message,
        color: 'red',
      });
    },
  });
};

export const useDiscoverUrls = () =>
  useMutation({
    mutationFn: async (url: string) => {
      const res = await discoverUrls(url);
      return res;
    },
    onError: (error) => {
      notifications.show({
        title: 'Oops! Something went wrong!',
        message: error.message,
        color: 'red',
      });
    },
  });
