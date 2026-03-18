import { Button, Divider, Drawer, Skeleton, Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { usePolicies } from '@/apis/queries/policy.queries';

import AddPolicy from './AddPolicy';
import Policy from './Policy';

const Policies = () => {
  const policies = usePolicies();
  const [opened, handler] = useDisclosure();

  return (
    <section>
      <div className="flex w-full justify-between">
        <Button ml="auto" onClick={handler.open}>
          Add
        </Button>
      </div>

      <Divider my="md" />

      {policies.isLoading ? (
        <div>
          <Skeleton h={24} />
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Subject</Table.Th>
                <Table.Th>Object</Table.Th>
                <Table.Th>Action</Table.Th>
                <Table.Th>Condition</Table.Th>
                <Table.Th>Effect</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {policies.data?.map((policy, i) => (
                // eslint-disable-next-line @eslint-react/no-array-index-key, react-x/no-array-index-key
                <Policy key={i} policy={policy} />
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}

      <Drawer size="lg" position="right" opened={opened} onClose={handler.close} title="Add Policy">
        <AddPolicy onSubmit={handler.close} />
      </Drawer>
    </section>
  );
};

export default Policies;
