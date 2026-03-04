import React from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

import { useRemoveKnowledgeBase } from '@/apis/queries/knowledge-base.queries';
import type { IKnowledgeBase } from '@/types';

interface KnowledgeBaseActionProps {
  knowledgeBase: IKnowledgeBase;
}

const KnowledgeBaseAction: React.FC<KnowledgeBaseActionProps> = ({ knowledgeBase }) => {
  const remove = useRemoveKnowledgeBase();

  const handleRemove = () => {
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
        remove.mutate(knowledgeBase.id, {
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
        disabled={remove.isPending}
        loading={remove.isPending}
        onClick={handleRemove}>
        <Icon icon="mdi:trash" />
      </ActionIcon>
    </div>
  );
};

export default KnowledgeBaseAction;
