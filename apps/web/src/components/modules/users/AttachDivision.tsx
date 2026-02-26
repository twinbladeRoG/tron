import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import { ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useAttachDivisionToUser } from '@/apis/queries/users.queries';
import type { IDivision } from '@/types';

import SelectDivision from '../shared/form/SelectDivisions';

interface AttachDivisionProps {
  division?: IDivision | null;
  userId: string;
}

const schema = yup.object({
  division_id: yup.string().required('Required'),
});

const AttachDivision: React.FC<AttachDivisionProps> = ({ division, userId }) => {
  const [isEditable, setIsEditable] = useState(false);

  const attachDivision = useAttachDivisionToUser();
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { division_id: undefined },
  });

  const handleSubmit = form.handleSubmit((data) => {
    attachDivision.mutate(
      { userId, divisionId: data.division_id },
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
        {division ? (
          <p className="">
            <span className="uppercase">{division.slug}</span>, {division.name}
          </p>
        ) : (
          'Not part of any division'
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
        name="division_id"
        render={({ field, fieldState }) => (
          <SelectDivision
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <ActionIcon type="submit" size={38} className="mt-5" loading={attachDivision.isPending}>
        <Icon icon="solar:diskette-bold-duotone" />
      </ActionIcon>
      <ActionIcon
        type="button"
        size={38}
        color="red"
        variant="light"
        className="mt-5"
        disabled={attachDivision.isPending}
        onClick={() => setIsEditable(false)}>
        <Icon icon="solar:close-circle-bold-duotone" />
      </ActionIcon>
    </form>
  );
};

export default AttachDivision;
