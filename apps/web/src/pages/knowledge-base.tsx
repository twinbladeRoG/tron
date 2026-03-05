import { useParams } from 'react-router';
import { Icon } from '@iconify/react';
import { Anchor, Badge, Divider, Loader, Table, Title } from '@mantine/core';
import dayjs from 'dayjs';

import { useKnowledgeBase } from '@/apis/queries/knowledge-base.queries';
import AddFiles from '@/components/modules/knowledge-bases/AddFiles';
import FileAction from '@/components/modules/knowledge-bases/FileAction';
import { bytesToSize, cn, getFileIcon, getFileIconColor } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL;

const KnowledgeBasePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const knowledgeBase = useKnowledgeBase(slug ?? '');

  if (knowledgeBase.data === undefined) return <Loader />;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Title>{knowledgeBase.data?.name}</Title>
        <Badge>{knowledgeBase.data?.slug}</Badge>
      </div>

      <Divider mb="lg" />

      {knowledgeBase.data?.description ? (
        <p className="mb-4">{knowledgeBase.data?.description}</p>
      ) : null}

      <AddFiles
        className="mb-4"
        knowledgeBaseId={knowledgeBase.data.id}
        excludeIds={knowledgeBase.data.files.map((f) => f.id)}
      />

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Size</Table.Th>
            <Table.Th>Created On</Table.Th>
            <Table.Th>Privacy</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {knowledgeBase.data?.files.map((file) => (
            <Table.Tr key={file.id}>
              <Table.Td>
                <Anchor
                  target="_blank"
                  href={`${API_URL}/api/file-storage/view/${file.filename}`}
                  title={file.filename}>
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={getFileIcon(file.content_type)}
                      className={cn('text-2xl', getFileIconColor(file.content_type))}
                    />
                    <span className="text-sm">{file.original_filename}</span>
                  </div>
                </Anchor>
              </Table.Td>
              <Table.Td>{bytesToSize(file.content_length)}</Table.Td>
              <Table.Td>{dayjs(file.created_at).format('DD MMM YYYY')}</Table.Td>
              <Table.Td>
                {file.is_private ? <Badge color="red">Private</Badge> : <Badge>Public</Badge>}
              </Table.Td>
              <Table.Td>
                <FileAction knowledgeBaseId={knowledgeBase.data.id} fileId={file.id} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default KnowledgeBasePage;
