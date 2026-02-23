import React from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useRemoveDivision } from '@/apis/queries/divisions.queries';
import type { IDivision } from '@/types';

interface DivisionTableActionsProps {
  division: IDivision;
}
const DivisionTableActions: React.FC<DivisionTableActionsProps> = ({ division: organization }) => {
  const remove = useRemoveDivision();

  const handleRemove = () => {
    remove.mutate(organization.id, {
      onError: (err) =>
        notifications.show({
          message: err.message,
          color: 'red',
        }),
    });
  };

  return (
    <div className="flex justify-center">
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

export default DivisionTableActions;
