'use no memo'; // !HOTFIX for TanStack Table with React Compiler - https://github.com/TanStack/table/issues/5567#issuecomment-2442997182

import React, { useMemo } from 'react';
import { Skeleton, Table } from '@mantine/core';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { useFeatures } from '@/apis/queries/features.queries';
import type { IFeature } from '@/types';

import FeatureActions from './FeatureActions';

interface FeatureTableProps {
  className?: string;
}

const columnHelper = createColumnHelper<IFeature>();

const FeatureTable: React.FC<FeatureTableProps> = ({ className }) => {
  const features = useFeatures();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor('slug', { header: 'Slug' }),
      columnHelper.accessor('description', { header: 'Description' }),
      columnHelper.accessor('is_active', { header: 'Active' }),
      columnHelper.display({
        id: 'actions',
        header: () => <p className="text-center">Actions</p>,
        cell: (info) => <FeatureActions feature={info.row.original} />,
      }),
    ],
    []
  );

  const data = useMemo(() => features.data ?? [], [features.data]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
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
          {features.isLoading ? (
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
    </div>
  );
};

export default FeatureTable;
