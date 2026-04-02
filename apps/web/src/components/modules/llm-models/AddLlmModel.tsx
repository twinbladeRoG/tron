import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Drawer, Select, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useLlmCredentials } from '@/apis/queries/llm-credentials.queries';
import { useAddLlmModel } from '@/apis/queries/llm-models.queries';
import { LLM_MODEL_PROVIDERS, type LlmProvider } from '@/types';

interface AddLlmModelProps {
  opened: boolean;
  onClose: () => void;
}

const schema = yup.object({
  slug: yup.string().required('Required'),
  name: yup.string().required('Required'),
  display_name: yup.string().required('Required'),
  provider: yup.mixed<LlmProvider>().oneOf(Object.values(LLM_MODEL_PROVIDERS)).required(),
  credential_id: yup.string().optional().nullable(),
});

const AddLlmModel: React.FC<AddLlmModelProps> = ({ opened, onClose }) => {
  const addModel = useAddLlmModel();
  const credentials = useLlmCredentials();

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      slug: '',
      name: '',
      display_name: '',
      provider: 'openai' as LlmProvider,
      credential_id: null,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const provider = form.watch('provider');
  const credentialId = form.watch('credential_id');

  useEffect(() => {
    if (!credentialId) return;

    const credential = credentials.data?.find((item) => item.id === credentialId);
    if (credential && credential.provider !== provider) {
      form.setValue('credential_id', null);
    }
  }, [credentialId, credentials.data, form, provider]);

  const filteredCredentials = (credentials.data ?? []).filter(
    (credential) => credential.provider === provider
  );

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
          {...form.register('slug')}
          label="Slug"
          mb="lg"
          error={form.formState.errors.slug?.message}
        />
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
          error={form.formState.errors.display_name?.message}
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
        <Controller
          control={form.control}
          name="credential_id"
          render={({ field, fieldState }) => (
            <Select
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              data={filteredCredentials.map((credential) => ({
                value: credential.id,
                label: credential.name,
              }))}
              label="Credential"
              placeholder="Use default provider credentials"
              mb="lg"
              clearable
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
