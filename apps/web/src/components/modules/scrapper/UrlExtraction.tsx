import { useMemo, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Icon } from '@iconify/react';
import { Badge, Button, type DefaultMantineColor, Progress, Table } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { cn } from '@/lib/utils';

interface UrlExtractionProps {
  className?: string;
  urls: Array<string>;
  onStartExtraction?: () => void;
}

interface IScrapeResult {
  url: string;
  result: string;
  attributes: {
    page_type: string;
    page_content: string;
    customer_persona: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL_BASE;
const WS_URL = `ws://${API_URL}/api/scrapper/extract-attributes`;

const UrlExtraction: React.FC<UrlExtractionProps> = ({ className, urls, onStartExtraction }) => {
  const [results, setResults] = useState<Array<IScrapeResult>>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const { readyState, sendJsonMessage } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => false,
      onError() {
        //
      },
      onClose: (event) => {
        notifications.show({
          color: 'green',
          title: '',
          message: event.reason,
        });
        setIsExtracting(false);
      },
      onMessage(event) {
        const message = JSON.parse(event.data as string) as IScrapeResult;
        setResults((prev) => [...prev, message]);
      },
      onOpen: () => {
        setResults([]);
      },
    },
    urls.length > 0
  );

  const webSocketStatusColor = useMemo((): DefaultMantineColor => {
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
  }, [readyState]);

  const handleExtract = () => {
    setIsExtracting(true);

    sendJsonMessage({ urls: urls });
    onStartExtraction?.();
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob(
      ['\uFEFF' + csvContent], // BOM for Excel Unicode support
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    const headers = ['URL', 'Page Type', 'Page Content', 'Customer Persona'];

    const csvRows = [];

    csvRows.push(headers.join(','));

    results.forEach((item) => {
      const row = [
        item.url,
        item.attributes.page_type,
        item.attributes.page_content,
        item.attributes.customer_persona,
      ].map((item) => {
        const escaped = String(item).replace(/"/g, '""');
        return `"${escaped}"`;
      });

      csvRows.push(row.join(','));
    });

    downloadCSV(csvRows.join('\n'), 'URL_Attributes.csv');
  };

  return (
    <div className={cn(className, 'mb-7')}>
      <div className="mb-3 flex">
        <Badge
          color={webSocketStatusColor}
          leftSection={<Icon icon="mdi:circle" className="text-xs" />}>
          {ReadyState[readyState]}
        </Badge>

        <div className="ml-auto flex gap-3">
          <Button
            type="button"
            radius="lg"
            disabled={urls.length === 0 || readyState !== ReadyState.OPEN}
            loading={isExtracting}
            onClick={handleExtract}>
            Extract
          </Button>

          {isExtracting === false && results.length > 0 && (
            <Button
              type="button"
              radius="lg"
              leftSection={<Icon icon="solar:download-bold-duotone" />}
              onClick={handleDownload}>
              Download
            </Button>
          )}
        </div>
      </div>

      {isExtracting && (
        <Progress mb="lg" value={(results.length / urls.length) * 100 || 1} animated />
      )}

      {results.length > 0 ? (
        <Table.ScrollContainer minWidth={500}>
          <Table stickyHeader stickyHeaderOffset={0}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>URL</Table.Th>
                <Table.Th>Page Type</Table.Th>
                <Table.Th>Page Content</Table.Th>
                <Table.Th>Customer Persona</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {results.map((item) => (
                <Table.Tr key={item.url}>
                  <Table.Td>{item.url}</Table.Td>
                  <Table.Td>{item.attributes.page_type}</Table.Td>
                  <Table.Td>{item.attributes.page_content}</Table.Td>
                  <Table.Td>{item.attributes.customer_persona}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : null}
    </div>
  );
};

export default UrlExtraction;
