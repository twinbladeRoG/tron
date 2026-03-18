/* eslint-disable @typescript-eslint/only-throw-error */
import { redirect } from 'react-router';

import { fetchUserFeatures } from '@/apis/queries/policy.queries';
import { getActiveUser } from '@/apis/requests/auth.requests';
import { useUserStore } from '@/store';

export const featureGuard = (featureSlug: string) => async () => {
  try {
    const features = await fetchUserFeatures();
    const feature = features.find((f) => f.slug === featureSlug);

    if (!feature) throw Error('unauthorized');
    if (!feature.is_allowed) throw Error('unauthorized');
    return null;
  } catch (err) {
    if (err instanceof Error && err.message === 'unauthorized') throw redirect('/unauthorized');
    throw redirect('/login');
  }
};

export const authGuard =
  (options?: { optional?: boolean; redirectIfAuthenticated?: string }) => async () => {
    try {
      const res = await getActiveUser();
      useUserStore.getState().updateUser(res);
    } catch {
      if (options?.optional) return null;
      throw redirect('/login');
    }

    if (options?.redirectIfAuthenticated) throw redirect(options.redirectIfAuthenticated);

    return null;
  };
