import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useCreateKnowledgeBase } from '@/apis/queries/knowledge-base.queries';

interface CreateKnowledgeBaseProps {
  className?: string;
  onSubmit?: () => void;
}

const schema = yup.object({
  name: yup.string().required('Required').min(3).max(255),
  description: yup.string(),
});

const CreateKnowledgeBase: React.FC<CreateKnowledgeBaseProps> = ({ className, onSubmit }) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: undefined },
  });
  const create = useCreateKnowledgeBase();

  const handleSubmit = form.handleSubmit((data) => {
    create.mutate(data, {
      onSuccess: () => {
        onSubmit?.();
      },
      onError: (err) => {
        notifications.show({ message: err.message, color: 'red' });
      },
    });
  });

  return (
    <form onSubmit={handleSubmit} className={className}>
      <TextInput
        label="Name"
        placeholder="Provide a name for the Knowledge Base"
        required
        {...form.register('name')}
        error={form.formState.errors.name?.message}
        mb="lg"
      />
      <Textarea
        label="Description"
        placeholder="Provide a short description"
        {...form.register('description')}
        error={form.formState.errors.description?.message}
        mb="lg"
      />
      <Button fullWidth type="submit" loading={create.isPending}>
        Save
      </Button>
    </form>
  );
};

export default CreateKnowledgeBase;
