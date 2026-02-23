import { Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import AddDivision from './AddDivisions';
import DivisionTable from './DivisionTable';

const Divisions = () => {
  const [opened, handler] = useDisclosure();

  return (
    <div>
      <div className="flex">
        <Button ml="auto" onClick={handler.open}>
          Add
        </Button>
      </div>

      <DivisionTable />

      <Drawer position="right" opened={opened} onClose={handler.close} title="Add Organization">
        <AddDivision onSubmit={handler.close} />
      </Drawer>
    </div>
  );
};

export default Divisions;
