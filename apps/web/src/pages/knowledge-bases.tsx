import { Button, Drawer, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import CreateKnowledgeBase from '@/components/modules/knowledge-bases/CreateKnowledgeBase';
import KnowledgeBaseTable from '@/components/modules/knowledge-bases/KnowledgeBaseTable';

const KnowledgeBasesPage = () => {
  const [opened, handler] = useDisclosure();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Title order={4}>Knowledge Base</Title>

        <Button type="button" onClick={handler.open}>
          Add
        </Button>
      </div>

      <KnowledgeBaseTable />

      <Drawer
        opened={opened}
        onClose={handler.close}
        title="Create Knowledge Base"
        position="right">
        <CreateKnowledgeBase onSubmit={handler.close} />
      </Drawer>
    </div>
  );
};

export default KnowledgeBasesPage;
