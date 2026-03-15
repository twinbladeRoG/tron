import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Fieldset, Group, Radio, Select, Textarea, TextInput } from '@mantine/core';
import * as yup from 'yup';

import { useAddPolicy } from '@/apis/queries/policy.queries';

import SelectDivision from '../shared/form/SelectDivisions';
import SelectFeature from '../shared/form/SelectFeature';
import SelectLlmModel from '../shared/form/SelectLlmModel';
import SelectOrganization from '../shared/form/SelectOrganization';
import SelectTeam from '../shared/form/SelectTeam';
import SelectUser from '../shared/form/SelectUser';

interface AddPolicyProps {
  className?: string;
  onSubmit?: () => void;
}

const schema = yup.object({
  subjectType: yup.string().required('Required'),
  subjectId: yup.string().required('Required'),
  objectType: yup.string().required('Required'),
  objectId: yup.string().required('Required'),
  action: yup.string().required('Required'),
  condition: yup.string().required('Required'),
  effect: yup.string().required('Required'),
  description: yup.string().required('Required').trim(),
});

const AddPolicy: React.FC<AddPolicyProps> = ({ className, onSubmit }) => {
  const addPolicy = useAddPolicy();
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      subjectType: 'user',
      subjectId: undefined,
      objectType: 'feature',
      objectId: undefined,
      action: 'view',
      condition: 'True',
      effect: 'allow',
      description: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const subjectType = form.watch('subjectType');

  const objectType = form.watch('objectType');

  const handleSubmit = form.handleSubmit((data) => {
    addPolicy.mutate(
      {
        sub: `${data.subjectType}:${data.subjectId}`,
        obj: `${data.objectType}:${data.objectId}`,
        act: data.action,
        cond: data.condition,
        eft: data.effect,
        desc: data.description,
      },
      {
        onSuccess: () => {
          onSubmit?.();
        },
      }
    );
  });

  return (
    <form className={className} onSubmit={handleSubmit}>
      <Fieldset legend="Subject" mb="lg">
        <Controller
          control={form.control}
          name="subjectType"
          render={({ field, fieldState }) => (
            <Radio.Group
              mb="lg"
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                form.resetField('subjectId');
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
            name="subjectId"
            render={({ field, fieldState }) => (
              <SelectOrganization
                valueKey="slug"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
              />
            )}
          />
        )}

        {subjectType === 'division' && (
          <Controller
            control={form.control}
            name="subjectId"
            render={({ field, fieldState }) => (
              <SelectDivision
                valueKey="slug"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
              />
            )}
          />
        )}

        {subjectType === 'team' && (
          <Controller
            control={form.control}
            name="subjectId"
            render={({ field, fieldState }) => (
              <SelectTeam
                valueKey="slug"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
              />
            )}
          />
        )}

        {subjectType === 'user' && (
          <Controller
            control={form.control}
            name="subjectId"
            render={({ field, fieldState }) => (
              <SelectUser
                valueKey="username"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
              />
            )}
          />
        )}
      </Fieldset>

      <Fieldset legend="Object" mb="lg">
        <Controller
          control={form.control}
          name="objectType"
          render={({ field, fieldState }) => (
            <Radio.Group
              mb="lg"
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                form.resetField('objectId');
              }}
              name={field.name}
              label="Subject Type"
              error={fieldState.error?.message}
              withAsterisk>
              <Group>
                <Radio value="feature" label="Feature" />
                <Radio value="model" label="LLM Model" />
              </Group>
            </Radio.Group>
          )}
        />

        {objectType === 'feature' && (
          <Controller
            control={form.control}
            name="objectId"
            render={({ field, fieldState }) => (
              <SelectFeature
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
                valueKey="slug"
              />
            )}
          />
        )}

        {objectType === 'model' && (
          <Controller
            control={form.control}
            name="objectId"
            render={({ field, fieldState }) => (
              <SelectLlmModel
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                required
                valueKey="name"
                w="auto"
                variant="default"
                size="md"
                allowSelectDisabledModels
              />
            )}
          />
        )}
      </Fieldset>

      <Controller
        control={form.control}
        name="action"
        render={({ field, fieldState }) => (
          <Select
            label="Action"
            data={[
              { value: 'view', label: 'View' },
              { value: 'add', label: 'Add' },
              { value: 'edit', label: 'Edit' },
              { value: 'delete', label: 'Delete' },
            ]}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            required
            mb="md"
          />
        )}
      />

      <TextInput {...form.register('condition')} label="Condition" mb="md" required />

      <Controller
        control={form.control}
        name="effect"
        render={({ field, fieldState }) => (
          <Select
            label="Effect"
            data={[
              { value: 'allow', label: 'Allow' },
              { value: 'deny', label: 'Deny' },
            ]}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            required
            mb="md"
          />
        )}
      />

      <Textarea
        {...form.register('description')}
        required
        label="Description"
        mb="md"
        autosize
        minRows={3}
        maxRows={10}
      />

      <Button type="submit" fullWidth loading={addPolicy.isPending}>
        Submit
      </Button>
    </form>
  );
};

export default AddPolicy;
