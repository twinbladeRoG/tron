import React from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useCheckFeatureAccess } from '@/apis/queries/policy.queries';
import type { IFeature } from '@/types';

interface FeatureActionsProps {
  feature: IFeature;
}

const FeatureActions: React.FC<FeatureActionsProps> = ({ feature }) => {
  const checkAccess = useCheckFeatureAccess();

  const handleCheckAccess = () => {
    checkAccess.mutate(feature.slug, {
      onSuccess: (res) => {
        notifications.show({ title: 'Has Access', message: res.policy_enforced, color: 'green' });
      },
      onError: (err) => {
        notifications.show({ title: "Doesn't have access", message: err.message, color: 'red' });
      },
    });
  };

  return (
    <div>
      <Tooltip label="Check for access">
        <ActionIcon onClick={handleCheckAccess} loading={checkAccess.isPending}>
          <Icon icon="solar:verified-check-line-duotone" />
        </ActionIcon>
      </Tooltip>
    </div>
  );
};

export default FeatureActions;
