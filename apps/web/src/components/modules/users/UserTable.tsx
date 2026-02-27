'use no memo'; // !HOTFIX for TanStack Table with React Compiler - https://github.com/TanStack/table/issues/5567#issuecomment-2442997182

import React, { useMemo, useState } from 'react';
import { Divider, Pagination, Select, Skeleton, Table } from '@mantine/core';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table';

import { useUsers } from '@/apis/queries/users.queries';
import type { IUserExtended } from '@/types';

import AttachDivision from './AttachDivision';
import AttachOrganization from './AttachOrganization';
import AttachTeams from './AttachTeams';

interface UserTableProps {
  className?: string;
}

const columnHelper = createColumnHelper<IUserExtended>();

const UserTable: React.FC<UserTableProps> = ({ className }) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const users = useUsers({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('first_name', { header: 'First Name' }),
      columnHelper.accessor('last_name', { header: 'Last Name' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('username', { header: 'Username' }),
      columnHelper.accessor('organization.name', {
        header: 'Organization',
        cell: (info) => (
          <AttachOrganization
            userId={info.row.original.id}
            organization={info.row.original.organization}
          />
        ),
      }),
      columnHelper.accessor('division.name', {
        header: 'Division',
        cell: (info) => (
          <AttachDivision userId={info.row.original.id} division={info.row.original.division} />
        ),
      }),
      columnHelper.accessor('teams', {
        header: 'Teams',
        cell: (info) => (
          <AttachTeams userId={info.row.original.id} teams={info.row.original.teams} />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <p className="text-center">Actions</p>,
        cell: () => null,
      }),
    ],
    []
  );

  const data = useMemo(() => users.data?.data ?? [], [users.data]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data,
    columns,
    rowCount: users.data?.pagination.total_count ?? 0,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    manualPagination: true,
  });

  return (
    <div className={className}>
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
          {users.isLoading ? (
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
                No documents uploaded yet
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

export default UserTable;
