import { listGroups } from '$lib/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  let { data: res } = await listGroups({ fetch });
  return {
    error: url.searchParams.get('error'),
    groups: res?.groups,
    admin_group: res?.admin_group
  };
};
