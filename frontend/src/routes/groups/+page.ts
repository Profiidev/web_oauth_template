import { listGroups } from '$lib/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  const { data: res } = await listGroups({ fetch });
  return {
    admin_group: res?.admin_group,
    error: url.searchParams.get('error'),
    groups: res?.groups
  };
};
