import React from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { useRemoveFile } from '@/apis/queries/file-storage.queries';
import type { IFile } from '@/types';

interface UserFileActionProps {
  file: IFile;
}

const UserFileAction: React.FC<UserFileActionProps> = ({ file }) => {
  const removeFile = useRemoveFile();

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
        removeFile.mutate(file.id, {
          onError: (err) => {
            notifications.show({
              color: 'red',
              message: err.message,
            });
          },
        });
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

export default UserFileAction;
