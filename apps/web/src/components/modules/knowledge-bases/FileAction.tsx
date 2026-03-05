import React from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { useRemoveFileFromKnowledgeBase } from '@/apis/queries/knowledge-base.queries';

interface FileActionProps {
  knowledgeBaseId: string;
  fileId: string;
}

const FileAction: React.FC<FileActionProps> = ({ knowledgeBaseId, fileId }) => {
  const removeFile = useRemoveFileFromKnowledgeBase();

  const handleRemoveFile = () => {
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
        removeFile.mutate(
          { id: knowledgeBaseId, fileId },
          {
            onError: (err) => {
              notifications.show({
                color: 'red',
                message: err.message,
              });
            },
          }
        );
      },
    });
  };

  return (
    <div className="flex justify-end gap-2">
      <ActionIcon
        variant="light"
        color="red"
        disabled={removeFile.isPending}
        loading={removeFile.isPending}
        onClick={handleRemoveFile}>
        <Icon icon="mdi:trash" />
      </ActionIcon>
    </div>
  );
};

export default FileAction;
