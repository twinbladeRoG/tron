import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import { ActionIcon, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useAttachTeamsToUser } from '@/apis/queries/users.queries';
import type { ITeam } from '@/types';

import SelectTeams from '../shared/form/SelectTeams';

interface AttachTeamsProps {
  teams?: Array<ITeam> | null;
  userId: string;
}

const schema = yup.object({
  team_ids: yup.array().of(yup.string().required()),
});

const AttachTeams: React.FC<AttachTeamsProps> = ({ teams, userId }) => {
  const [isEditable, setIsEditable] = useState(false);

  const attachTeams = useAttachTeamsToUser();
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { team_ids: teams?.map((t) => t.id) ?? [] },
  });

  const handleSubmit = form.handleSubmit((data) => {
    attachTeams.mutate(
      { userId, teamIds: data.team_ids ?? [] },
      {
        onSuccess: () => {
          setIsEditable(false);
        },
        onError: (err) => {
          notifications.show({
            message: err.message,
            color: 'red',
          });
        },
      }
    );
  });

  if (!isEditable)
    return (
      <div className="flex items-center">
        {teams?.length ? (
          <div className="flex flex-wrap gap-2">
            {teams.map((t) => (
              <Badge variant="light" key={t.id}>
                {t.name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="opacity-50">Not part of any team</p>
        )}
        <ActionIcon variant="subtle" onClick={() => setIsEditable(true)}>
          <Icon icon="solar:pen-new-round-bold-duotone" />
        </ActionIcon>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <Controller
        control={form.control}
        name="team_ids"
        render={({ field, fieldState }) => (
          <SelectTeams
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <ActionIcon type="submit" size={38} className="mt-5" loading={attachTeams.isPending}>
        <Icon icon="solar:diskette-bold-duotone" />
      </ActionIcon>
    </form>
  );
};

export default AttachTeams;
