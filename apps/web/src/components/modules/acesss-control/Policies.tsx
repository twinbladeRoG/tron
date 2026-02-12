import { Badge, Divider, Skeleton, Title } from '@mantine/core';

import { usePolicies } from '@/apis/queries/policy.queries';

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
        policies.data?.map((policy) => (
          <div className="flex flex-wrap gap-4" key={policy.join()}>
            {policy.map((value, index) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key, react-x/no-array-index-key
              <Badge key={index}>{value}</Badge>
            ))}
          </div>
        ))
      )}
    </section>
  );
};

export default Policies;
