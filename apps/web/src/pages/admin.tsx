import { useNavigate, useParams } from 'react-router';
import { Tabs } from '@mantine/core';

import Policies from '@/components/modules/acesss-control/Policies';
import Divisions from '@/components/modules/divisions/Divisions';
import Features from '@/components/modules/features/Features';
import Organizations from '@/components/modules/organizations/Organizations';
import Teams from '@/components/modules/teams/Teams';
import Users from '@/components/modules/users/Users';

const AdminPage = () => {
  const { tabValue } = useParams();
  const navigate = useNavigate();

  return (
    <Tabs
      value={tabValue}
      onChange={(value) => navigate(`/admin/${value}`)}
      classNames={{
        panel: 'mt-4',
      }}>
      <Tabs.List>
        <Tabs.Tab value="policies">Policies</Tabs.Tab>
        <Tabs.Tab value="organizations">Organizations</Tabs.Tab>
        <Tabs.Tab value="divisions">Divisions</Tabs.Tab>
        <Tabs.Tab value="teams">Teams</Tabs.Tab>
        <Tabs.Tab value="users">Users</Tabs.Tab>
        <Tabs.Tab value="features">Features</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="policies">
        <Policies />
      </Tabs.Panel>

      <Tabs.Panel value="organizations">
        <Organizations />
      </Tabs.Panel>

      <Tabs.Panel value="divisions">
        <Divisions />
      </Tabs.Panel>

      <Tabs.Panel value="teams">
        <Teams />
      </Tabs.Panel>

      <Tabs.Panel value="users">
        <Users />
      </Tabs.Panel>

      <Tabs.Panel value="features">
        <Features />
      </Tabs.Panel>
    </Tabs>
  );
};

export default AdminPage;
