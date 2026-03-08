import React, { useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Icon } from '@iconify/react';
import { Badge, Progress } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';

import { useKnowledgeBaseFiles } from '@/apis/queries/knowledge-base.queries';
import {
  cn,
  getKnowledgeBaseStatusColor,
  safeParseJsonString,
  webSocketStatusColor,
} from '@/lib/utils';
import type { IExtractionStatus, IKnowledgeBase } from '@/types';

interface ExtractionStatusProps {
  className?: string;
  knowledgeBase: IKnowledgeBase;
  enabled?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL_BASE;

const ExtractionStatus: React.FC<ExtractionStatusProps> = ({
  enabled = false,
  className,
  knowledgeBase,
}) => {
  const queryClient = useQueryClient();
  const files = useKnowledgeBaseFiles(knowledgeBase.id);

  const progress = useMemo(() => {
    const total = files.data?.length ?? 0;
    if (!total) return 0;
    const completed = (files.data ?? []).filter((file) => file.link.status === 'completed').length;

    return (completed / total) * 100;
  }, [files.data]);

  const isReady = useMemo(() => progress === 100, [progress]);

  const { readyState } = useWebSocket(
    `ws://${API_URL}/api/knowledge-base/${knowledgeBase.id}/training-status`,
    {
      share: false,
      shouldReconnect: () => false,
      onError() {
        //
      },
      onClose: (event) => {
        if (event.reason) {
          notifications.show({
            color: 'green',
            message: event.reason,
          });
        }
      },
      async onMessage(event) {
        const message = safeParseJsonString<IExtractionStatus>(event.data);

        if (message) {
          await queryClient.invalidateQueries({
            queryKey: ['knowledge-base-files', knowledgeBase.id],
          });
          await queryClient.invalidateQueries({
            queryKey: ['knowledge-base', knowledgeBase.slug],
          });
          await queryClient.invalidateQueries({
            queryKey: ['knowledge-base', knowledgeBase.id],
          });
        }
      },
    },
    enabled
  );

  return (
    <div className={cn(className, 'flex w-full items-center gap-2')}>
      <Badge
        size="lg"
        color={webSocketStatusColor(readyState)}
        leftSection={<Icon icon="hugeicons:plug-socket" className="text-xl" />}>
        {ReadyState[readyState]}
      </Badge>

      <Badge
        size="lg"
        color={getKnowledgeBaseStatusColor(knowledgeBase.status)}
        leftSection={
          <Icon
            icon={isReady ? 'solar:check-circle-bold' : 'solar:check-circle-broken'}
            className="text-xl"
          />
        }>
        {knowledgeBase.status}
      </Badge>

      <div className="flex-1">
        <Progress.Root size="xl">
          <Progress.Section
            value={progress}
            color={isReady ? 'green' : 'blue'}
            animated={!isReady && enabled}
            striped={!isReady}>
            <Progress.Label>{Math.round(progress)}%</Progress.Label>
          </Progress.Section>
        </Progress.Root>
      </div>
    </div>
  );
};

export default ExtractionStatus;
