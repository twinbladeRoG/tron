'use no memo'; // !HOTFIX for TanStack Table with React Compiler - https://github.com/TanStack/table/issues/5567#issuecomment-2442997182

import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon, Badge, Skeleton, Table } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { useLlmCredentials, useRemoveLlmCredential } from '@/apis/queries/llm-credentials.queries';
import type { ILlmCredential } from '@/types';

interface LlmCredentialTableProps {
  onEdit: (credential: ILlmCredential) => void;
}

const columnHelper = createColumnHelper<ILlmCredential>();

const LlmCredentialTable: React.FC<LlmCredentialTableProps> = ({ onEdit }) => {
  const credentials = useLlmCredentials();
  const removeCredential = useRemoveLlmCredential();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor('provider', { header: 'Provider' }),
      columnHelper.accessor('has_payload', {
        header: 'Payload',
        cell: (info) => (
          <Badge color={info.getValue() ? 'green' : 'gray'} variant="light">
            {info.getValue() ? 'Stored' : 'Missing'}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <p className="text-center">Actions</p>,
        cell: (info) => (
          <div className="flex justify-center gap-2">
            <ActionIcon variant="light" onClick={() => onEdit(info.row.original)}>
              <Icon icon="solar:pen-bold-duotone" />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              loading={removeCredential.isPending}
              onClick={() =>
                removeCredential.mutate(info.row.original.id, {
                  onError: (error) =>
                    notifications.show({
                      message: error.message,
                      color: 'red',
                    }),
                })
              }>
              <Icon icon="solar:trash-bin-trash-bold-duotone" />
            </ActionIcon>
          </div>
        ),
      }),
    ],
    [onEdit, removeCredential]
  );

  const data = useMemo(() => credentials.data ?? [], [credentials.data]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
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
        {credentials.isLoading ? (
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
          </>
        ) : null}

        {!credentials.isLoading && table.getRowModel().rows.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={columns.length} align="center">
              No credentials created yet
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
  );
};

export default LlmCredentialTable;
