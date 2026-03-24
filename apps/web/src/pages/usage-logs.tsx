import { Divider, Title } from '@mantine/core';

import UsageLogs from '@/components/modules/usage-logs/UsageLogs';

const UsageLogPage = () => {
  return (
    <section className="">
      <Title mb="lg">Model Usage</Title>
      <Divider my="md" />
      <UsageLogs />
    </section>
  );
};

export default UsageLogPage;
