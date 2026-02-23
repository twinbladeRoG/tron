import { useNavigate, useParams } from 'react-router';
import { Tabs } from '@mantine/core';

import Policies from '@/components/modules/acesss-control/Policies';
import Organizations from '@/components/modules/organizations/Organizations';

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
      </Tabs.List>

      <Tabs.Panel value="policies">
        <Policies />
      </Tabs.Panel>

      <Tabs.Panel value="organizations">
        <Organizations />
      </Tabs.Panel>
    </Tabs>
  );
};

export default AdminPage;
