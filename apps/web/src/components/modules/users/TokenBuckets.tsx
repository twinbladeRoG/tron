import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import { Button, Card, Divider, NumberInput, Select, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import * as yup from 'yup';

import { useUserTokenBalanceForModel } from '@/apis/queries/token-balance.queries';
import { useBucketsForUser, useCreateTokenBucket } from '@/apis/queries/token-bucket.queries';
import type { IUser } from '@/types';

import SelectLlmModel from '../shared/form/SelectLlmModel';

interface TokenBucketsProps {
  className?: string;
  user: IUser;
}

const schema = yup.object({
  token_limit: yup.number().required('Required').min(0),
  period_type: yup.string().required('Required').oneOf(['monthly']),
});

const TokenBuckets: React.FC<TokenBucketsProps> = ({ className, user }) => {
  const [modelId, setModelId] = useState<string | null | undefined>();
  const buckets = useBucketsForUser(user.id, modelId!);
  const balances = useUserTokenBalanceForModel(modelId!);
  const createBucket = useCreateTokenBucket();

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: { token_limit: 1_00_000, period_type: 'monthly' },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (!modelId) {
      notifications.show({
        message: 'Select Model first',
        color: 'red',
      });
      return;
    }

    createBucket.mutate(
      {
        userId: user.id,
        data: { model_id: modelId, period_type: data.period_type, token_limit: data.token_limit },
      },
      {
        onError: (err) => {
          notifications.show({
            message: err.message,
            color: 'red',
          });
        },
      }
    );
  });

  return (
    <div className={className}>
      <SelectLlmModel
        value={modelId}
        valueKey="id"
        onChange={(value) => setModelId(value)}
        variant="default"
        size="sm"
        classNames={{
          root: 'w-full!',
        }}
        mb="lg"
      />

      <Divider mb="lg" />

      <Text mb="lg">
        Used Token: {(balances.data ?? []).reduce((acc, val) => acc + val.used_tokens, 0)}
      </Text>

      <Divider mb="lg" />

      {modelId && buckets.data && buckets.data.length > 0 ? (
        <div className="">
          <Text mb="sm">Buckets : {buckets.data?.length}</Text>

          {buckets.data.map((bucket) => (
            <Card key={bucket.id} mb="sm">
              <Text size="sm">Token Limit: {bucket.token_limit}</Text>
              <Text size="sm">Period Type: {bucket.period_type}</Text>
              <Text size="sm">Subject Type: {bucket.subject_type}</Text>
              <Text size="sm">Subject ID: {bucket.subject_id}</Text>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Text size="sm" mb="lg" className="text-center opacity-50">
            No bucket found
          </Text>

          <form onSubmit={handleSubmit}>
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
        </div>
      )}
    </div>
  );
};

export default TokenBuckets;
