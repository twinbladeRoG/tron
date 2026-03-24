import { Button, Divider, Drawer, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import AddFeature from './AddFeature';
import FeatureTable from './FeatureTable';

const Features = () => {
  const [opened, handlers] = useDisclosure();

  return (
    <div>
      <div className="flex">
        <Title>Features</Title>
        <Button onClick={handlers.open} size="sm" ml="auto">
          Add
        </Button>
      </div>

      <Divider my="md" />

      <FeatureTable />

      <Drawer title="Add Feature" opened={opened} onClose={handlers.close} position="right">
        <AddFeature onSubmit={handlers.close} />
      </Drawer>
    </div>
  );
};

export default Features;
