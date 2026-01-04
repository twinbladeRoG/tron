import { type ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Badge, Button, Checkbox, Loader, Skeleton, Table, Text, TextInput } from '@mantine/core';
import * as yup from 'yup';

import { useDiscoverUrls } from '@/apis/queries/scrapper.queries';
import { cn } from '@/lib/utils';

import UrlExtraction from './UrlExtraction';

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

  const discoverUrls = useDiscoverUrls();

  const [urls, setUrls] = useState<string[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [mode, setMode] = useState<'initial' | 'discovery' | 'extraction'>('initial');

  const handleSubmit = form.handleSubmit((data) => {
    setUrls([]);
    discoverUrls.mutate(data.url, {
      onSuccess: (data) => {
        setUrls(data);
        setMode('discovery');
        setSelectedUrls([]);
      },
    });
  });

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUrls(urls);
    } else {
      setSelectedUrls([]);
    }
  };

  return (
    <div className={cn(className, 'flex flex-col')}>
      <form onSubmit={handleSubmit} className="mb-7 flex gap-4">
        <TextInput
          placeholder="https://example.com"
          radius="lg"
          type="url"
          {...form.register('url')}
          disabled={discoverUrls.isPending}
          className="flex-1"
        />
        <Button type="submit" radius="lg" loading={discoverUrls.isPending}>
          Submit
        </Button>
      </form>

      {discoverUrls.isPending ? (
        <div className="my-4 flex items-center gap-4">
          <p className="text-xs">Scraping website...</p>
          <Loader size="xs" />
        </div>
      ) : null}

      {discoverUrls.isPending ? (
        <div className="">
          <Skeleton h={40} />
        </div>
      ) : (
        <div className="flex flex-col overflow-auto">
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Text size="sm">Total URLs discoverd:</Text>
              <Badge variant="light">{urls.length}</Badge>
            </div>

            <div className="flex items-center gap-3">
              <Text size="sm">Total URLs Selected:</Text>
              <Badge variant="light">{selectedUrls.length}</Badge>
            </div>

            <div className="flex justify-end gap-3"></div>
          </div>

          <UrlExtraction urls={selectedUrls} onStartExtraction={() => setMode('extraction')} />

          {mode === 'discovery' && (
            <Table.ScrollContainer minWidth={500}>
              <Table stickyHeader stickyHeaderOffset={0}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      <Checkbox onChange={handleSelectAll} />
                    </Table.Th>
                    <Table.Th>URL</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {urls.map((url) => (
                    <Table.Tr key={url}>
                      <Table.Td>
                        <Checkbox
                          checked={selectedUrls.includes(url)}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelectedUrls((prev) => [...prev, url]);
                            } else {
                              setSelectedUrls((prev) => prev.filter((i) => i !== url));
                            }
                          }}
                        />
                      </Table.Td>
                      <Table.Td>{url}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </div>
      )}

      {/* {result ? (
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
      ) : null} */}
    </div>
  );
};

export default Scrapper;
