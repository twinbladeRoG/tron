import React from 'react';
import { Icon } from '@iconify/react';
import { Loader, Switch } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useMarkFileAsPrivate, useMarkFileAsPublic } from '@/apis/queries/file-storage.queries';
import type { IFile } from '@/types';

interface PrivacySwitchProps {
  file: IFile;
}

const PrivacySwitch: React.FC<PrivacySwitchProps> = ({ file }) => {
  const markAsPrivate = useMarkFileAsPrivate();
  const markAsPublic = useMarkFileAsPublic();

  const handleChange = () => {
    if (file.is_private) {
      markAsPublic.mutate(file.id, {
        onError: (err) => notifications.show({ message: err.message, color: 'red' }),
      });
    } else {
      markAsPrivate.mutate(file.id, {
        onError: (err) => notifications.show({ message: err.message, color: 'red' }),
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={file.is_private}
        onChange={() => handleChange()}
        size="lg"
        color="red"
        onLabel="Private"
        offLabel="Public"
        classNames={{
          trackLabel: 'w-14!',
        }}
        disabled={markAsPrivate.isPending || markAsPublic.isPending}
        thumbIcon={
          file.is_private ? (
            <Icon icon="solar:shield-keyhole-bold-duotone" className="text-base text-red-500" />
          ) : (
            <Icon
              icon="solar:shield-minimalistic-line-duotone"
              className="text-base text-green-600"
            />
          )
        }
      />

      {markAsPrivate.isPending || markAsPublic.isPending ? <Loader size="sm" /> : null}
    </div>
  );
};

export default PrivacySwitch;
