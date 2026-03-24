import { Button, Divider, Drawer, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import AddOrganization from './AddOrganization';
import OrganizationTable from './OrganizationTable';

const Organizations = () => {
  const [opened, handler] = useDisclosure();

  return (
    <div>
      <div className="flex">
        <Title>Organizations</Title>
        <Button ml="auto" onClick={handler.open}>
          Add
        </Button>
      </div>

      <Divider my="md" />

      <OrganizationTable />

      <Drawer position="right" opened={opened} onClose={handler.close} title="Add Organization">
        <AddOrganization onSubmit={handler.close} />
      </Drawer>
    </div>
  );
};

export default Organizations;
