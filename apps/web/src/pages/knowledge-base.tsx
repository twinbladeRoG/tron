import { useState } from 'react';
import { useParams } from 'react-router';
import { Badge, Button, Divider, Loader, Title } from '@mantine/core';
import type { RowSelectionState } from '@tanstack/react-table';

import { useKnowledgeBase } from '@/apis/queries/knowledge-base.queries';
import AddFiles from '@/components/modules/knowledge-bases/AddFiles';
import KnowledgeBaseFiles from '@/components/modules/knowledge-bases/KnowledgeBaseFiles';

const KnowledgeBasePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const knowledgeBase = useKnowledgeBase(slug ?? '');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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

      <Divider mb="lg" />

      <div className="mb-4 flex justify-end gap-2">
        <Button>Extract</Button>
      </div>

      <KnowledgeBaseFiles
        knowledgeBaseId={knowledgeBase.data.id}
        files={knowledgeBase.data.files}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
};

export default KnowledgeBasePage;
