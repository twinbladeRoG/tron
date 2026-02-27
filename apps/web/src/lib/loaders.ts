/* eslint-disable @typescript-eslint/only-throw-error */
import { redirect } from 'react-router';

import { fetchUserFeatures } from '@/apis/queries/policy.queries';

export const protectedLoader = (featureSlug: string) => async () => {
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
