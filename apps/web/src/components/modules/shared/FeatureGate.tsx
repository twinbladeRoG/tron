import React from 'react';

import { useFeatureAccess } from '@/apis/queries/policy.queries';

interface FeatureGateProps {
  feature: string;
  action?: string;
  fallback?: React.ReactNode;
  hide?: boolean;
  children?: React.ReactNode;
}

const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  fallback,
  hide,
  children,
  action = 'access',
}) => {
  const checkAccess = useFeatureAccess(feature, action);

  if (checkAccess.isFetching) return null;

  if (checkAccess.isError) {
    return null;
  }

  if (!checkAccess.data?.is_allowed) {
    if (hide) return null;
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default FeatureGate;
