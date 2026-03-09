import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Icon } from '@iconify/react';
import { Badge, Button, Divider, Loader, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import type { RowSelectionState } from '@tanstack/react-table';

import {
  useKnowledgeBase,
  useRemoveFileFromKnowledgeBase,
  useTrainKnowledgeBase,
} from '@/apis/queries/knowledge-base.queries';
import AddFiles from '@/components/modules/knowledge-bases/AddFiles';
import ExtractionStatus from '@/components/modules/knowledge-bases/ExtractionStatus';
import KnowledgeBaseFiles from '@/components/modules/knowledge-bases/KnowledgeBaseFiles';
import { KNOWLEDGE_BASE_STATUS } from '@/types';

const KnowledgeBasePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const removeFile = useRemoveFileFromKnowledgeBase();

  const knowledgeBase = useKnowledgeBase(slug ?? '');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const trainKnowledgeBase = useTrainKnowledgeBase();

  const enableSocket = useMemo(() => {
    if (knowledgeBase.data === undefined) return false;
    if (knowledgeBase.data.status === KNOWLEDGE_BASE_STATUS.PROCESSING) return true;
    return false;
  }, [knowledgeBase.data]);

  if (knowledgeBase.data === undefined) return <Loader />;

  const handleTrain = () => {
    trainKnowledgeBase.mutate(knowledgeBase.data.id, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['knowledge-base-files', knowledgeBase.data.id],
        });
        await queryClient.invalidateQueries({
          queryKey: ['knowledge-base', knowledgeBase.data.slug],
        });
        await queryClient.invalidateQueries({
          queryKey: ['knowledge-base', knowledgeBase.data.id],
        });
      },
      onError: (err) => {
        notifications.show({
          message: err.message,
          color: 'red',
        });
      },
    });
  };

  const handleDeleteAll = () => {
    modals.openConfirmModal({
      title: 'Are you sure you want to delete is file?',
      children: (
        <Text size="sm">
          This action cannot be undone. All data related to this file will be lost.
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: () => {
        Object.keys(rowSelection).forEach((fileId) => {
          removeFile.mutate(
            { id: knowledgeBase.data.id, fileId },
            {
              onSuccess: () => {
                setRowSelection({});
              },
              onError: (err) => {
                notifications.show({
                  color: 'red',
                  message: err.message,
                });
              },
            }
          );
        });
      },
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Title>{knowledgeBase.data?.name}</Title>
        <Badge>{knowledgeBase.data?.slug}</Badge>
      </div>

      <Divider mb="lg" />

      {knowledgeBase.data?.description ? (
        <p className="mb-4">{knowledgeBase.data?.description}</p>
      ) : null}

      <AddFiles
        className="mb-4"
        knowledgeBaseId={knowledgeBase.data.id}
        excludeIds={knowledgeBase.data.files.map((f) => f.id)}
      />

      <Divider mb="lg" />

      <div className="mb-4 flex justify-end gap-2">
        <Button
          leftSection={<Icon icon="solar:trash-bin-minimalistic-bold-duotone" />}
          type="button"
          color="red"
          onClick={handleDeleteAll}
          loading={removeFile.isPending}
          disabled={Object.keys(rowSelection).length === 0}>
          Remove
        </Button>
        <Button
          leftSection={<Icon icon="solar:zip-file-bold-duotone" />}
          onClick={handleTrain}
          loading={trainKnowledgeBase.isPending}
          disabled={knowledgeBase.data.files.length === 0}>
          Extract All
        </Button>
      </div>

      <ExtractionStatus
        knowledgeBase={knowledgeBase.data}
        enabled={enableSocket}
        className="mb-2"
      />

      <KnowledgeBaseFiles
        knowledgeBaseId={knowledgeBase.data.id}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
};

export default KnowledgeBasePage;
