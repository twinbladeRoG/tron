import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import { Button, Group, NumberInput, Radio, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useCreateBucket } from '@/apis/queries/token-bucket.queries';
import type { ILlmModel } from '@/types';

import SelectDivision from '../shared/form/SelectDivisions';
import SelectModelBucket from '../shared/form/SelectModelBucket';
import SelectOrganization from '../shared/form/SelectOrganization';
import SelectTeam from '../shared/form/SelectTeam';
import SelectUser from '../shared/form/SelectUser';

interface CreateBucketFormProps {
  className?: string;
  model: ILlmModel;
  onClose?: () => void;
}

const schema = yup.object({
  subject_type: yup.string().required('Required'),
  subject_id: yup.string().required('Required'),
  model_id: yup.string().required('Required'),
  parent_bucket_id: yup.string().nullable(),
  token_limit: yup.number().required('Required').min(0),
  period_type: yup.string().required('Required'),
});

const CreateBucketForm: React.FC<CreateBucketFormProps> = ({ className, model, onClose }) => {
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      model_id: model.id,
      token_limit: 1_00_000,
      period_type: 'monthly',
      parent_bucket_id: null,
      subject_id: undefined,
      subject_type: undefined,
    },
  });
  const createBucket = useCreateBucket();

  const handleSubmit = form.handleSubmit((data) => {
    createBucket.mutate(
      {
        subject_type: data.subject_type,
        subject_id: data.subject_id,
        model_id: data.model_id,
        token_limit: data.token_limit,
        period_type: data.period_type,
        parent_bucket_id: data.parent_bucket_id,
      },
      {
        onSuccess: () => {
          onClose?.();
        },
        onError: (err) => {
          notifications.show({ message: err.message, color: 'red' });
        },
      }
    );
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const subjectType = form.watch('subject_type');

  return (
    <form className={className} onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="subject_type"
        render={({ field, fieldState }) => (
          <Radio.Group
            mb="lg"
            value={field.value}
            onChange={(value) => {
              field.onChange(value);
              form.resetField('subject_id');
              form.resetField('parent_bucket_id', undefined);
            }}
            name={field.name}
            label="Subject Type"
            error={fieldState.error?.message}
            withAsterisk>
            <Group>
              <Radio value="user" label="User" />
              <Radio value="team" label="Team" />
              <Radio value="division" label="Division" />
              <Radio value="organization" label="Organization" />
            </Group>
          </Radio.Group>
        )}
      />

      {subjectType === 'organization' && (
        <Controller
          control={form.control}
          name="subject_id"
          render={({ field, fieldState }) => (
            <SelectOrganization
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      )}

      {subjectType === 'division' && (
        <Controller
          control={form.control}
          name="subject_id"
          render={({ field, fieldState }) => (
            <SelectDivision
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      )}

      {subjectType === 'team' && (
        <Controller
          control={form.control}
          name="subject_id"
          render={({ field, fieldState }) => (
            <SelectTeam
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      )}

      {subjectType === 'user' && (
        <Controller
          control={form.control}
          name="subject_id"
          render={({ field, fieldState }) => (
            <SelectUser
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      )}

      {subjectType !== 'organization' && (
        <Controller
          control={form.control}
          name="parent_bucket_id"
          render={({ field, fieldState }) => (
            <SelectModelBucket
              label="Select Parent Token Bucket"
              modelId={model.id}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      )}

      <Controller
        control={form.control}
        name="token_limit"
        render={({ field, fieldState }) => (
          <NumberInput
            value={field.value}
            onChange={(value) => field.onChange(+value)}
            name={field.name}
            label="Token Limit"
            mb="md"
            required
            min={0}
            allowDecimal={false}
            thousandSeparator=","
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={form.control}
        name="period_type"
        render={({ field, fieldState }) => (
          <Select
            data={['monthly']}
            value={field.value}
            onChange={field.onChange}
            name={field.name}
            label="Period Type"
            mb="md"
            required
            error={fieldState.error?.message}
          />
        )}
      />

      <Button
        fullWidth
        type="submit"
        leftSection={<Icon icon="solar:cart-bold-duotone" />}
        loading={createBucket.isPending}>
        Create
      </Button>
    </form>
  );
};

export default CreateBucketForm;
