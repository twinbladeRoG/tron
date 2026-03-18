import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Icon } from '@iconify/react';
import { Center, SegmentedControl } from '@mantine/core';

const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tab = useMemo(() => location.pathname.split('/')?.[2], [location.pathname]);

  return (
    <div>
      <SegmentedControl
        size="lg"
        radius="lg"
        mb="lg"
        color="blue"
        value={tab}
        onChange={(value) => navigate(`/admin/${value}`)}
        classNames={{
          control: 'before:content-none!',
        }}
        data={[
          {
            label: (
              <Center className="gap-2">
                <Icon icon="solar:documents-bold-duotone" className="text-xl" />
                <span>Policies</span>
              </Center>
            ),
            value: 'policies',
          },
          {
            label: (
              <Center className="gap-2">
                <Icon icon="solar:buildings-3-bold-duotone" className="text-xl" />
                <span>Organizations</span>
              </Center>
            ),
            value: 'organizations',
          },
          {
            label: (
              <Center className="gap-2">
                <Icon icon="solar:buildings-bold-duotone" className="text-xl" />
                <span>Divisions</span>
              </Center>
            ),
            value: 'divisions',
          },
          {
            label: (
              <Center className="gap-2">
                <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-xl" />
                <span>Teams</span>
              </Center>
            ),
            value: 'teams',
          },
          {
            label: (
              <Center className="gap-2">
                <Icon icon="solar:users-group-rounded-bold-duotone" className="text-xl" />
                <span>Users</span>
              </Center>
            ),
            value: 'users',
          },
          {
            label: (
              <Center className="gap-2">
                <Icon icon="solar:crown-minimalistic-bold-duotone" className="text-xl" />
                <span>Features</span>
              </Center>
            ),
            value: 'features',
          },
          {
            label: (
              <Center className="gap-2">
                <Icon icon="si:ai-duotone" className="text-xl" />
                <span>LLM Models</span>
              </Center>
            ),
            value: 'models',
          },
          {
            label: (
              <Center className="gap-2">
                <Icon icon="solar:graph-bold-duotone" className="text-xl" />
                <span>Model Usage</span>
              </Center>
            ),
            value: 'model-usage',
          },
        ]}
      />

      <Outlet />
    </div>
  );
};

export default AdminPage;
