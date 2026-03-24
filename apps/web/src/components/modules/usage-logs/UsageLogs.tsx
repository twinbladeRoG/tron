import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import { Button, Card, Divider, Pagination, Select, Skeleton, Table } from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import * as yup from 'yup';

import { useUsageLogs } from '@/apis/queries/usage-logs.queries';
import { cn, currencyFormatter, decimalNumberFormatter, formatDuration } from '@/lib/utils';
import type { IUsageLog, IUsageLogQueryParams } from '@/types';

import SelectLlmModel from '../shared/form/SelectLlmModel';

interface UsageLogsProps {
  className?: string;
}

const schema = yup.object({
  model: yup.string().required('Required'),
  duration: yup.tuple([yup.date().nullable(), yup.date().nullable()]),
});

const columnHelper = createColumnHelper<IUsageLog>();

const UsageLogs: React.FC<UsageLogsProps> = ({ className }) => {
  const [query, setQuery] = useState<Omit<IUsageLogQueryParams, 'page' | 'limit'> | undefined>(
    undefined
  );
  const form = useForm({ resolver: yupResolver(schema), defaultValues: {} });
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const logs = useUsageLogs({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    ...query,
  } as IUsageLogQueryParams);

  const handleSubmit = form.handleSubmit(async (data) => {
    const payload: typeof query = { model_name: data.model };

    if (data.duration?.[0] && data.duration?.[1]) {
      payload.from_date = dayjs(data.duration[0]).startOf('day').toDate();
      payload.to_date = dayjs(data.duration[1]).endOf('day').toDate();
    }

    setQuery(payload);

    await queryClient.invalidateQueries({ queryKey: ['usage-logs', payload] });
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('total_tokens', {
        header: 'Total Tokens',
        cell: (info) => decimalNumberFormatter.format(info.getValue()),
      }),
      columnHelper.accessor('prompt_tokens', {
        header: 'Prompt Tokens',
        cell: (info) => decimalNumberFormatter.format(info.getValue()),
      }),
      columnHelper.accessor('completion_tokens', {
        header: 'Completion Tokens',
        cell: (info) => decimalNumberFormatter.format(info.getValue()),
      }),
      columnHelper.accessor('reasoning_tokens', {
        header: 'Reasoning Tokens',
        cell: (info) => decimalNumberFormatter.format(info.getValue()),
      }),
      columnHelper.accessor('time', {
        header: 'Time',
        cell: (info) => formatDuration(info.getValue()),
      }),
      columnHelper.accessor('total_cost', {
        header: 'Cost',
        cell: (info) => currencyFormatter.format(info.getValue()),
      }),
    ],
    []
  );

  const data = useMemo(() => logs.data?.data ?? [], [logs.data]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data,
    columns,
    rowCount: logs.data?.pagination.total_count ?? 0,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    manualPagination: true,
  });

  return (
    <div className={cn(className)}>
      <form
        className="mb-7 flex flex-col gap-4 rounded-2xl p-4 md:flex-row dark:bg-slate-950"
        onSubmit={handleSubmit}>
        <Controller
          control={form.control}
          name="model"
          render={({ field, fieldState }) => (
            <SelectLlmModel
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              variant="default"
              size="sm"
              w={180}
              allowSelectDisabledModels
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
            {decimalNumberFormatter.format(
              (logs.data?.data ?? []).reduce((acc, val) => acc + val.total_tokens, 0)
            )}
          </strong>
        </Card>
        <Card>
          Total Time:{' '}
          <strong>
            {formatDuration((logs.data?.data ?? []).reduce((acc, val) => acc + val.time, 0))}
          </strong>
        </Card>
        <Card>
          Total Cost:{' '}
          <strong>
            {currencyFormatter.format(
              (logs.data?.data ?? []).reduce((acc, val) => acc + val.total_cost, 0)
            )}
          </strong>
        </Card>
      </div>

      <Table.ScrollContainer minWidth={500}>
        <Table stickyHeader stickyHeaderOffset={0}>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>

          <Table.Tbody>
            {logs.isLoading ? (
              <>
                <Table.Tr>
                  <Table.Td colSpan={columns.length}>
                    <Skeleton height={30} radius="sm" />
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td colSpan={columns.length}>
                    <Skeleton height={30} radius="sm" />
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td colSpan={columns.length}>
                    <Skeleton height={30} radius="sm" />
                  </Table.Td>
                </Table.Tr>
              </>
            ) : null}

            {table.getRowModel().rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length} align="center">
                  No logs
                </Table.Td>
              </Table.Tr>
            ) : null}

            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Divider mb="lg" />

      <div className="flex items-center gap-4">
        <Pagination
          size="xs"
          value={pagination.pageIndex + 1}
          onChange={(value) => table.setPageIndex(value - 1)}
          total={table.getPageCount()}
        />

        <Select
          size="xs"
          w={80}
          data={['5', '10', '20', '30', '40', '50']}
          value={String(pagination.pageSize)}
          onChange={(value) => {
            if (value) table.setPageSize(+value);
          }}
        />

        <span className="ml-auto flex items-center gap-1 text-xs">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of {table.getPageCount().toLocaleString()}
          </strong>
        </span>
      </div>
    </div>
  );
};

export default UsageLogs;
