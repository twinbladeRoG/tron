import { Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import AddTeam from './AddTeam';
import TeamTable from './TeamTable';

const Teams = () => {
  const [opened, handler] = useDisclosure();

  return (
    <div>
      <div className="flex">
        <Button ml="auto" onClick={handler.open}>
          Add
        </Button>
      </div>

      <TeamTable />

      <Drawer position="right" opened={opened} onClose={handler.close} title="Add Team">
        <AddTeam onSubmit={handler.close} />
      </Drawer>
    </div>
  );
};

export default Teams;
