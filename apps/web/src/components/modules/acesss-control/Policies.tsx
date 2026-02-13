import { Divider, Skeleton, Title } from '@mantine/core';

import { usePolicies } from '@/apis/queries/policy.queries';

import Policy from './Policy';

const Policies = () => {
  const policies = usePolicies();

  return (
    <section>
      <Title order={2}>Policies</Title>
      <Divider my="md" />

      {policies.isLoading ? (
        <div>
          <Skeleton h={24} />
        </div>
      ) : (
        // eslint-disable-next-line @eslint-react/no-array-index-key, react-x/no-array-index-key
        policies.data?.map((policy, i) => <Policy key={i} policy={policy} />)
      )}
    </section>
  );
};

export default Policies;
