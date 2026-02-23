import React from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useRemoveOrganization } from '@/apis/queries/organizations.queries';
import type { IOrganization } from '@/types';

interface OrganizationTableActionsProps {
  organization: IOrganization;
}
const OrganizationTableActions: React.FC<OrganizationTableActionsProps> = ({ organization }) => {
  const remove = useRemoveOrganization();

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

export default OrganizationTableActions;
