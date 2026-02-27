import { Button, Divider, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import AddLlmModel from '@/components/modules/llm-models/AddLlmModel';
import LlmModelList from '@/components/modules/llm-models/LlmModelList';
import FeatureGate from '@/components/modules/shared/FeatureGate';

const LlmModelsPage = () => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <section className="">
      <div className="flex items-center justify-between">
        <Title>AI Models</Title>

        <FeatureGate feature="scrapper" action="add">
          <Button onClick={toggle}>Add</Button>
        </FeatureGate>
      </div>
      <Divider my="md" />

      <LlmModelList />
      <AddLlmModel opened={opened} onClose={toggle} />
    </section>
  );
};

export default LlmModelsPage;
