import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Drawer, Select, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useAddLlmModel } from '@/apis/queries/llm-models.queries';
import { LLM_MODEL_PROVIDERS, type LlmProvider } from '@/types';

interface AddLlmModelProps {
  opened: boolean;
  onClose: () => void;
}

const schema = yup.object({
  name: yup.string().required('Required'),
  display_name: yup.string().required('Required'),
  provider: yup.mixed<LlmProvider>().oneOf(Object.values(LLM_MODEL_PROVIDERS)).required(),
});

const AddLlmModel: React.FC<AddLlmModelProps> = ({ opened, onClose }) => {
  const addModel = useAddLlmModel();

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', display_name: '', provider: 'openai' as LlmProvider },
  });

  const handleSubmit = form.handleSubmit((data) => {
    addModel.mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
      onError: (error) => {
        notifications.show({
          message: error.message,
          color: 'red',
        });
      },
    });
  });

  return (
    <Drawer title="Add AI Model" position="right" opened={opened} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <TextInput
          {...form.register('name')}
          label="Model Name"
          mb="lg"
          error={form.formState.errors.name?.message}
        />
        <TextInput
          {...form.register('display_name')}
          label="Display name"
          mb="lg"
          error={form.formState.errors.name?.message}
        />
        <Controller
          control={form.control}
          name="provider"
          render={({ field, fieldState }) => (
            <Select
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              data={Object.values(LLM_MODEL_PROVIDERS)}
              label="Provider"
              mb="lg"
            />
          )}
        />
        <Button fullWidth type="submit" loading={addModel.isPending}>
          Save
        </Button>
      </form>
    </Drawer>
  );
};

export default AddLlmModel;
