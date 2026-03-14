import React from 'react';
import { Icon } from '@iconify/react';
import { ActionIcon, Drawer, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import type { IUser } from '@/types';

import TokenBuckets from './TokenBuckets';

interface UserActionsProps {
  user: IUser;
}

const UserActions: React.FC<UserActionsProps> = ({ user }) => {
  const [openBuckets, bucketHandler] = useDisclosure();

  return (
    <div className="">
      <Tooltip label="Token Buckets">
        <ActionIcon onClick={bucketHandler.open}>
          <Icon icon="solar:cart-bold-duotone" />
        </ActionIcon>
      </Tooltip>

      <Drawer position="right" opened={openBuckets} onClose={bucketHandler.close}>
        <TokenBuckets user={user} />
      </Drawer>
    </div>
  );
};

export default UserActions;
