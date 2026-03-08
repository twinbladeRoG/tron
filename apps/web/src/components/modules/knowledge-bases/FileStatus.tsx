import React from 'react';
import { Badge, Loader } from '@mantine/core';

import { useKnowledgeBaseFileLink } from '@/apis/queries/knowledge-base.queries';
import { getFileProcessingStatusColor } from '@/lib/utils';

interface FileStatusProps {
  knowledgeBaseId: string;
  fileId: string;
}

const FileStatus: React.FC<FileStatusProps> = ({ knowledgeBaseId, fileId }) => {
  const link = useKnowledgeBaseFileLink(knowledgeBaseId, fileId);

  return (
    <div className="flex items-center gap-2">
      {link.isFetching || link.isLoading ? (
        <Loader size="sm" />
      ) : (
        <Badge color={getFileProcessingStatusColor(link.data?.status)}>{link.data?.status}</Badge>
      )}
    </div>
  );
};

export default FileStatus;
