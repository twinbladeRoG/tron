import React from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useRemoveTeam } from '@/apis/queries/teams.queries';
import type { ITeam } from '@/types';

interface TeamTableActionsProps {
  team: ITeam;
}
const TeamTableActions: React.FC<TeamTableActionsProps> = ({ team }) => {
  const remove = useRemoveTeam();

  const handleRemove = () => {
    remove.mutate(team.id, {
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

export default TeamTableActions;
