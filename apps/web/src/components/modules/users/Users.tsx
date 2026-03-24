import { Divider, Title } from '@mantine/core';

import UserTable from './UserTable';

const Users = () => {
  return (
    <div>
      <Title>Users</Title>
      <Divider my="md" />
      <UserTable />
    </div>
  );
};

export default Users;
