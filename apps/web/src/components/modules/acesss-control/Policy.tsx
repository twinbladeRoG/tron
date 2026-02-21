import { Icon } from '@iconify/react';
import { ActionIcon, Code, Table } from '@mantine/core';

import { useDeletePolicy } from '@/apis/queries/policy.queries';
import type { IPolicy } from '@/types';

interface PolicyProps {
  policy: IPolicy;
}

const Policy: React.FC<PolicyProps> = ({ policy }) => {
  const deletePolicy = useDeletePolicy();

  const handleDelete = () => {
    deletePolicy.mutate(policy);
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Code>{policy.sub}</Code>
      </Table.Td>
      <Table.Td>
        <Code>{policy.obj}</Code>
      </Table.Td>
      <Table.Td>{policy.act}</Table.Td>
      <Table.Td>{policy.eft}</Table.Td>
      <Table.Td>{policy.desc}</Table.Td>
      <Table.Td>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={handleDelete}
          loading={deletePolicy.isPending}>
          <Icon icon="solar:trash-bin-2-bold-duotone" />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
};

export default Policy;
