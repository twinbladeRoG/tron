import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import { Button, Card, Skeleton, Table } from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import * as yup from 'yup';

import { useUsageLogs } from '@/apis/queries/usage-logs.queries';
import { cn, formatDuration } from '@/lib/utils';
import type { IUsageLogQueryParams } from '@/types';

import LlmModelSelect from '../shared/form/LlmModelSelect';

interface UsageLogsProps {
  className?: string;
}

const schema = yup.object({
  model: yup.string().required('Required'),
  duration: yup.tuple([yup.date().nullable(), yup.date().nullable()]),
});

const UsageLogs: React.FC<UsageLogsProps> = ({ className }) => {
  const [query, setQuery] = useState<IUsageLogQueryParams | undefined>(undefined);
  const form = useForm({ resolver: yupResolver(schema), defaultValues: {} });
  const queryClient = useQueryClient();

  const logs = useUsageLogs(query);

  const handleSubmit = form.handleSubmit(async (data) => {
    const payload: IUsageLogQueryParams = { model_name: data.model };

    if (data.duration?.[0] && data.duration?.[1]) {
      payload.from_date = dayjs(data.duration[0]).startOf('day').toDate();
      payload.to_date = dayjs(data.duration[1]).endOf('day').toDate();
    }

    setQuery(payload);

    await queryClient.invalidateQueries({ queryKey: ['usage-logs', payload] });
  });

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
    });
  }, []);

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
    });
  }, []);

  return (
    <div className={cn(className)}>
      <form
        className="mb-7 flex flex-col gap-4 rounded-2xl p-4 md:flex-row dark:bg-slate-950"
        onSubmit={handleSubmit}>
        <Controller
          control={form.control}
          name="model"
          render={({ field, fieldState }) => (
            <LlmModelSelect
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              variant="default"
              size="sm"
              w={180}
            />
          )}
        />

        <Controller
          control={form.control}
          name="duration"
          render={({ field, fieldState }) => (
            <DatePickerInput
              type="range"
              placeholder="Pick dates range"
              maxDate={dayjs().toDate()}
              allowSingleDateInRange
              presets={[
                {
                  value: [
                    dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
                    dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
                  ],
                  label: 'Yesterday',
                },
                {
                  value: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
                  label: 'Today',
                },
                {
                  value: [
                    dayjs().startOf('month').format('YYYY-MM-DD'),
                    dayjs().endOf('month').format('YYYY-MM-DD'),
                  ],
                  label: 'This month',
                },
              ]}
              value={field.value as DatesRangeValue}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Button
          type="submit"
          radius="md"
          rightSection={<Icon icon="solar:minimalistic-magnifer-bold-duotone" />}
          ml="auto">
          Search
        </Button>
      </form>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          Total Tokens:{' '}
          <strong>
            {numberFormatter.format(
              (logs.data ?? []).reduce((acc, val) => acc + val.total_tokens, 0)
            )}
          </strong>
        </Card>
        <Card>
          Total Time:{' '}
          <strong>
            {formatDuration((logs.data ?? []).reduce((acc, val) => acc + val.time, 0))}
          </strong>
        </Card>
        <Card>
          Total Cost:{' '}
          <strong>
            {currencyFormatter.format(
              (logs.data ?? []).reduce((acc, val) => acc + val.total_cost, 0)
            )}
          </strong>
        </Card>
      </div>

      <Table.ScrollContainer minWidth={500}>
        <Table stickyHeader stickyHeaderOffset={0}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="whitespace-nowrap">Total Tokens</Table.Th>
              <Table.Th className="whitespace-nowrap">Prompt Tokens</Table.Th>
              <Table.Th className="whitespace-nowrap">Completion Tokens</Table.Th>
              <Table.Th className="whitespace-nowrap">Reasoning Tokens</Table.Th>
              <Table.Th className="whitespace-nowrap">Time</Table.Th>
              <Table.Th className="whitespace-nowrap">Total Cost</Table.Th>
              <Table.Th className="whitespace-nowrap">Used On</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {logs.isFetching ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Skeleton h={40} mb="xs" />
                  <Skeleton h={40} mb="xs" />
                  <Skeleton h={40} mb="xs" />
                </Table.Td>
              </Table.Tr>
            ) : (
              logs.data?.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>{log.total_tokens}</Table.Td>
                  <Table.Td>{log.prompt_tokens}</Table.Td>
                  <Table.Td>{log.completion_tokens}</Table.Td>
                  <Table.Td>{log.reasoning_tokens}</Table.Td>
                  <Table.Td>{formatDuration(log.time)}</Table.Td>
                  <Table.Td>{currencyFormatter.format(log.total_cost)}</Table.Td>
                  <Table.Td className="whitespace-nowrap">
                    {dayjs(log.end_time).format('h:mm:ss a, DD MMM YYYY')}
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </div>
  );
};

export default UsageLogs;
