import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, JsonInput, Select, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import {
  useCreateLlmCredential,
  useUpdateLlmCredential,
} from '@/apis/queries/llm-credentials.queries';
import {
  type ILlmCredential,
  type ILlmCredentialPayload,
  LLM_MODEL_PROVIDERS,
  type LlmProvider,
} from '@/types';

interface LlmCredentialFormProps {
  credential?: ILlmCredential | null;
  onSubmit?: () => void;
}

interface LlmCredentialFormValues {
  name: string;
  provider: LlmProvider;
  encrypted_payload: string;
}

const payloadPlaceholders: Record<LlmProvider, string> = {
  openai: '{\n  "api_key": "sk-..."\n}',
  azure:
    '{\n  "api_key": "...",\n  "azure_endpoint": "https://...openai.azure.com/",\n  "api_version": "2024-02-01"\n}',
  google:
    '{\n  "service_account_info": {\n    "type": "service_account",\n    "project_id": "...",\n    "private_key": "...",\n    "client_email": "..."\n  },\n  "project": "...",\n  "location": "us-central1",\n  "vertexai": true\n}',
  aws: '{\n  "aws_access_key_id": "...",\n  "aws_secret_access_key": "...",\n  "region_name": "us-east-1"\n}',
  'llama-cpp': '{}',
};

const defaultValues: LlmCredentialFormValues = {
  name: '',
  provider: 'openai',
  encrypted_payload: '',
};

const LlmCredentialForm: React.FC<LlmCredentialFormProps> = ({ credential, onSubmit }) => {
  const createCredential = useCreateLlmCredential();
  const updateCredential = useUpdateLlmCredential();
  const schema: yup.ObjectSchema<LlmCredentialFormValues> = yup.object({
    name: yup.string().required('Required'),
    provider: yup.mixed<LlmProvider>().oneOf(Object.values(LLM_MODEL_PROVIDERS)).required(),
    encrypted_payload: yup
      .string()
      .defined()
      .test('payload-required-on-create', 'Required', (value) => !!credential || !!value?.trim()),
  });
  const form = useForm<LlmCredentialFormValues>({
    resolver: yupResolver(schema),
    defaultValues,
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const provider = form.watch('provider');

  useEffect(() => {
    if (credential) {
      form.reset({
        name: credential.name,
        provider: credential.provider,
        encrypted_payload: '',
      });
      return;
    }

    form.reset(defaultValues);
  }, [credential, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const onError = (error: Error) =>
      notifications.show({
        message: error.message,
        color: 'red',
      });

    if (credential) {
      const payload: ILlmCredentialPayload = {
        name: data.name,
        provider: data.provider,
        ...(data.encrypted_payload.trim() ? { encrypted_payload: data.encrypted_payload } : {}),
      };

      updateCredential.mutate(
        { id: credential.id, data: payload },
        {
          onSuccess: () => onSubmit?.(),
          onError,
        }
      );
      return;
    }

    createCredential.mutate(
      {
        name: data.name,
        provider: data.provider,
        encrypted_payload: data.encrypted_payload,
      },
      {
        onSuccess: () => {
          form.reset(defaultValues);
          onSubmit?.();
        },
        onError,
      }
    );
  });

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        label="Name"
        {...form.register('name')}
        error={form.formState.errors.name?.message}
        mb="md"
      />

      <Controller
        control={form.control}
        name="provider"
        render={({ field, fieldState }) => (
          <Select
            label="Provider"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            data={Object.values(LLM_MODEL_PROVIDERS)}
            mb="md"
          />
        )}
      />

      <Controller
        control={form.control}
        name="encrypted_payload"
        render={({ field, fieldState }) => (
          <>
            <JsonInput
              label="Credential Payload"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              placeholder={payloadPlaceholders[provider]}
              mb={credential ? 'xs' : 'md'}
              validationError="Invalid JSON"
              formatOnBlur
              autosize
              minRows={4}
            />
            {credential ? (
              <Text size="sm" c="dimmed" mb="md">
                Leave this blank to keep the currently stored secret, or paste a new payload to
                replace it.
              </Text>
            ) : null}
          </>
        )}
      />

      <Button
        type="submit"
        fullWidth
        loading={createCredential.isPending || updateCredential.isPending}>
        {credential ? 'Update' : 'Save'}
      </Button>
    </form>
  );
};

export default LlmCredentialForm;
