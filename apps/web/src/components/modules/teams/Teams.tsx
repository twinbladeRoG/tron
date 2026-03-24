import { Button, Divider, Drawer, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import AddTeam from './AddTeam';
import TeamTable from './TeamTable';

const Teams = () => {
  const [opened, handler] = useDisclosure();

  return (
    <div>
      <div className="flex">
        <Title>Teams</Title>
        <Button ml="auto" onClick={handler.open}>
          Add
        </Button>
      </div>

      <Divider my="md" />

      <TeamTable />

      <Drawer position="right" opened={opened} onClose={handler.close} title="Add Team">
        <AddTeam onSubmit={handler.close} />
      </Drawer>
    </div>
  );
};

export default Teams;
