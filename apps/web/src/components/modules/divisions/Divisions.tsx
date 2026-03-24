import { Button, Divider, Drawer, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import AddDivision from './AddDivisions';
import DivisionTable from './DivisionTable';

const Divisions = () => {
  const [opened, handler] = useDisclosure();

  return (
    <div>
      <div className="flex">
        <Title>Divisions</Title>
        <Button ml="auto" onClick={handler.open}>
          Add
        </Button>
      </div>

      <Divider my="md" />

      <DivisionTable />

      <Drawer position="right" opened={opened} onClose={handler.close} title="Add Division">
        <AddDivision onSubmit={handler.close} />
      </Drawer>
    </div>
  );
};

export default Divisions;
