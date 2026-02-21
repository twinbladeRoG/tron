import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Textarea, TextInput } from '@mantine/core';
import * as yup from 'yup';

import { useAddPolicy } from '@/apis/queries/policy.queries';

interface AddPolicyProps {
  className?: string;
  onSubmit?: () => void;
}

const schema = yup.object({
  sub: yup.string().required('Required'),
  obj: yup.string().required('Required'),
  act: yup.string().required('Required'),
  cond: yup.string().required('Required'),
  eft: yup.string().required('Required'),
  desc: yup.string().required('Required'),
});

const AddPolicy: React.FC<AddPolicyProps> = ({ className, onSubmit }) => {
  const form = useForm({ resolver: yupResolver(schema), defaultValues: {} });
  const addPolicy = useAddPolicy();

  const handleSubmit = form.handleSubmit((data) => {
    addPolicy.mutate(data, {
      onSuccess: () => {
        onSubmit?.();
      },
    });
  });

  return (
    <form className={className} onSubmit={handleSubmit}>
      <TextInput {...form.register('sub')} label="Subject" mb="md" />
      <TextInput {...form.register('obj')} label="Object" mb="md" />
      <TextInput {...form.register('act')} label="Action" mb="md" />
      <TextInput {...form.register('cond')} label="Condition" mb="md" />
      <TextInput {...form.register('eft')} label="Effect" mb="md" />
      <Textarea {...form.register('desc')} label="Description" mb="md" />

      <Button type="submit" fullWidth loading={addPolicy.isPending}>
        Submit
      </Button>
    </form>
  );
};

export default AddPolicy;
