import { Code, Table } from '@mantine/core';

import type { IPolicy } from '@/types';

interface PolicyProps {
  policy: IPolicy;
}

const Policy: React.FC<PolicyProps> = ({ policy }) => {
  return (
    <div className="flex flex-wrap gap-4">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Subject</Table.Th>
            <Table.Th>Object</Table.Th>
            <Table.Th>Action</Table.Th>
            <Table.Th>Effect</Table.Th>
            <Table.Th>Description</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          <Table.Tr>
            <Table.Th>
              <Code>{policy.sub_rule}</Code>
            </Table.Th>
            <Table.Th>
              <Code>{policy.obj_rule}</Code>
            </Table.Th>
            <Table.Th>{policy.act}</Table.Th>
            <Table.Th>{policy.eft}</Table.Th>
            <Table.Th>{policy.description}</Table.Th>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default Policy;
