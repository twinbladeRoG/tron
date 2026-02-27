import React from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useRemoveFeature } from '@/apis/queries/features.queries';
import { useCheckFeatureAccess } from '@/apis/queries/policy.queries';
import type { IFeature } from '@/types';

interface FeatureActionsProps {
  feature: IFeature;
}

const FeatureActions: React.FC<FeatureActionsProps> = ({ feature }) => {
  const checkAccess = useCheckFeatureAccess();
  const remove = useRemoveFeature();

  const handleCheckAccess = () => {
    checkAccess.mutate(
      { feature: feature.slug },
      {
        onSuccess: (res) => {
          notifications.show({ title: 'Has Access', message: res.policy_enforced, color: 'green' });
        },
        onError: (err) => {
          notifications.show({ title: "Doesn't have access", message: err.message, color: 'red' });
        },
      }
    );
  };

  const handleRemove = () => {
    remove.mutate(feature.id, {
      onError: (err) => {
        notifications.show({
          message: err.message,
          color: 'red',
        });
      },
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip label="Check for access">
        <ActionIcon onClick={handleCheckAccess} loading={checkAccess.isPending} variant="filled">
          <Icon icon="solar:verified-check-line-duotone" />
        </ActionIcon>
      </Tooltip>

      <ActionIcon
        variant="light"
        color="red"
        disabled={remove.isPending}
        loading={remove.isPending}
        onClick={handleRemove}>
        <Icon icon="mdi:trash" />
      </ActionIcon>
    </div>
  );
};

export default FeatureActions;
