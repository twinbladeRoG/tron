import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useAddFeature } from '@/apis/queries/features.queries';

interface AddFeatureProps {
  className?: string;
  onSubmit?: () => void;
}

const schema = yup.object({
  name: yup.string().required('Required'),
  slug: yup.string().required('Required'),
  description: yup.string(),
  is_active: yup.boolean().required(),
});

const AddFeature: React.FC<AddFeatureProps> = ({ className, onSubmit }) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      is_active: true,
    },
  });
  const addFeature = useAddFeature();

  const handleSubmit = form.handleSubmit((data) => {
    addFeature.mutate(data, {
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
    <form className={className} onSubmit={handleSubmit}>
      <TextInput
        {...form.register('name')}
        label="Name"
        error={form.formState.errors.name?.message}
        mb="md"
      />
      <TextInput
        {...form.register('slug')}
        label="Slug"
        error={form.formState.errors.slug?.message}
        mb="md"
      />
      <Textarea
        {...form.register('description')}
        label="Description"
        error={form.formState.errors.description?.message}
        mb="md"
      />
      <Button type="submit" fullWidth>
        Save
      </Button>
    </form>
  );
};

export default AddFeature;
