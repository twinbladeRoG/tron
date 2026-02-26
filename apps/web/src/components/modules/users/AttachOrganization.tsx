import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import { ActionIcon, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useAttachOrganizationToUser } from '@/apis/queries/users.queries';
import type { IOrganization } from '@/types';

import SelectOrganization from '../shared/form/SelectOrganization';

interface AttachOrganizationProps {
  organization?: IOrganization | null;
  userId: string;
}

const schema = yup.object({
  organization_id: yup.string().required('Required'),
});

const AttachOrganization: React.FC<AttachOrganizationProps> = ({ organization, userId }) => {
  const [isEditable, setIsEditable] = useState(false);

  const attachOrganization = useAttachOrganizationToUser();
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { organization_id: undefined },
  });

  const handleSubmit = form.handleSubmit((data) => {
    attachOrganization.mutate(
      { userId, organizationId: data.organization_id },
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

  if (organization) return <p className="">{organization.name}</p>;

  if (!isEditable)
    return (
      <Button size="compact-sm" onClick={() => setIsEditable(true)}>
        Set Organization
      </Button>
    );

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <Controller
        control={form.control}
        name="organization_id"
        render={({ field, fieldState }) => (
          <SelectOrganization
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <ActionIcon type="submit" size={38} className="mt-5" loading={attachOrganization.isPending}>
        <Icon icon="solar:diskette-bold-duotone" />
      </ActionIcon>
    </form>
  );
};

export default AttachOrganization;
