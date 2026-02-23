import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useCreateDivision } from '@/apis/queries/divisions.queries';
import { cn } from '@/lib/utils';

import SelectOrganization from '../shared/form/SelectOrganization';

const schema = yup.object({
  name: yup.string().required('Required'),
  slug: yup.string().required('Required'),
  organization_id: yup.string().required('Required'),
});

interface AddDivisionProps {
  className?: string;
  onSubmit?: () => void;
}

const AddDivision: React.FC<AddDivisionProps> = ({ className, onSubmit }) => {
  const addDivision = useCreateDivision();
  const form = useForm({ resolver: yupResolver(schema), defaultValues: { name: '', slug: '' } });

  const handleSubmit = form.handleSubmit((data) => {
    addDivision.mutate(data, {
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

      <Button type="submit" fullWidth loading={addDivision.isPending}>
        Save
      </Button>
    </form>
  );
};

export default AddDivision;
