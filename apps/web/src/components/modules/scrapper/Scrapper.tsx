import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Loader, TextInput } from '@mantine/core';
import * as yup from 'yup';

import { useScrapper } from '@/apis/queries/scrapper.queries';
import type { IScrapeResult } from '@/types';

const schema = yup.object({
  url: yup.string().required('Required').url(),
});

interface ScrapperProps {
  className?: string;
}

const Scrapper: React.FC<ScrapperProps> = ({ className }) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { url: 'https://letsboing.com/' },
  });

  const scrape = useScrapper();

  const [result, setResult] = useState<IScrapeResult | null>(null);

  const handleSubmit = form.handleSubmit((data) => {
    setResult(null);
    scrape.mutate(data.url, {
      onSuccess: (data) => {
        setResult(data);
      },
    });
  });

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <TextInput
          placeholder="https://example.com"
          radius="lg"
          type="url"
          {...form.register('url')}
          disabled={scrape.isPending}
          className="flex-1"
        />
        <Button type="submit" radius="lg" loading={scrape.isPending}>
          Submit
        </Button>
      </form>

      {scrape.isPending ? (
        <div className="my-4 flex items-center gap-4">
          <p className="text-xs">Scraping website...</p>
          <Loader size="xs" />
        </div>
      ) : null}

      {result ? (
        <div className="mt-4">
          <div className="">
            <p className="">
              Page Type: <strong className="">{result.metadata.page_type}</strong>
            </p>
            <p className="">
              Page Content: <strong className="">{result.metadata.page_content}</strong>
            </p>
            <p className="">
              Customer Persona: <strong className="">{result.metadata.customer_persona}</strong>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Scrapper;
