import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useCreateOrganization } from '@/apis/queries/organizations.queries';
import { cn } from '@/lib/utils';

const schema = yup.object({
  name: yup.string().required('Required'),
  slug: yup.string().required('Required'),
});

interface AddOrganizationProps {
  className?: string;
  onSubmit?: () => void;
}

const AddOrganization: React.FC<AddOrganizationProps> = ({ className, onSubmit }) => {
  const addOrganization = useCreateOrganization();
  const form = useForm({ resolver: yupResolver(schema), defaultValues: { name: '', slug: '' } });

  const handleSubmit = form.handleSubmit((data) => {
    addOrganization.mutate(data, {
      onSuccess: () => {
        onSubmit?.();
      },
      onError: (err) =>
        notifications.show({
          message: err.message,
          color: 'red',
        }),
    });
  });

  return (
    <form onSubmit={handleSubmit} className={cn(className)}>
      <TextInput
        label="Name"
        {...form.register('name')}
        error={form.formState.errors.name?.message}
        mb="md"
      />
      <TextInput
        label="Unique slug"
        {...form.register('slug')}
        error={form.formState.errors.slug?.message}
        mb="md"
      />

      <Button type="submit" fullWidth loading={addOrganization.isPending}>
        Save
      </Button>
    </form>
  );
};

export default AddOrganization;
