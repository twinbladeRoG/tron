import React from 'react';

import type { IUser } from '@/types';

interface UserActionsProps {
  user: IUser;
}

const UserActions: React.FC<UserActionsProps> = ({ user: _ }) => {
  return <div className=""></div>;
};

export default UserActions;
