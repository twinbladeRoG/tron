import React, { type Dispatch, type SetStateAction, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Anchor, Badge, Checkbox, Skeleton, Table, Tooltip } from '@mantine/core';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';

import { useKnowledgeBaseFiles } from '@/apis/queries/knowledge-base.queries';
import {
  bytesToSize,
  cn,
  getFileIcon,
  getFileIconColor,
  getFileProcessingStatusColor,
} from '@/lib/utils';
import type { IKnowledgeBaseFileWithLink } from '@/types';

import FileAction from './FileAction';

interface KnowledgeBaseFilesProps {
  className?: string;
  knowledgeBaseId: string;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
}

const columnHelper = createColumnHelper<IKnowledgeBaseFileWithLink>();

const API_URL = import.meta.env.VITE_API_URL;

const KnowledgeBaseFiles: React.FC<KnowledgeBaseFilesProps> = ({
  className,
  knowledgeBaseId,
  rowSelection,
  setRowSelection,
}) => {
  const files = useKnowledgeBaseFiles(knowledgeBaseId);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),
      columnHelper.accessor('filename', {
        header: 'File',
        cell: (info) => (
          <Anchor
            target="_blank"
            href={`${API_URL}/api/file-storage/view/${info.getValue()}`}
            title={info.getValue()}>
            <div className="flex items-center gap-2">
              <Icon
                icon={getFileIcon(info.row.original.content_type)}
                className={cn('text-2xl', getFileIconColor(info.row.original.content_type))}
              />
              <span className="text-sm">{info.row.original.original_filename}</span>
            </div>
          </Anchor>
        ),
      }),
      columnHelper.accessor('content_length', {
        header: 'Size',
        cell: (info) => bytesToSize(info.getValue()),
      }),
      columnHelper.accessor('created_at', {
        header: 'Uploaded On',
        cell: (info) => dayjs(info.getValue()).format('DD MMM YYYY'),
      }),
      columnHelper.accessor('is_private', {
        header: 'Access',
        cell: (info) =>
          info.getValue() ? <Badge color="red">Private</Badge> : <Badge>Public</Badge>,
      }),
      columnHelper.accessor('link.status', {
        header: 'Status',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Badge color={getFileProcessingStatusColor(info.getValue())}>{info.getValue()}</Badge>

            {info.getValue() === 'failed' && info.row.original.link.error_message ? (
              <Tooltip label={info.row.original.link.error_message} position="bottom-end">
                <Icon icon="solar:danger-bold-duotone" className="text-xl text-red-400" />
              </Tooltip>
            ) : null}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <p className="text-center">Actions</p>,
        cell: (info) => (
          <FileAction knowledgeBaseId={knowledgeBaseId} fileId={info.row.original.id} />
        ),
      }),
    ],
    [knowledgeBaseId]
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: files.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    getRowId: (row) => row.id,
  });

  return (
    <Table className={className}>
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

        {table.getRowModel().rows.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={columns.length} align="center">
              No documents uploaded yet
            </Table.Td>
          </Table.Tr>
        ) : null}

        {files.isLoading || files.isFetching ? (
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
      </Table.Tbody>
    </Table>
  );
};

export default KnowledgeBaseFiles;
