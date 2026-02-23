import { Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import AddOrganization from './AddOrganization';
import OrganizationTable from './OrganizationTable';

const Organizations = () => {
  const [opened, handler] = useDisclosure();

  return (
    <div>
      <div className="flex">
        <Button ml="auto" onClick={handler.open}>
          Add
        </Button>
      </div>

      <OrganizationTable />

      <Drawer position="right" opened={opened} onClose={handler.close} title="Add Organization">
        <AddOrganization onSubmit={handler.close} />
      </Drawer>
    </div>
  );
};

export default Organizations;
