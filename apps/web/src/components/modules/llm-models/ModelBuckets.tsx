import React, { useMemo, useState } from 'react';
import { Button, Divider, Drawer, Pagination, Select, Skeleton, Table, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table';

import { useModelBuckets } from '@/apis/queries/token-bucket.queries';
import { compactNumberFormatter } from '@/lib/utils';
import type { ILlmModel, ITokenBucketWithSubject } from '@/types';

import CreateBucketForm from './CreateBucketForm';
import ModelSubject from './ModelSubject';

interface ModelBucketsProps {
  className?: string;
  model: ILlmModel;
}

const columnHelper = createColumnHelper<ITokenBucketWithSubject>();

const ModelBuckets: React.FC<ModelBucketsProps> = ({ className, model }) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const buckets = useModelBuckets(model.id, {
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });

  const [opened, handler] = useDisclosure();

  const columns = useMemo(
    () => [
      columnHelper.accessor('subject', {
        header: 'Subject',
        cell: (info) => (
          <ModelSubject subjectType={info.row.original.subject_type} subject={info.getValue()} />
        ),
      }),
      columnHelper.accessor('token_limit', {
        header: 'Token Limit',
        cell: (info) => compactNumberFormatter.format(info.getValue()),
      }),
      columnHelper.accessor('period_type', { header: 'Period Type' }),
      columnHelper.accessor('parent_bucket_id', {
        header: 'Has Parent?',
        cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      }),
    ],
    []
  );

  const data = useMemo(() => buckets.data?.data ?? [], [buckets.data]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    rowCount: buckets.data?.pagination.total_count ?? 0,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    getRowId: (row) => row.id,
    onPaginationChange: setPagination,
    manualPagination: true,
  });

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <Title order={3}>Model Token Buckets</Title>
        <Button onClick={handler.open}>Add</Button>
      </div>
      <Table>
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
          {table.getRowModel().rows.map((row) => (
            <Table.Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}

          {buckets.isLoading || buckets.isFetching ? (
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
                No buckets found
              </Table.Td>
            </Table.Tr>
          ) : null}
        </Table.Tbody>
      </Table>

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

      <Drawer title="Create Token Bucket" position="right" opened={opened} onClose={handler.close}>
        <CreateBucketForm model={model} onClose={handler.close} />
      </Drawer>
    </div>
  );
};

export default ModelBuckets;
