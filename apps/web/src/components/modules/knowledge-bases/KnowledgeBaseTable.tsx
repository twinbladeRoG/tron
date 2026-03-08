'use no memo'; // !HOTFIX for TanStack Table with React Compiler - https://github.com/TanStack/table/issues/5567#issuecomment-2442997182

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Anchor, Divider, Pagination, Select, Skeleton, Table, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table';

import { useKnowledgeBases } from '@/apis/queries/knowledge-base.queries';
import type { IKnowledgeBase } from '@/types';

import KnowledgeBaseAction from './KnowledgeBaseAction';

const columnHelper = createColumnHelper<IKnowledgeBase>();

interface KnowledgeBaseTableProps {
  className?: string;
}

const KnowledgeBaseTable: React.FC<KnowledgeBaseTableProps> = ({ className }) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 200);

  const knowledgeBases = useKnowledgeBases({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    search: debounced,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <Anchor component={Link} to={`/knowledge-bases/${info.row.original.slug}`}>
            {info.getValue()}
          </Anchor>
        ),
      }),
      columnHelper.accessor('description', { header: 'Description' }),
      columnHelper.accessor('slug', { header: 'Slug' }),
      columnHelper.accessor('status', { header: 'Status' }),
      columnHelper.display({
        id: 'actions',
        header: () => <p className="text-center">Actions</p>,
        cell: (info) => <KnowledgeBaseAction knowledgeBase={info.row.original} />,
      }),
    ],
    []
  );

  const data = useMemo(() => knowledgeBases.data?.data ?? [], [knowledgeBases.data]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data,
    columns,
    rowCount: knowledgeBases.data?.pagination.total_count ?? 0,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    manualPagination: true,
  });

  return (
    <div className={className}>
      <div className="flex flex-col gap-x-4 md:flex-row md:items-center">
        <TextInput
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          size="sm"
          radius="lg"
          mb="md"
          placeholder="Search..."
          className="flex-1"
        />
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

          {knowledgeBases.isLoading || knowledgeBases.isFetching ? (
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
                No items
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
    </div>
  );
};

export default KnowledgeBaseTable;
